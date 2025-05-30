import { Log , JsonRpcProvider, ethers, id, Wallet, Contract, Block, TransactionResponse} from "ethers";
import { QueueData } from "./typesData";
import { deserializeEventData, extractData, matchTopic, rescaleToken18To9, rescaleToken9To18, serializeData, startsWith, toNormalAddress, toSolanaAddress } from "./utils/utils";
import {baseAbi, polygonAbi} from "./contract/abi";
import Bull from "bull";
import dotenv from "dotenv";
import { Connection, Context, Keypair, Logs, PublicKey, sendAndConfirmRawTransaction, Transaction, TransactionInstruction } from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";


enum Chain {
    Polygon,
    Base
}

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const polygonRpcUrl = process.env.POLYGON_RPC_URL;
const baseRpcUrl = process.env.BASE_RPC_URL;
const polygonProvider = new JsonRpcProvider(polygonRpcUrl);
const baseProvider = new JsonRpcProvider(baseRpcUrl);
const polygonBridgeAddress = process.env.POLYGON_BRIDGE_ADDRESS;
const baseBridgeAddress = process.env.BASE_BRIDGE_ADDRESS;
const MINT_TOPIC = process.env.MINT_TOPIC;
const BURN_TOPIC = process.env.BURN_TOPIC;
const BURN_TOPIC_SOLANA = process.env.BURN_TOPIC_SOLANA;
const MINT_TO_SOLANA_TOPIC = process.env.MINT_TO_SOLANA_TOPIC;
const SOLANA_BRIDGE_ADDRESS = new PublicKey(process.env.SOLANA_BRIDGE_ADDRESS!);
const BNFSCOIN_SOL_ADDRESS = new PublicKey(process.env.BNFSCOIN_SOL_ADDRESS!);
const MINT_AUTHORITY_PRIVATE_KEY = process.env.MINT_AUTHORITY_PRIVATE_KEY;


const signerPolygon = new Wallet(PRIVATE_KEY!, polygonProvider);
const signerBase = new Wallet(PRIVATE_KEY!, baseProvider);

const polygonBridgeContract = new Contract(polygonBridgeAddress!, polygonAbi, signerPolygon);
const baseBridgeContract = new Contract(baseBridgeAddress!, baseAbi, signerBase);

const connection = new Connection("https://api.devnet.solana.com", {
    commitment: "confirmed"
});
const signerSolana = Keypair.fromSecretKey(bs58.decode(MINT_AUTHORITY_PRIVATE_KEY!));

const mintToSolanaInterface = new ethers.Interface([
    "event MintToSolana(address indexed sender, bytes32 solanaAddress, uint256 amount)"
]);



const redisConfig = {
    redis: {
        port: 6379,
        host: "127.0.0.1",
        password: ""
    }
}
const logQueue = new Bull("logQueue", redisConfig);
console.log(logQueue);



async function launchIndexer(chain: Chain) {
    if(chain === Chain.Polygon) {
        console.log("In Polygon indexer");

        let currPolygonBlock = await polygonProvider.getBlockNumber() - 15;
        while(true) {
            let latestPolygon = await polygonProvider.getBlockNumber(); 
            console.log(`LATEST POLYGON: ${latestPolygon}`);
            if(latestPolygon - currPolygonBlock < 10) {
                console.log("Polygon TOO Close!");
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }
            await pollPolygon(currPolygonBlock);
            currPolygonBlock++;
        }

    } else if (chain === Chain.Base) {
        console.log("In Base indexer");

        let currBaseBlock = await baseProvider.getBlockNumber() - 15;
        while(true) {
            let latestBase = await baseProvider.getBlockNumber();
            console.log(`LATEST BASE: ${latestBase}`);
            if(latestBase - currBaseBlock < 10) {
                console.log("Base TOO Close!");
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }
            await pollBase(currBaseBlock);
            currBaseBlock++;
        }
    }
    
}


async function pollPolygon(blockNumber: number) {
    try{
        console.log(`POLYGON BLOCK : ${blockNumber}`);
        const logs = await polygonProvider.getLogs({
            address: polygonBridgeAddress,
            fromBlock: blockNumber,
            toBlock: blockNumber,
            topics: [
                [
                    id(MINT_TOPIC!),
                    id(MINT_TO_SOLANA_TOPIC!)                
                ]
            ]
        });

        console.log(logs);

        logs.forEach((log:Log) => {
            let logData: QueueData;
            if (matchTopic(MINT_TOPIC!, log.topics[0])) {
                logData = {
                    topic: MINT_TOPIC!,
                    sender: toNormalAddress(log.topics[1]),
                    amount: log.data
                }
            } else if (matchTopic(MINT_TO_SOLANA_TOPIC!, log.topics[0])) {
                const decodedEvent = mintToSolanaInterface.decodeEventLog("MintToSolana", log.data, log.topics);
                const encodedAddress = decodedEvent[1];
                const tokenAmount = decodedEvent[2];
                logData = {
                    topic: MINT_TO_SOLANA_TOPIC!,
                    receiver: toSolanaAddress(encodedAddress),
                    amount: rescaleToken18To9(tokenAmount)
                }
                console.log(JSON.stringify(logData));
            } else {
                return;
            }
            logQueue.add(logData);
        });
    } catch(error) {
        console.error(`Error in fetching POLYGON ${blockNumber}...retrying`);
        console.log(error);
        await new Promise(r => setTimeout(r, 3000));
        pollPolygon(blockNumber);
    }
}


async function pollBase(blockNumber: number) {
    try {
        console.log(`BASE BLOCK : ${blockNumber}`);
        const logs = await baseProvider.getLogs({
            address: baseBridgeAddress,
            fromBlock: blockNumber,
            toBlock: blockNumber,
            topics: [
                id(BURN_TOPIC!),
            ]
        });

        console.log(logs);

        logs.forEach((log:Log) => {
            const logData: QueueData = {
                topic: BURN_TOPIC!,
                sender: toNormalAddress(log.topics[1]),
                amount: log.data
            }

            logQueue.add(logData);
        });
    } catch(error) {
        console.error(`Error in fetching BASE ${blockNumber}...retrying`);
        await new Promise(r => setTimeout(r, 3000));
        pollBase(blockNumber);
    }
    
}

logQueue.process(async (job)=> {
    const queueData: QueueData = job.data;

    console.log(`Job Data: ${queueData}`)
    
    try {
        //Deposited on Polygon for Solana
        if (queueData.topic === MINT_TO_SOLANA_TOPIC) {
            console.log("came in solana consumer");
            const ix = createDepositedOnOppChainTx(queueData);
            console.log("IX: " + ix);
            const tx = new Transaction().add(ix);
            const blockhash = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash.blockhash;
            tx.feePayer = signerSolana.publicKey;
            const signature = await connection.sendTransaction(tx, [signerSolana]);
            console.log("Signature: " + signature);

        //Deposited on Polygon for base 
        } else if (queueData.topic === MINT_TOPIC) {
            console.log("came in polygon consumer");
            const txn: TransactionResponse = await baseBridgeContract.depositedOnOppositeChain(queueData.sender, queueData.amount);
            await txn.wait();
            console.log(txn);

        //Burned on Base
        } else if (queueData.topic === BURN_TOPIC) {
            console.log("came in base consumer");
            const txn: TransactionResponse = await polygonBridgeContract.burnedOnOppositeChain(queueData.sender, queueData.amount);
            await txn.wait();
            console.log(txn);
        
        //Burned on Solana
        } else if (queueData.topic === BURN_TOPIC_SOLANA) {
            console.log("came in solana burn consumer");
            const txn: TransactionResponse = await polygonBridgeContract.burnedOnOppositeChain(queueData.receiver, queueData.amount);
            await txn.wait();
            console.log(txn);
        } 
        return {success: true}
    } catch (e) {
        console.log(e);
    }
    
    
});


function createDepositedOnOppChainTx(queueData: QueueData) {
    const tokenAmount = BigInt(queueData.amount);
    const receiverAddr = new PublicKey(queueData.receiver!);
    const [userBalancePda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("balance"), receiverAddr.toBuffer()],
        SOLANA_BRIDGE_ADDRESS
    );
    console.log("PDA: " + userBalancePda);
    const ix = new TransactionInstruction({
        keys: [
            {pubkey: signerSolana.publicKey, isSigner: true, isWritable: true},
            {pubkey: receiverAddr, isSigner: false,isWritable: false},
            {pubkey: userBalancePda, isSigner: false,isWritable: true},
            {pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false}
        ],
        programId: SOLANA_BRIDGE_ADDRESS,
        data: serializeData(tokenAmount)
    });
    return ix;
}

launchIndexer(Chain.Polygon);
launchIndexer(Chain.Base);
connection.onLogs(
    SOLANA_BRIDGE_ADDRESS,
    async (logs: Logs, context: Context) => {
        const tx = await connection.getTransaction(logs.signature, {
            commitment: "confirmed"
        });
        if(!tx) {
            return;
        }
        const programLogs = logs.logs;
        let isBurnTopic = programLogs.includes("Program log: Instruction: BurnToken");
        if (isBurnTopic) {
            const programDataString = programLogs.filter(value => (
                startsWith(value, "Program data")
            ));
            if(!programDataString || programDataString.length === 0) {
                console.log("Not expected event");
            }
            console.log(logs);
            const programData = extractData(programDataString[0]);
            let event = deserializeEventData(programData);
            let logData: QueueData = {
                topic: BURN_TOPIC_SOLANA!,
                receiver: event.polygon_address,
                amount: rescaleToken9To18(event.amount)
            }
            logQueue.add(logData);
        }
    },
    "confirmed"
);
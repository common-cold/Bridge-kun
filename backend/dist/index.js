"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const utils_1 = require("./utils/utils");
const abi_1 = require("./contract/abi");
const bull_1 = __importDefault(require("bull"));
const dotenv_1 = __importDefault(require("dotenv"));
const web3_js_1 = require("@solana/web3.js");
const bytes_1 = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
const system_1 = require("@coral-xyz/anchor/dist/cjs/native/system");
var Chain;
(function (Chain) {
    Chain[Chain["Polygon"] = 0] = "Polygon";
    Chain[Chain["Base"] = 1] = "Base";
})(Chain || (Chain = {}));
dotenv_1.default.config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const polygonRpcUrl = process.env.POLYGON_RPC_URL;
const baseRpcUrl = process.env.BASE_RPC_URL;
const polygonProvider = new ethers_1.JsonRpcProvider(polygonRpcUrl);
const baseProvider = new ethers_1.JsonRpcProvider(baseRpcUrl);
const polygonBridgeAddress = process.env.POLYGON_BRIDGE_ADDRESS;
const baseBridgeAddress = process.env.BASE_BRIDGE_ADDRESS;
const MINT_TOPIC = process.env.MINT_TOPIC;
const BURN_TOPIC = process.env.BURN_TOPIC;
const BURN_TOPIC_SOLANA = process.env.BURN_TOPIC_SOLANA;
const MINT_TO_SOLANA_TOPIC = process.env.MINT_TO_SOLANA_TOPIC;
const SOLANA_BRIDGE_ADDRESS = new web3_js_1.PublicKey(process.env.SOLANA_BRIDGE_ADDRESS);
const BNFSCOIN_SOL_ADDRESS = new web3_js_1.PublicKey(process.env.BNFSCOIN_SOL_ADDRESS);
const MINT_AUTHORITY_PRIVATE_KEY = process.env.MINT_AUTHORITY_PRIVATE_KEY;
const signerPolygon = new ethers_1.Wallet(PRIVATE_KEY, polygonProvider);
const signerBase = new ethers_1.Wallet(PRIVATE_KEY, baseProvider);
const polygonBridgeContract = new ethers_1.Contract(polygonBridgeAddress, abi_1.polygonAbi, signerPolygon);
const baseBridgeContract = new ethers_1.Contract(baseBridgeAddress, abi_1.baseAbi, signerBase);
const connection = new web3_js_1.Connection("https://api.devnet.solana.com", {
    commitment: "confirmed"
});
const signerSolana = web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(MINT_AUTHORITY_PRIVATE_KEY));
const mintToSolanaInterface = new ethers_1.ethers.Interface([
    "event MintToSolana(address indexed sender, bytes32 solanaAddress, uint256 amount)"
]);
const redisConfig = {
    redis: {
        port: 6379,
        host: "127.0.0.1",
        password: ""
    }
};
const logQueue = new bull_1.default("logQueue", redisConfig);
console.log(logQueue);
function launchIndexer(chain) {
    return __awaiter(this, void 0, void 0, function* () {
        if (chain === Chain.Polygon) {
            console.log("In Polygon indexer");
            let currPolygonBlock = (yield polygonProvider.getBlockNumber()) - 15;
            while (true) {
                let latestPolygon = yield polygonProvider.getBlockNumber();
                console.log(`LATEST POLYGON: ${latestPolygon}`);
                if (latestPolygon - currPolygonBlock < 10) {
                    console.log("Polygon TOO Close!");
                    yield new Promise(r => setTimeout(r, 5000));
                    continue;
                }
                yield pollPolygon(currPolygonBlock);
                currPolygonBlock++;
            }
        }
        else if (chain === Chain.Base) {
            console.log("In Base indexer");
            let currBaseBlock = (yield baseProvider.getBlockNumber()) - 15;
            while (true) {
                let latestBase = yield baseProvider.getBlockNumber();
                console.log(`LATEST BASE: ${latestBase}`);
                if (latestBase - currBaseBlock < 10) {
                    console.log("Base TOO Close!");
                    yield new Promise(r => setTimeout(r, 5000));
                    continue;
                }
                yield pollBase(currBaseBlock);
                currBaseBlock++;
            }
        }
    });
}
function pollPolygon(blockNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`POLYGON BLOCK : ${blockNumber}`);
            const logs = yield polygonProvider.getLogs({
                address: polygonBridgeAddress,
                fromBlock: blockNumber,
                toBlock: blockNumber,
                topics: [
                    [
                        (0, ethers_1.id)(MINT_TOPIC),
                        (0, ethers_1.id)(MINT_TO_SOLANA_TOPIC)
                    ]
                ]
            });
            console.log(logs);
            logs.forEach((log) => {
                let logData;
                if ((0, utils_1.matchTopic)(MINT_TOPIC, log.topics[0])) {
                    logData = {
                        topic: MINT_TOPIC,
                        sender: (0, utils_1.toNormalAddress)(log.topics[1]),
                        amount: log.data
                    };
                }
                else if ((0, utils_1.matchTopic)(MINT_TO_SOLANA_TOPIC, log.topics[0])) {
                    const decodedEvent = mintToSolanaInterface.decodeEventLog("MintToSolana", log.data, log.topics);
                    const encodedAddress = decodedEvent[1];
                    const tokenAmount = decodedEvent[2];
                    logData = {
                        topic: MINT_TO_SOLANA_TOPIC,
                        receiver: (0, utils_1.toSolanaAddress)(encodedAddress),
                        amount: (0, utils_1.rescaleToken18To9)(tokenAmount)
                    };
                    console.log(JSON.stringify(logData));
                }
                else {
                    return;
                }
                logQueue.add(logData);
            });
        }
        catch (error) {
            console.error(`Error in fetching POLYGON ${blockNumber}...retrying`);
            console.log(error);
            yield new Promise(r => setTimeout(r, 3000));
            pollPolygon(blockNumber);
        }
    });
}
function pollBase(blockNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`BASE BLOCK : ${blockNumber}`);
            const logs = yield baseProvider.getLogs({
                address: baseBridgeAddress,
                fromBlock: blockNumber,
                toBlock: blockNumber,
                topics: [
                    (0, ethers_1.id)(BURN_TOPIC),
                ]
            });
            console.log(logs);
            logs.forEach((log) => {
                const logData = {
                    topic: BURN_TOPIC,
                    sender: (0, utils_1.toNormalAddress)(log.topics[1]),
                    amount: log.data
                };
                logQueue.add(logData);
            });
        }
        catch (error) {
            console.error(`Error in fetching BASE ${blockNumber}...retrying`);
            yield new Promise(r => setTimeout(r, 3000));
            pollBase(blockNumber);
        }
    });
}
logQueue.process((job) => __awaiter(void 0, void 0, void 0, function* () {
    const queueData = job.data;
    console.log(`Job Data: ${queueData}`);
    try {
        //Deposited on Polygon for Solana
        if (queueData.topic === MINT_TO_SOLANA_TOPIC) {
            console.log("came in solana consumer");
            const ix = createDepositedOnOppChainTx(queueData);
            console.log("IX: " + ix);
            const tx = new web3_js_1.Transaction().add(ix);
            const blockhash = yield connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash.blockhash;
            tx.feePayer = signerSolana.publicKey;
            const signature = yield connection.sendTransaction(tx, [signerSolana]);
            console.log("Signature: " + signature);
            //Deposited on Polygon for base 
        }
        else if (queueData.topic === MINT_TOPIC) {
            console.log("came in polygon consumer");
            const txn = yield baseBridgeContract.depositedOnOppositeChain(queueData.sender, queueData.amount);
            yield txn.wait();
            console.log(txn);
            //Burned on Base
        }
        else if (queueData.topic === BURN_TOPIC) {
            console.log("came in base consumer");
            const txn = yield polygonBridgeContract.burnedOnOppositeChain(queueData.sender, queueData.amount);
            yield txn.wait();
            console.log(txn);
            //Burned on Solana
        }
        else if (queueData.topic === BURN_TOPIC_SOLANA) {
            console.log("came in solana burn consumer");
            const txn = yield polygonBridgeContract.burnedOnOppositeChain(queueData.receiver, queueData.amount);
            yield txn.wait();
            console.log(txn);
        }
        return { success: true };
    }
    catch (e) {
        console.log(e);
    }
}));
function createDepositedOnOppChainTx(queueData) {
    const tokenAmount = BigInt(queueData.amount);
    const receiverAddr = new web3_js_1.PublicKey(queueData.receiver);
    const [userBalancePda, bump] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("balance"), receiverAddr.toBuffer()], SOLANA_BRIDGE_ADDRESS);
    console.log("PDA: " + userBalancePda);
    const ix = new web3_js_1.TransactionInstruction({
        keys: [
            { pubkey: signerSolana.publicKey, isSigner: true, isWritable: true },
            { pubkey: receiverAddr, isSigner: false, isWritable: false },
            { pubkey: userBalancePda, isSigner: false, isWritable: true },
            { pubkey: system_1.SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false }
        ],
        programId: SOLANA_BRIDGE_ADDRESS,
        data: (0, utils_1.serializeData)(tokenAmount)
    });
    return ix;
}
launchIndexer(Chain.Polygon);
launchIndexer(Chain.Base);
connection.onLogs(SOLANA_BRIDGE_ADDRESS, (logs, context) => __awaiter(void 0, void 0, void 0, function* () {
    const tx = yield connection.getTransaction(logs.signature, {
        commitment: "confirmed"
    });
    if (!tx) {
        return;
    }
    const programLogs = logs.logs;
    let isBurnTopic = programLogs.includes("Program log: Instruction: BurnToken");
    if (isBurnTopic) {
        const programDataString = programLogs.filter(value => ((0, utils_1.startsWith)(value, "Program data")));
        if (!programDataString || programDataString.length === 0) {
            console.log("Not expected event");
        }
        console.log(logs);
        const programData = (0, utils_1.extractData)(programDataString[0]);
        let event = (0, utils_1.deserializeEventData)(programData);
        let logData = {
            topic: BURN_TOPIC_SOLANA,
            receiver: event.polygon_address,
            amount: (0, utils_1.rescaleToken9To18)(event.amount)
        };
        logQueue.add(logData);
    }
}), "confirmed");

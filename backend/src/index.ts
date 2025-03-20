import { Log , JsonRpcProvider, ethers, id, Wallet, Contract} from "ethers";
import { QueueData } from "./typesData";
import { matchTopic, toNormalAddress } from "./utils/utils";
import {baseAbi, polygonAbi} from "./contract/abi";
import Bull from "bull";



const PRIVATE_KEY = "1d9769632ceb474f4e1c99f4881a13b58ad4989de37f7ea5acb67dcf49c60850";
const polygonProvider = new JsonRpcProvider("https://polygonzkevm-cardona.g.alchemy.com/v2/IA5XqK-rU0LYpFekBWARC-2_lWQNqmFG");
const baseProvider = new JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/IA5XqK-rU0LYpFekBWARC-2_lWQNqmFG");
const polygonBridgeAddress = "0x473d98d7C906563aA2E82e0Ca239668c7400E92c";
const baseBridgeAddress = "0x7355244Ea247c2304cc54aECe44a3c74A4aE3B97";
const MINT_TOPIC = "Mint(address,uint256)";
const BURN_TOPIC = "Burn(address,uint256)";


const signerPolygon = new Wallet(PRIVATE_KEY, polygonProvider);
const signerBase = new Wallet(PRIVATE_KEY, baseProvider);

const polygonBridgeContract = new Contract(polygonBridgeAddress, polygonAbi, signerPolygon);
const baseBridgeContract = new Contract(baseBridgeAddress, baseAbi, signerBase);


const redisConfig = {
    redis: {
        port: 6379,
        host: "127.0.0.1",
        password: ""
    }
}
const logQueue = new Bull("logQueue", redisConfig);
console.log(logQueue);

async function launchIndexer() {
    console.log("In indexer");
    let currPolygonBlock = await polygonProvider.getBlockNumber() - 20;
    let currBaseBlock = await baseProvider.getBlockNumber() - 20;
    console.log("Passed 1");
    console.log(`CURR POLYGON: ${currPolygonBlock}`);
    console.log(`CURR BASE: ${currBaseBlock}`);

    while(true) {
        let latestPolygon = await polygonProvider.getBlockNumber(); 
        let latestBase = await baseProvider.getBlockNumber();
        console.log(`LATEST POLYGON: ${latestPolygon}`);
        console.log(`LATEST BASE: ${latestBase}`);
        if(latestPolygon - currPolygonBlock < 10 || latestBase - currBaseBlock < 10) {
            console.log("TOO Close!");
            await new Promise(r => setTimeout(r, 10000));
            continue;
        }
        await pollPolygon(currPolygonBlock);
        await pollBase(currBaseBlock);
        currPolygonBlock++;
        currBaseBlock++;
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
                id(MINT_TOPIC),
            ]
        });

        console.log(logs);

        logs.forEach((log:Log) => {
            const logData: QueueData = {
                topic: log.topics[0],
                sender: toNormalAddress(log.topics[1]),
                amount: log.data
            }

            logQueue.add(logData);
        });
    } catch(error) {
        console.error(`Error in fetching POLYGON ${blockNumber}...retrying`);
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
                id(BURN_TOPIC),
            ]
        });

        console.log(logs);

        logs.forEach((log:Log) => {
            const logData: QueueData = {
                topic: log.topics[0],
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
    
    //Deposited on Polygon
    if (matchTopic(MINT_TOPIC, queueData.topic)) {
        console.log("came in polygon consumer");
        const txn = await baseBridgeContract.depositedOnOppositeChain(queueData.sender, queueData.amount);
        console.log(txn);

    //Burned on Base
    } else if (matchTopic(BURN_TOPIC, queueData.topic)) {
        console.log("came in base consumer");
        const txn =  await polygonBridgeContract.burnedOnOppositeChain(queueData.sender, queueData.amount);
        console.log(txn);
    }

    return {success: true}
});

launchIndexer();










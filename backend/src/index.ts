import { Log , JsonRpcProvider, ethers, id, Wallet, Contract, Block} from "ethers";
import { QueueData } from "./typesData";
import { matchTopic, toNormalAddress } from "./utils/utils";
import {baseAbi, polygonAbi} from "./contract/abi";
import Bull from "bull";
import dotenv from "dotenv";
import { validateBaseChain } from "web3/lib/commonjs/eth.exports";


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


const signerPolygon = new Wallet(PRIVATE_KEY!, polygonProvider);
const signerBase = new Wallet(PRIVATE_KEY!, baseProvider);

const polygonBridgeContract = new Contract(polygonBridgeAddress!, polygonAbi, signerPolygon);
const baseBridgeContract = new Contract(baseBridgeAddress!, baseAbi, signerBase);


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
                id(MINT_TOPIC!),
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
                id(BURN_TOPIC!),
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
    if (matchTopic(MINT_TOPIC!, queueData.topic)) {
        console.log("came in polygon consumer");
        const txn = await baseBridgeContract.depositedOnOppositeChain(queueData.sender, queueData.amount);
        console.log(txn);

    //Burned on Base
    } else if (matchTopic(BURN_TOPIC!, queueData.topic)) {
        console.log("came in base consumer");
        const txn =  await polygonBridgeContract.burnedOnOppositeChain(queueData.sender, queueData.amount);
        console.log(txn);
    }

    return {success: true}
});

launchIndexer(Chain.Polygon);
launchIndexer(Chain.Base);
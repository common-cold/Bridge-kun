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
const PRIVATE_KEY = "1d9769632ceb474f4e1c99f4881a13b58ad4989de37f7ea5acb67dcf49c60850";
const polygonProvider = new ethers_1.JsonRpcProvider("https://polygonzkevm-cardona.g.alchemy.com/v2/IA5XqK-rU0LYpFekBWARC-2_lWQNqmFG");
const baseProvider = new ethers_1.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/IA5XqK-rU0LYpFekBWARC-2_lWQNqmFG");
const polygonBridgeAddress = "0x473d98d7C906563aA2E82e0Ca239668c7400E92c";
const baseBridgeAddress = "0x7355244Ea247c2304cc54aECe44a3c74A4aE3B97";
const MINT_TOPIC = "Mint(address,uint256)";
const BURN_TOPIC = "Burn(address,uint256)";
const signerPolygon = new ethers_1.Wallet(PRIVATE_KEY, polygonProvider);
const signerBase = new ethers_1.Wallet(PRIVATE_KEY, baseProvider);
const polygonBridgeContract = new ethers_1.Contract(polygonBridgeAddress, abi_1.polygonAbi, signerPolygon);
const baseBridgeContract = new ethers_1.Contract(baseBridgeAddress, abi_1.baseAbi, signerBase);
const redisConfig = {
    redis: {
        port: 6379,
        host: "127.0.0.1",
        password: ""
    }
};
const logQueue = new bull_1.default("logQueue", redisConfig);
console.log(logQueue);
function launchIndexer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("In indexer");
        let currPolygonBlock = (yield polygonProvider.getBlockNumber()) - 15;
        let currBaseBlock = (yield baseProvider.getBlockNumber()) - 15;
        console.log("Passed 1");
        console.log(`CURR POLYGON: ${currPolygonBlock}`);
        console.log(`CURR BASE: ${currBaseBlock}`);
        while (true) {
            let latestPolygon = yield polygonProvider.getBlockNumber();
            let latestBase = yield baseProvider.getBlockNumber();
            console.log(`LATEST POLYGON: ${latestPolygon}`);
            console.log(`LATEST BASE: ${latestBase}`);
            if (latestPolygon - currPolygonBlock < 10 || latestBase - currBaseBlock < 10) {
                console.log("TOO Close!");
                yield new Promise(r => setTimeout(r, 5000));
                continue;
            }
            yield pollPolygon(currPolygonBlock);
            yield pollBase(currBaseBlock);
            currPolygonBlock++;
            currBaseBlock++;
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
                    (0, ethers_1.id)(MINT_TOPIC),
                ]
            });
            console.log(logs);
            logs.forEach((log) => {
                const logData = {
                    topic: log.topics[0],
                    sender: (0, utils_1.toNormalAddress)(log.topics[1]),
                    amount: log.data
                };
                logQueue.add(logData);
            });
        }
        catch (error) {
            console.error(`Error in fetching POLYGON ${blockNumber}...retrying`);
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
                    topic: log.topics[0],
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
    //Deposited on Polygon
    if ((0, utils_1.matchTopic)(MINT_TOPIC, queueData.topic)) {
        console.log("came in polygon consumer");
        const txn = yield baseBridgeContract.depositedOnOppositeChain(queueData.sender, queueData.amount);
        console.log(txn);
        //Burned on Base
    }
    else if ((0, utils_1.matchTopic)(BURN_TOPIC, queueData.topic)) {
        console.log("came in base consumer");
        const txn = yield polygonBridgeContract.burnedOnOppositeChain(queueData.sender, queueData.amount);
        console.log(txn);
    }
    return { success: true };
}));
launchIndexer();

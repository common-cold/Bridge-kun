"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceSchema = exports.Userbalance = void 0;
exports.serializeData = serializeData;
exports.deserializeEventData = deserializeEventData;
exports.padAddress = padAddress;
exports.matchTopic = matchTopic;
exports.toNormalAddress = toNormalAddress;
exports.toSolanaAddress = toSolanaAddress;
exports.rescaleToken18To9 = rescaleToken18To9;
exports.rescaleToken9To18 = rescaleToken9To18;
exports.startsWith = startsWith;
exports.extractData = extractData;
const ethers_1 = require("ethers");
const bs58_1 = __importDefault(require("bs58"));
const borsh = __importStar(require("borsh"));
class Userbalance {
    constructor(balance) {
        this.balance = balance;
    }
}
exports.Userbalance = Userbalance;
exports.balanceSchema = {
    struct: {
        balance: "u64"
    }
};
class BridgeEvent {
    constructor(event_type, source_address, polygon_address, amount) {
        this.event_type = event_type;
        this.source_address = source_address;
        this.polygon_address = polygon_address;
        this.amount = amount;
    }
}
const eventSchema = {
    struct: {
        event_type: 'string',
        source_address: { array: { type: 'u8', len: 32 } },
        polygon_address: 'string',
        amount: 'u64'
    }
};
function serializeData(tokenAmount) {
    const discriminitor = Buffer.from([130, 215, 54, 118, 146, 232, 126, 14]);
    const args = new Userbalance(tokenAmount);
    const dataBuffer = borsh.serialize(exports.balanceSchema, args);
    const resultantBuffer = Buffer.concat([discriminitor, dataBuffer]);
    return resultantBuffer;
}
function deserializeEventData(data) {
    const dataBytes = Buffer.from(data, "base64");
    const event = borsh.deserialize(eventSchema, dataBytes.slice(8));
    return event;
}
function padAddress(address) {
    return ethers_1.ethers.zeroPadValue(address, 32);
}
function matchTopic(topic, hashedTopic) {
    return ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(topic)) === hashedTopic;
}
function toNormalAddress(address) {
    const addr = address.slice(26);
    return ethers_1.ethers.getAddress(`0x${addr}`);
}
function toSolanaAddress(encodedString) {
    return bs58_1.default.encode(Uint8Array.from(Buffer.from(encodedString.slice(2), "hex")));
}
function rescaleToken18To9(decimal18Token) {
    let scalingFactor = BigInt(Math.pow(10, 9));
    const rescaledToken = decimal18Token / scalingFactor;
    return rescaledToken.toString();
}
function rescaleToken9To18(decimal9Token) {
    let scalingFactor = BigInt(Math.pow(10, 9));
    const rescaledToken = decimal9Token * scalingFactor;
    return rescaledToken.toString();
}
function startsWith(value, targetPrefix) {
    for (let i = 0; i < targetPrefix.length; i++) {
        if (value[i] !== targetPrefix[i]) {
            return false;
        }
    }
    return true;
}
function extractData(value) {
    return value.split(":")[1].trim();
}

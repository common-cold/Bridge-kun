import { ethers } from "ethers";
import bs58 from "bs58";
import * as borsh from "borsh";


export class Userbalance {
    balance: bigint;

    constructor(balance: bigint) {
        this.balance = balance
    }
}

export const balanceSchema: borsh.Schema = {
    struct: {
        balance: "u64"
    }
}

class BridgeEvent {
    event_type: string;
    source_address: string;
    polygon_address: string;
    amount: bigint

    constructor(
    event_type: string,
    source_address: string,
    polygon_address: string,
    amount: bigint
  ) {
    this.event_type = event_type;
    this.source_address = source_address;
    this.polygon_address = polygon_address;
    this.amount = amount;
  }
}

const eventSchema: borsh.Schema = {
    struct: {
        event_type: 'string',
        source_address:  { array: { type: 'u8', len: 32 }},
        polygon_address: 'string',
        amount: 'u64'
    }
}

export function serializeData(tokenAmount: bigint) {
    const discriminitor = Buffer.from([130, 215, 54, 118, 146, 232, 126, 14]);
    const args = new Userbalance(tokenAmount)
    const dataBuffer = borsh.serialize(balanceSchema, args);
    const resultantBuffer = Buffer.concat([discriminitor, dataBuffer]);
    return resultantBuffer;
}

export function deserializeEventData(data: String) {
    const dataBytes = Buffer.from(data, "base64");
    const event: BridgeEvent = borsh.deserialize(eventSchema, dataBytes.slice(8)) as BridgeEvent;
    return event;
}

export function padAddress(address: string) {
    return ethers.zeroPadValue(address, 32);
}

export function matchTopic(topic: string, hashedTopic: string) {
   return ethers.keccak256(ethers.toUtf8Bytes(topic)) === hashedTopic;
}

export function toNormalAddress(address: string) {
    const addr =  address.slice(26);
    return ethers.getAddress(`0x${addr}`);
}

export function toSolanaAddress(encodedString: string) {
    return bs58.encode(Uint8Array.from(Buffer.from(encodedString.slice(2), "hex")))
}


export function rescaleToken18To9 (decimal18Token: bigint) {
    let scalingFactor = BigInt(Math.pow(10, 9));
    const rescaledToken = decimal18Token/scalingFactor;
    return rescaledToken.toString();
}

export function rescaleToken9To18 (decimal9Token: bigint) {
    let scalingFactor = BigInt(Math.pow(10, 9));
    const rescaledToken = decimal9Token * scalingFactor;
    return rescaledToken.toString();
}

export function startsWith(value: string, targetPrefix: string) {
    for(let i=0; i< targetPrefix.length; i++) {
        if (value[i] !== targetPrefix[i]) {
            return false;
        }
    }
    return true;
}

export function extractData(value: string) {
    return value.split(":")[1].trim();
}
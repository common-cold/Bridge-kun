import { ethers } from "ethers";
import bs58 from "bs58";
import * as borsh from "borsh";


export class Userbalance {
    balance: bigint;

    constructor(balance: bigint) {
        this.balance = balance
    }
}

export const schema: borsh.Schema = {
    struct: {
        balance: "u64"
    }
}

export function serializeData(tokenAmount: bigint) {
    const discriminitor = Buffer.from([130, 215, 54, 118, 146, 232, 126, 14]);
    const args = new Userbalance(tokenAmount)
    const dataBuffer = borsh.serialize(schema, args);
    const resultantBuffer = Buffer.concat([discriminitor, dataBuffer]);
    return resultantBuffer;
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
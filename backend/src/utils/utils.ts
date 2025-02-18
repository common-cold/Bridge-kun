import { ethers } from "ethers";

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
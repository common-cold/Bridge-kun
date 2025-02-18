"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.padAddress = padAddress;
exports.matchTopic = matchTopic;
exports.toNormalAddress = toNormalAddress;
const ethers_1 = require("ethers");
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

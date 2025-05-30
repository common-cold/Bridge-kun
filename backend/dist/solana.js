"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SOLANA_BRIDGE_ADDRESS = new web3_js_1.PublicKey(process.env.SOLANA_BRIDGE_ADDRESS);
const BNFSCOIN_SOL_ADDRESS = new web3_js_1.PublicKey(process.env.BNFSCOIN_SOL_ADDRESS);
const MINT_AUTHORITY_PRIVATE_KEY = process.env.MINT_AUTHORITY_PRIVATE_KEY;
const connection = new web3_js_1.Connection("https://api.devnet.solana.com");
const logSubscriptionId = connection.onLogs(SOLANA_BRIDGE_ADDRESS, (logs, ctx) => {
    console.log(JSON.stringify(logs));
    console.log("------------------------------");
    console.log(JSON.stringify(ctx));
});

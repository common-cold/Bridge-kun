import { Connection, Context, Logs, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();
const SOLANA_BRIDGE_ADDRESS = new PublicKey(process.env.SOLANA_BRIDGE_ADDRESS!);
const BNFSCOIN_SOL_ADDRESS = new PublicKey(process.env.BNFSCOIN_SOL_ADDRESS!);
const MINT_AUTHORITY_PRIVATE_KEY = process.env.MINT_AUTHORITY_PRIVATE_KEY;

const connection = new Connection("https://api.devnet.solana.com");


const logSubscriptionId = connection.onLogs(
        SOLANA_BRIDGE_ADDRESS,
        (logs: Logs, ctx: Context) => {
            console.log(JSON.stringify(logs));
            console.log("------------------------------");
            console.log(JSON.stringify(ctx));
    } 
);

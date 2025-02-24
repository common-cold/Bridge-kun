import { Contract } from "ethers";
import { Wallet } from "ethers";
import { JsonRpcProvider } from "ethers";
import { createPublicClient } from "viem";
import { baseSepolia, polygonZkEvmCardona } from "viem/chains";
import { createConfig, http, injected } from "wagmi";
import { baseAbi, polygonAbi } from "./contract/abi";


const baseProvider = new JsonRpcProvider(import.meta.env.VITE_BASE_RPC_URL);
const baseWallet = new Wallet(import.meta.env.VITE_PRIVATE_KEY, baseProvider);
export const baseBridgeContract = new Contract(import.meta.env.VITE_BASE_BRIDGE_ADDRESS, baseAbi, baseWallet);

const polygonProvider = new JsonRpcProvider(import.meta.env.VITE_POLYGON_RPC_URL);
const polygonWallet = new Wallet(import.meta.env.VITE_PRIVATE_KEY, polygonProvider);
export const polygonBridgeContract = new Contract(import.meta.env.VITE_POLYGON_BRIDGE_ADDRESS, polygonAbi, polygonWallet);


export const config = createConfig({
    chains: [polygonZkEvmCardona, baseSepolia],
    connectors: [injected()],
    transports: {
        [polygonZkEvmCardona.id]: http("https://polygonzkevm-cardona.g.alchemy.com/v2/IA5XqK-rU0LYpFekBWARC-2_lWQNqmFG"),
        [baseSepolia.id]: http("https://base-sepolia.g.alchemy.com/v2/IA5XqK-rU0LYpFekBWARC-2_lWQNqmFG")
    }
});

export const publicClient = createPublicClient({ 
    chain: polygonZkEvmCardona,
    transport: http("https://polygonzkevm-cardona.g.alchemy.com/v2/IA5XqK-rU0LYpFekBWARC-2_lWQNqmFG")
});


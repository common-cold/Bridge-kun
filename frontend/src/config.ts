import { baseSepolia, polygonZkEvmCardona } from "viem/chains";
import { createConfig, http, injected } from "wagmi";

export const config = createConfig({
    chains: [polygonZkEvmCardona, baseSepolia],
    connectors: [injected()],
    transports: {
        [polygonZkEvmCardona.id]: http("https://polygonzkevm-cardona.g.alchemy.com/v2/IA5XqK-rU0LYpFekBWARC-2_lWQNqmFG"),
        [baseSepolia.id]: http("https://base-sepolia.g.alchemy.com/v2/IA5XqK-rU0LYpFekBWARC-2_lWQNqmFG")
    }
});
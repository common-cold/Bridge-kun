import { PublicKey } from "@solana/web3.js"

export interface QueueData {
    topic: string,
    sender?: string,
    receiver?: string,
    amount: string
}

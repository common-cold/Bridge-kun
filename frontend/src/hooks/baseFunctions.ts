import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { baseBridgeContract, baseClient } from "../config";
import { baseAbi } from "../contract/abi";
import { baseSepolia } from "viem/chains";
import { QueryObserverResult } from "@tanstack/react-query";
import { ReadContractErrorType } from "wagmi/actions";


export function useBaseFunctions() {
    const BASE_SEPOLIA_ID = baseSepolia.id;

    const {address: wagmiAddress} = useAccount();
    const {writeContractAsync} = useWriteContract();
    const {refetch : getBaseUserBalance} = useReadContract({
        abi: baseAbi,
        address: import.meta.env.VITE_BASE_BRIDGE_ADDRESS,
        functionName: "getBalance",
        args: [wagmiAddress],
        chainId: BASE_SEPOLIA_ID
    });


    const withdrawFromBase = async (tokenAmount: bigint) => {
        const tx = await baseBridgeContract.withdraw(import.meta.env.VITE_BNFSCOIN_ADDRESS, wagmiAddress, tokenAmount);
        let baserReceipt = await baseClient.waitForTransactionReceipt({
            hash: tx.hash,
            confirmations: 1
        });
        if(baserReceipt.status === 'reverted') {
            console.log(JSON.stringify(baserReceipt.logs));
            throw new Error("Withdraw Error on Base Bridge");
        }
        console.log(JSON.stringify(tx));
        return tx;
    }

    const burnTokenOnBase =  async (tokenAmount: bigint) => {
        const tx = await writeContractAsync({
            abi: baseAbi,
            address: import.meta.env.VITE_BASE_BRIDGE_ADDRESS,
            functionName: "burn",
            args: [import.meta.env.VITE_BNFSCOIN_ADDRESS, tokenAmount],
            chainId: BASE_SEPOLIA_ID,
            gas: 300_000n,
        });
        let baserReceipt = await baseClient.waitForTransactionReceipt({
            hash: tx,
            confirmations: 1
        });
        if(baserReceipt.status === 'reverted') {
            console.log(JSON.stringify(baserReceipt.logs));
            throw new Error("Burn Error on Polygon Bridge");
        }
        console.log(JSON.stringify(tx));
    }

    const pollBaseBridgeForBalance =  async (tokenAmount: bigint) => {
        const result = await getBaseUserBalance() as QueryObserverResult<bigint, ReadContractErrorType>;
        const prevAmount = result.data!;
        while(true) {
            const {data} = await getBaseUserBalance() as QueryObserverResult<bigint, ReadContractErrorType>;

            console.log(data);
            if(data! >= prevAmount + tokenAmount){
                break;
            }
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    return {withdrawFromBase, burnTokenOnBase, pollBaseBridgeForBalance};
} 



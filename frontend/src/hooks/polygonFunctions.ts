import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { baseAbi, nfsCoinAbi, polygonAbi } from "../contract/abi";
import { polygonZkEvmCardona } from "viem/chains";
import { polygonBridgeContract, polygonClient } from "../config";
import { QueryObserverResult } from "@tanstack/react-query";
import { ReadContractErrorType } from "wagmi/actions";


export function usePolygonFunctions() {
    const POLYGON_CARDONA_ID = polygonZkEvmCardona.id;

    const {writeContractAsync} = useWriteContract();
    const {address: wagmiAddress} = useAccount();
    const {refetch: getPolygonUserBalance} = useReadContract({
        abi: baseAbi,
        address: import.meta.env.VITE_POLYGON_BRIDGE_ADDRESS,
        functionName: "getBalance",
        args: [wagmiAddress],
        chainId: POLYGON_CARDONA_ID
    });

    
    const lockTokenOnPolygon = async (tokenAmount: bigint) => {
        // Approve tokens to bridge
        const tx = await writeContractAsync({
            abi: nfsCoinAbi,
            address: import.meta.env.VITE_NFSCOIN_ADDRESS,
            functionName: "approve",
            args: [import.meta.env.VITE_POLYGON_BRIDGE_ADDRESS, tokenAmount],
            chainId: POLYGON_CARDONA_ID,
        });
        let polygonReceipt = await polygonClient.waitForTransactionReceipt({
            hash: tx,
            confirmations: 1
        });
        if(polygonReceipt.status === 'reverted') {
            console.log(JSON.stringify(polygonReceipt.logs));
            throw new Error("Approval Error");
        }
        console.log(JSON.stringify(tx));


        //Call deposit on polygon bridge
        const tx2 = await writeContractAsync({
            abi: polygonAbi,
            address: import.meta.env.VITE_POLYGON_BRIDGE_ADDRESS,
            functionName: "deposit",
            args: [import.meta.env.VITE_NFSCOIN_ADDRESS, tokenAmount],
            chainId: POLYGON_CARDONA_ID,
            gas: 300_000n,
        });
        polygonReceipt = await polygonClient.waitForTransactionReceipt({
            hash: tx2,
            confirmations: 1
        });
        if(polygonReceipt.status === 'reverted') {
            console.log(JSON.stringify(polygonReceipt.logs));
            throw new Error("Deposit Error on Polygon Bridge");
        }
        console.log(JSON.stringify(tx2));
    }

    const withdrawFromPolygon = async (tokenAmount: bigint) => {
        const tx = await polygonBridgeContract.withdraw(import.meta.env.VITE_NFSCOIN_ADDRESS, wagmiAddress, tokenAmount);
        let polygonReceipt = await polygonClient.waitForTransactionReceipt({
            hash: tx.hash,
            confirmations: 1
        });
        if(polygonReceipt.status === 'reverted') {
            console.log(JSON.stringify(polygonReceipt.logs));
            throw new Error("Withdraw Error on Base Bridge");
        }
        console.log(JSON.stringify(tx));
        return tx;
    }

    const pollPolygonBridgeForBalance = async (tokenAmount: bigint) => {
        while(true) {
            const {data} = await getPolygonUserBalance() as QueryObserverResult<bigint, ReadContractErrorType>;
            
            console.log(data);
            if(data! >= tokenAmount){
                break;
            }
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    return {lockTokenOnPolygon, withdrawFromPolygon, pollPolygonBridgeForBalance};
}



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

    
    const lockTokenOnPolygon = async (tokenAmount: bigint, solanaAddress: string | null) => {
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

        let tx2;
        if (!solanaAddress) {

            //Call deposit on polygon bridge for polygon-base bridging
            tx2 = await writeContractAsync({
                abi: polygonAbi,
                address: import.meta.env.VITE_POLYGON_BRIDGE_ADDRESS,
                functionName: "deposit",
                args: [import.meta.env.VITE_NFSCOIN_ADDRESS, tokenAmount],
                chainId: POLYGON_CARDONA_ID,
                gas: 300_000n,
            });

            //Call depositSolana on polygon bridge for polygon-solana bridging
        } else {
            tx2 = await writeContractAsync({
                abi: polygonAbi,
                address: import.meta.env.VITE_POLYGON_BRIDGE_ADDRESS,
                functionName: "depositSolana",
                args: [import.meta.env.VITE_NFSCOIN_ADDRESS, solanaAddress, tokenAmount],
                chainId: POLYGON_CARDONA_ID,
                gas: 300_000n
            })
        }
        
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
        const result = await getPolygonUserBalance() as QueryObserverResult<bigint, ReadContractErrorType>;
        const prevAmount = result.data!;
        while(true) {
            const {data} = await getPolygonUserBalance() as QueryObserverResult<bigint, ReadContractErrorType>;
            
            console.log(data);
            if(data! >= prevAmount + tokenAmount){
                console.log("broke free");
                break;
            }
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    return {lockTokenOnPolygon, withdrawFromPolygon, pollPolygonBridgeForBalance};
}



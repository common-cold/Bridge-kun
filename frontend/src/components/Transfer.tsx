import { Address } from "viem"
import { useReadContract, useWriteContract } from "wagmi"
import { baseAbi, nfsCoinAbi, polygonAbi } from "../contract/abi";
import { ethers } from "ethers";
import { baseSepolia, polygonZkEvmCardona } from "viem/chains";
import { useRecoilState } from "recoil";
import { buttonDisabledAtom } from "../store/atoms";
import { baseBridgeContract, baseClient, polygonBridgeContract, polygonClient } from '../config'
import { QueryObserverResult } from "@tanstack/react-query";
import { ReadContractErrorType } from "wagmi/actions";
import toast from "react-hot-toast";

interface TransferProps {
    primaryChain: string,
    secondaryChain: string,
    amount: string,
    walletAddress: Address
}


const POLYGON_CARDONA_ID = polygonZkEvmCardona.id;
const BASE_SEPOLIA_ID = baseSepolia.id;


export function Transfer({primaryChain, secondaryChain, amount, walletAddress} : TransferProps) {
    
    const [buttonDisabled, setButtonDisabled] = useRecoilState(buttonDisabledAtom);
    const {writeContractAsync} = useWriteContract();

    const {refetch : getBaseUserBalance} = useReadContract({
        abi: baseAbi,
        address: import.meta.env.VITE_BASE_BRIDGE_ADDRESS,
        functionName: "getBalance",
        args: [walletAddress],
        chainId: BASE_SEPOLIA_ID
    });

    const {refetch: getPolygonUserBalance} = useReadContract({
        abi: baseAbi,
        address: import.meta.env.VITE_POLYGON_BRIDGE_ADDRESS,
        functionName: "getBalance",
        args: [walletAddress],
        chainId: POLYGON_CARDONA_ID
    });

    // const {refetch} = useReadContract({
    //     abi: nfsCoinAbi,
    //     address: import.meta.env.VITE_NFSCOIN_ADDRESS,
    //     functionName: "balanceOf",
    //     args: [walletAddress]
    // });
    
    async function transfer() {
        try{

            if(primaryChain == "polygon" && secondaryChain == "base") {
                console.log("inside first");

                const tokenAmount = ethers.parseUnits(amount, 18);
                
                setButtonDisabled(true);
                
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


                //Check if the event relayed to base bridge via nodejs indexer by polling the user balance 
                while(true) {
                    const {data} = await getBaseUserBalance() as QueryObserverResult<bigint, ReadContractErrorType>;

                    console.log(data);
                    if(data! >= tokenAmount){
                        break;
                    }
                    await new Promise(r => setTimeout(r, 10000));
                }

                const tx3 = await baseBridgeContract.withdraw(import.meta.env.VITE_BNFSCOIN_ADDRESS, walletAddress, tokenAmount);
                let baserReceipt = await baseClient.waitForTransactionReceipt({
                    hash: tx3.hash,
                    confirmations: 1
                });
                if(baserReceipt.status === 'reverted') {
                    console.log(JSON.stringify(baserReceipt.logs));
                    throw new Error("Withdraw Error on Base Bridge");
                }
                console.log(JSON.stringify(tx3));

                toast.success(
                            <div>
                              Bridge Successful!<br />
                              <a
                                href={`https://sepolia.basescan.org/tx/${tx3.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#3674e5', textDecoration: 'underline' }}
                              >
                                View on Base Sepolia Explorer
                              </a>
                            </div>,
                    {duration: 10000}
                );

            } else if (primaryChain == "base" && secondaryChain == "polygon") {
                console.log("inside second");

                const tokenAmount = ethers.parseUnits(amount, 18);

                setButtonDisabled(true);

                //Call burn on base bridge
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


                //Check if the event relayed to polygon bridge via nodejs indexer by polling the user balance 
                while(true) {
                    const {data} = await getPolygonUserBalance() as QueryObserverResult<bigint, ReadContractErrorType>;

                    console.log(data);
                    if(data! >= tokenAmount){
                        break;
                    }
                    await new Promise(r => setTimeout(r, 10000));
                }

                const tx2 = await polygonBridgeContract.withdraw(import.meta.env.VITE_NFSCOIN_ADDRESS, walletAddress, tokenAmount);
                let polygonReceipt = await polygonClient.waitForTransactionReceipt({
                    hash: tx2.hash,
                    confirmations: 1
                });
                if(polygonReceipt.status === 'reverted') {
                    console.log(JSON.stringify(polygonReceipt.logs));
                    throw new Error("Withdraw Error on Base Bridge");
                }
                console.log(JSON.stringify(tx2));

                toast.success(
                    <div>
                      Bridge Successful!<br />
                      <a
                        href={`https://cardona-zkevm.polygonscan.com/tx/${tx2.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3674e5', textDecoration: 'underline' }}
                      >
                        View on Polygon Cardona Explorer
                      </a>
                    </div>,
                    {duration: 10000}
                );
            }
            
            setButtonDisabled(false);
    
        } catch(e) {
            const error = e as Error;
            toast.error(
                <div>
                  {error.message}
                </div>,
                { duration: 6000 }
            );
            console.log(error.message);  
            setButtonDisabled(false);
        }

    }
    
    
    return <button className="bg-blue" style={{height: "40px", color: "white", fontFamily: "Satoshi-Black", fontSize: "16px",
                 borderRadius: "10px", backgroundColor: buttonDisabled ? "gray" : "#0098fe", 
                 borderStyle: "none", cursor: buttonDisabled ? "not-allowed" : "pointer"}}
                 disabled = {!walletAddress || buttonDisabled}
                 onClick={()=> (transfer())}>
                    Transfer
    </button>
}
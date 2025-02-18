import { Address } from "viem"
import { useReadContract, useWriteContract } from "wagmi"
import { baseAbi, nfsCoinAbi, polygonAbi } from "../contract/abi";
import { ethers, TransactionResponse } from "ethers";
import { baseSepolia, polygonZkEvmCardona } from "viem/chains";
import { useRecoilState } from "recoil";
import { buttonDisabledAtom } from "../store/atoms";

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

    const {refetch} = useReadContract({
        abi: baseAbi,
        address: import.meta.env.VITE_BASE_BRIDGE_ADDRESS,
        functionName: "getBalance",
        args: [walletAddress],
        chainId: BASE_SEPOLIA_ID
    });

    // const {refetch} = useReadContract({
    //     abi: nfsCoinAbi,
    //     address: import.meta.env.VITE_NFSCOIN_ADDRESS,
    //     functionName: "balanceOf",
    //     args: [walletAddress]
    // });
    
    async function transfer() {
        try{
            // const tokenAmount = ethers.toBigInt(parseInt(amount));
            const tokenAmount = parseInt(amount);
            setButtonDisabled(true);
        
            // Approve tokens to bridge
            const tx = await writeContractAsync({
                abi: nfsCoinAbi,
                address: import.meta.env.VITE_NFSCOIN_ADDRESS,
                functionName: "approve",
                args: [walletAddress, tokenAmount],
                chainId: POLYGON_CARDONA_ID
            });
    
            if(!tx) throw new Error("Approval Error");
            console.log(JSON.stringify(tx));
        

            
            
            //Call deposit on polygon bridge
            const tx2 = await writeContractAsync({
                abi: polygonAbi,
                address: import.meta.env.VITE_POLYGON_BRIDGE_ADDRESS,
                functionName: "deposit",
                args: [import.meta.env.VITE_NFSCOIN_ADDRESS, tokenAmount],
                chainId: POLYGON_CARDONA_ID
            });

            if(!tx2) throw new Error("Deposit Error on Polygon Bridge");
            console.log(JSON.stringify(tx2));



            // //Check if the event relayed to base bridge via nodejs
            while(true) {
                const {data} = await refetch();

                if(data == tokenAmount){
                    break;
                }
            }

            // //call withdraw on base bridge 
            const tx3 = await writeContractAsync({
                abi: baseAbi,
                address: import.meta.env.VITE_BASE_BRIDGE_ADDRESS,
                functionName: "withdraw",
                args: [import.meta.env.VITE_BNFSCOIN_ADDRESS, tokenAmount],
                chainId: BASE_SEPOLIA_ID
            });

            if(!tx3) throw new Error("Withdraw Error on Base Bridge");
            console.log(JSON.stringify(tx3));

           

            setButtonDisabled(false);
    
        } catch(e) {
            alert(e);
            setButtonDisabled(false);
        }

    }
    
    
    return <button style={{height: "30px", color: "white", fontSize: "16px", fontWeight: "bold",
                 borderRadius: "15px", backgroundColor: buttonDisabled ? "gray" : "#0098fe", 
                 borderStyle: "none", cursor: buttonDisabled ? "not-allowed" : "pointer"}}
                 disabled = {!walletAddress || buttonDisabled}
                 onClick={()=> (transfer())}>
                    Transfer
    </button>
}
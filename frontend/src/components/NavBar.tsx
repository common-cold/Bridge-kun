import { polygonZkEvmCardona } from "viem/chains";
import { useAccount, useWriteContract } from "wagmi"
import '../App.css';
import "../index.css";
import { nfsCoinAbi } from "../contract/abi";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { polygonClient } from "../config";


const POLYGON_CARDONA_ID = polygonZkEvmCardona.id;



export function NavBar() {

    return <div style={{height: "8vh", padding: "15px 20px", display: "flex", justifyContent:"space-between", alignItems: "center", position: "relative"}}>
        <AirdropButton/>
        {/* <ConnectWallet/> */}
    </div>
}

function AirdropButton() {
    const { address, chainId } = useAccount();
    const { writeContractAsync } = useWriteContract();

    async function airdrop() {
        if (chainId != polygonZkEvmCardona.id) {
            toast.error(
                <div className="toastMessage">
                  Please switch your network to Polygon zkEVm Cardona
                </div>,
                { duration: 6000 }
            );
            return;
        }
        const tx = await writeContractAsync({
            abi: nfsCoinAbi,
            address: import.meta.env.VITE_NFSCOIN_ADDRESS,
            functionName: "mint",
            args: [address , ethers.parseUnits("10", 18)],
            chainId: POLYGON_CARDONA_ID,
        });
        let polygonReceipt = await polygonClient.waitForTransactionReceipt({
            hash: tx,
            confirmations: 1
        })

        toast.success(
            <div className="toastMessage">
              Airdrop claimed!<br />
              <a
                href={`https://sepolia.etherscan.io/tx/${polygonReceipt.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3674e5', textDecoration: 'underline' }}
              >
                View on Etherscan
              </a>
            </div>,
            { duration: 6000 }
          );
        
    }
    return <div>
        <button className="walletButton" 
        style={{
            color: "white",
            backgroundColor: !address ? "gray" : "black",
            fontFamily: "Satoshi-Bold",
            fontSize: "12px", 
            width: "120px", 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
        onClick={()=> airdrop()} disabled = {!address}>
            Airdrop NFSCoins</button>
    </div>
}
import { useRecoilState } from "recoil";
import { polygonZkEvmCardona } from "viem/chains";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi"
import { showWalletsAtom } from "../store/atoms";
import '../App.css';
import "../index.css";
import { nfsCoinAbi } from "../contract/abi";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const POLYGON_CARDONA_ID = polygonZkEvmCardona.id;

export function NavBar() {

    return <div style={{height: "8vh", padding: "15px 20px", display: "flex", justifyContent:"space-between", alignItems: "center", position: "relative"}}>
        {/* <div style={{fontSize: "32px", fontWeight: "bold", color: "white", fontFamily: "Satoshi-Bold"}}>
            Bridge-kun ^_^
        </div> */}
        <AirdropButton/>
        <ConnectWallet/>
    </div>
}

function ConnectWallet() {
    const {address, connector} = useAccount();
    const {connectors, connect} = useConnect(); 
    const {disconnect} = useDisconnect();
    const [showWallets, setShowWallets] = useRecoilState(showWalletsAtom);

    if (address) {
        return <button className="walletButton" 
        style={{display: "flex", justifyContent: "space-between"}}
        onClick={()=> {
            disconnect({connector});
            setShowWallets(false);
        }}>
            <img
                src={connector?.icon}
                style={{width: "20px", height: "20px", marginRight: "7px"}}
            />
            <div style={{fontFamily: "Satoshi-Bold", color: "white", overflow: "hidden"}}>
                {address}
            </div>
        </button>
    }
    
    
    if (!showWallets) {
        return <button className="walletButton" style={{fontFamily: "Satoshi-Bold", width: "120px", boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'}} onClick={()=> setShowWallets(true)}>Connect Wallet</button>
    }

    return <div style={{
        display: "flex", 
        flexDirection: "column",
        position: "absolute",  
        top: "50%",           
        left: "auto",
        right: 10,            
        background: "white",  
        padding: "8px",       
        borderRadius: "5px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        {connectors.map(connector => {
         return <button key={connector.id} onClick={()=> {
            connect({connector});
            setShowWallets(false);
         }}>
            <img src={connector.icon} 
                style={{width: "20px", height: "20px"}}
            />    
            Connect
            </button>
        })}
    </div>
}


function AirdropButton() {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();

    async function airdrop() {
        const tx = await writeContractAsync({
            abi: nfsCoinAbi,
            address: import.meta.env.VITE_NFSCOIN_ADDRESS,
            functionName: "mint",
            args: [address , ethers.parseUnits("10", 18)],
            chainId: POLYGON_CARDONA_ID,
        });

        toast.success(
            <div>
              Airdrop claimed!<br />
              <a
                href={`https://sepolia.etherscan.io/tx/${tx}`}
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
    console.log("wallet:" + address);
    return <div>
        <button className="walletButton" 
        style={{
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
import { useRecoilState } from "recoil";
import { polygonZkEvmCardona } from "viem/chains";
import { Connector, CreateConnectorFn, useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi"
import { showWalletsAtom } from "../store/atoms";
import '../App.css';
import "../index.css";
import { nfsCoinAbi } from "../contract/abi";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { polygonClient } from "../config";
import { useEffect, useRef, useState } from "react";

const POLYGON_CARDONA_ID = polygonZkEvmCardona.id;


interface ListComponentProps {
    connector: Connector<CreateConnectorFn>;
    index: number;
  };

export function NavBar() {

    return <div style={{height: "8vh", padding: "15px 20px", display: "flex", justifyContent:"space-between", alignItems: "center", position: "relative"}}>
        <AirdropButton/>
        <ConnectWallet/>
    </div>
}

function ConnectWallet() {
    const {address, connector} = useAccount();
    const {connectors} = useConnect(); 
    const {disconnect} = useDisconnect();
    const [showWallets, setShowWallets] = useRecoilState(showWalletsAtom);
    const dropDownRef = useRef<HTMLDivElement | null>(null);

    function handleMouseClick(event: MouseEvent) {
        if(dropDownRef.current && !dropDownRef.current.contains(event.target as Node)){
            setShowWallets(false);
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleMouseClick)
        
        return ()=>{
            document.removeEventListener('mousedown', handleMouseClick);
        }
    }, []);

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

    return <div 
        ref={dropDownRef}
        style={{
            overflow: "hidden",
            position: "absolute",
            transition: "all 0.3s ease",
            maxHeight: showWallets ? "120px" : "0px",
            width: '110px',
            top: '20%',
            right: 0,
            zIndex: 999,
            marginInline: "20px",
            background: '#fff',
            border: '1px solid #D3D3D3',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        {connectors.map((connector, index) => {
            if (connector.id !== "injected") {
                return <ListComponent connector={connector} index={index} />
            }
        })}
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
            <div>
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

function ListComponent({connector, index}: ListComponentProps) {
    const {connect} = useConnect(); 
    const [hovered, setHovered] = useState<number | null>(null);

    return <div 
        key={index}
        onMouseEnter={()=> setHovered(index)}
        onMouseLeave={()=> setHovered(null)}
        onClick={()=> {
            connect({connector});
        }}
        style={{
            display: "flex",
            justifyContent: "flex-start",
            paddingInline: "10px",
            paddingBlock: "15px", 
            backgroundColor: hovered === index ? "#D3D3D3" : "#FFFFFF",
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            fontFamily: "Satoshi-Medium"
            }}>
        <img
            className="iconStyle"
            src={connector.icon}
        />
        Connect
    </div>
}
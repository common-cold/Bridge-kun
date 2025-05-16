import { useAccount, useConnect, useDisconnect } from "wagmi"
import '../App.css';
import "../index.css";
import { RefObject, useEffect, useRef, useState } from "react";
import { ChainOption, InputGroupType } from "./InputSections";
import { SolanaAdapterWallets } from "./custom-solana-wallet-adapter/SolanaAdapterWallets";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { primaryChainAtom, primaryWalletAddressAtom, secondaryChainAtom, secondaryWalletAddressAtom } from "../store/atoms";


interface ListComponentProps {
    handleOnClick: () => void,
    icon: string, 
    index: number
};

interface AddressDivProps {
    handleOnClick: () => void,
    icon: string,
    walletAddress: string
}

interface WagmiWalletProps {
    dropDownRef: RefObject<HTMLDivElement | null>,
    type: InputGroupType
}

interface ConnectButtonProps {
    showWallets: boolean,
    handleOnClick: () => void,
    buttonLabel: string,
}

interface ConnectWalletComponentProps {
    buttonLabel: string,
    currentChain: ChainOption,
    type: InputGroupType
}

export function ConnectWallet({buttonLabel, currentChain, type} : ConnectWalletComponentProps) {
    //wagmi hooks
    const {address: wagmiAddress, connector} = useAccount();
    const {disconnect: disconnectWagmiWallet} = useDisconnect();
    
    //solana wallet adapter hooks
    const {publicKey: solanaAdapterAddress, wallet, disconnect: disconnectSolanaAdapterWallet} = useWallet();
    
    const [showWallets, setShowWallets] = useState(false);
    const primaryChain = useRecoilValue(primaryChainAtom);
    const secondaryChain = useRecoilValue(secondaryChainAtom);
    const [primaryAddress, setPrimaryAddress] = useRecoilState(primaryWalletAddressAtom);
    const [secondaryAddress, setSecondaryAddress] = useRecoilState(secondaryWalletAddressAtom);
    const dropDownRef = useRef<HTMLDivElement | null>(null);

    function handleMouseClick(event: MouseEvent) {
        if (!showWallets) return;  
        if(dropDownRef.current && !dropDownRef.current.contains(event.target as Node)){
            setShowWallets(false);
        }
    }
    // console.log("Show Wallets:", showWallets);

    useEffect(() => {
        document.addEventListener('mousedown', handleMouseClick)
        return ()=>{
            document.removeEventListener('mousedown', handleMouseClick);
        }
    }, []);

    // useEffect(() => {
    //     if (primaryChain.value !== "solana" && secondaryChain.value !== "solana") {
    //         setPrimaryAddress(secondaryAddress);
    //     } else {
    //         setPrimaryAddress(null);
    //     }
    // }, [primaryChain]);

    // useEffect(() => {
    //     if (primaryChain.value !== "solana" && secondaryChain.value !== "solana") {
    //         setSecondaryAddress(primaryAddress);
    //     } else {
    //         setSecondaryAddress(null);
    //     }
    // }, [secondaryChain]);

    // console.log("SOLANA WALLET: " + solanaAdapterAddress?.toBase58());

    function clearAddressState() {
        if (type === InputGroupType.Primary) {
            setPrimaryAddress(null);
        } else {
            setSecondaryAddress(null);
        }
    }
    
    if (currentChain.value === "solana") {
        if (solanaAdapterAddress) {
            return <AddressDiv
                handleOnClick={()=> {
                    clearAddressState();
                    disconnectSolanaAdapterWallet();
                    setShowWallets(false);
                }}
                icon={wallet?.adapter.icon!}
                walletAddress={solanaAdapterAddress?.toBase58()!}
            />
        }
        return <div style={{display: "flex", flexDirection: "column", position: "relative"}}>
            <ConnectButton 
                showWallets={showWallets} 
                handleOnClick={() => setShowWallets(prev => !prev)} 
                buttonLabel={buttonLabel}
            />
            {
                showWallets &&
                <SolanaAdapterWallets type={type}/>
            }
        </div>

    } else  {
        if (wagmiAddress) {
            return <AddressDiv 
                handleOnClick={()=> {
                    // if chains are either polygon or base, 
                    // they share same address, thus clear both of them
                    if (primaryChain.value !== "solana" && secondaryChain.value !== "solana") {
                        setPrimaryAddress(null);
                        setSecondaryAddress(null);
                    } else {
                        clearAddressState();
                    }
                    disconnectWagmiWallet({connector});
                    setShowWallets(false);
                }}
                icon={connector?.icon!}
                walletAddress={wagmiAddress}
            />
        }
        return <div style={{display: "flex", flexDirection: "column", position: "relative"}}>
                <ConnectButton 
                    showWallets={showWallets} 
                    handleOnClick={() => setShowWallets(prev => !prev)} 
                    buttonLabel={buttonLabel}
                />
                {
                    showWallets &&
                    <WagmiWallets dropDownRef={dropDownRef} type={type}/>
                }
        </div>
    }
}


export function ConnectButton({showWallets, handleOnClick, buttonLabel} : ConnectButtonProps) {
    return <div className="walletButton" 
        style={{display: "flex", justifyContent: "space-between", fontFamily: "Satoshi-Black", paddingInline: "15px", height: "27px"}} 
            onClick={handleOnClick}>
            {buttonLabel}      
        <div>
            <svg
                style={{
                  width: "18px",
                  height: "18px",
                  transition: "transform 0.3s",
                  transform: showWallets ? "rotate(180deg)" : "rotate(0deg)",
                  stroke: "#696969",
                }}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2"
            >         
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
            </svg>
        </div>
    </div>
}


export function AddressDiv({handleOnClick, icon, walletAddress}: AddressDivProps) {
    return <div className="spacedDiv black"
                style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", cursor
                    : "pointer", width: "124px"}}

                onClick={handleOnClick}>
                <img
                    src={icon}
                    style={{width: "18px", height: "18px", marginRight: "7px"}}
                />
                <div style={{fontFamily: "Satoshi-Bold", overflow: "hidden"}}>
                    {walletAddress}
                </div>
            </div>
}


function WagmiWallets({dropDownRef, type} : WagmiWalletProps) {
    const {connectors, connectAsync} = useConnect();
    const setPrimaryWalletAddress = useSetRecoilState(primaryWalletAddressAtom);
    const setSecondaryWalletAddress = useSetRecoilState(secondaryWalletAddressAtom);
    const primaryChain = useRecoilValue(primaryChainAtom);
    const secondaryChain = useRecoilValue(secondaryChainAtom);
    
    return <div 
        ref={dropDownRef}
        style={{
            overflow: "hidden",
            position: "absolute",
            transition: "all 0.3s ease",
            width: '120px',
            top: '110%',
            right: -18,
            zIndex: 999,
            marginInline: "20px",
            background: '#fff',
            border: '1px solid #D3D3D3',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
        {connectors.map((connector, index) => {
            if (connector.id !== "injected") {
                return <ListComponent 
                    key={index}
                    handleOnClick={async ()=> {
                        const result  = await connectAsync({connector});
                        const walletAddress = result.accounts[0];

                        // if chians are either polygon or base, 
                        // set primary and secondary wallet adddress as same address
                        if (primaryChain.value !== "solana" && secondaryChain.value !== "solana") {
                            setPrimaryWalletAddress(walletAddress);
                            setSecondaryWalletAddress(walletAddress);
                        } 
                        else if (type === InputGroupType.Primary) {
                            setPrimaryWalletAddress(walletAddress)
                        } 
                        else if (type === InputGroupType.Secondary) {
                            setSecondaryWalletAddress(walletAddress)
                        }
                    }}
                    icon={connector.icon!} 
                    index={index} 
                />
            }
        })}
    </div>
}


export function ListComponent({handleOnClick, icon, index}: ListComponentProps) {
    
    const [hovered, setHovered] = useState<number | null>(null);

    return <div 
        onMouseEnter={()=> setHovered(index)}
        onMouseLeave={()=> setHovered(null)}
        onClick={handleOnClick}
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
            src={icon}
        />
        Connect
    </div>
}
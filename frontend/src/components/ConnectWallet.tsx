import { Connector, CreateConnectorFn, useAccount, useConnect, useDisconnect } from "wagmi"
import '../App.css';
import "../index.css";
import { useEffect, useRef, useState } from "react";


interface ListComponentProps {
    connector: Connector<CreateConnectorFn>;
    index: number;
  };

interface ConnectButtonProps {
    showWallets: boolean,
    handleOnClick: () => void,
    buttonLabel: string
}

type ConnectWalletComponentProps = Pick<ConnectButtonProps, 'buttonLabel'>;

  export function ConnectWallet({buttonLabel} : ConnectWalletComponentProps) {
    const {address, connector} = useAccount();
    const {connectors} = useConnect(); 
    const {disconnect} = useDisconnect();
    const [showWallets, setShowWallets] = useState(false);
    const dropDownRef = useRef<HTMLDivElement | null>(null);

    function handleMouseClick(event: MouseEvent) {
        if (!showWallets) return;  
        if(dropDownRef.current && !dropDownRef.current.contains(event.target as Node)){
            setShowWallets(false);
        }
    }
    console.log("Show Wallets:", showWallets);

    useEffect(() => {
        document.addEventListener('mousedown', handleMouseClick)
        return ()=>{
            document.removeEventListener('mousedown', handleMouseClick);
        }
    }, []);

    if (address) {
        return <div
        className="spacedDiv black"
        style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", cursor
            : "pointer", width: "124px"}}

        onClick={()=> {
            disconnect({connector});
            setShowWallets(false);
        }}>
            <img
                src={connector?.icon}
                style={{width: "18px", height: "18px", marginRight: "7px"}}
            />
            <div style={{fontFamily: "Satoshi-Bold", overflow: "hidden"}}>
                {address}
            </div>
        </div>
    }
    
    
    return <div style={{display: "flex", flexDirection: "column", position: "relative"}}>
        <ConnectButton showWallets={showWallets} handleOnClick={() => setShowWallets(prev => !prev)} buttonLabel={buttonLabel}/>
        {
            showWallets && (
                <div 
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
                        console.log(connector);
                        if (connector.id !== "injected") {
                            return <ListComponent connector={connector} index={index} />
                        }
                    })}
                </div>
            )
        }
    </div>
}


function ConnectButton({showWallets, handleOnClick, buttonLabel} : ConnectButtonProps) {
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
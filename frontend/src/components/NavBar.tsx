import { useRecoilState } from "recoil";
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { showWalletsAtom } from "../store/atoms";
import '../App.css';
import "../index.css";



export function NavBar() {
    return <div className="bg-blue" style={{height: "8vh", padding: "15px 20px", display: "flex", justifyContent:"space-between", alignItems: "center", position: "relative"}}>
        <div style={{fontSize: "32px", fontWeight: "bold", color: "white", fontFamily: "Satoshi-Bold"}}>
            Bridge-kun ^_^
        </div>
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
        return <button className="walletButton" style={{fontFamily: "Satoshi-Black", }} onClick={()=> setShowWallets(true)}>Connect Wallet</button>
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
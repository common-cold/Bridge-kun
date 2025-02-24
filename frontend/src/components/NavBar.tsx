import { useRecoilState } from "recoil";
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { showWalletsAtom } from "../store/atoms";
import '../App.css';
import "../index.css";



export function NavBar() {
    return <div style={{height: "8vh", padding: "15px 20px", display: "flex", justifyContent:"space-between", alignItems: "center", backgroundColor: "#e9dff1", position: "relative"}}>
        <div className="text-blue" style={{fontSize: "32px", fontWeight: "bold", fontFamily: "Satoshi-Bold"}}>
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
        position: "absolute",  // Ensures it appears below the navbar
        top: "50%",           // Starts from the bottom of the navbar
        left: "auto",
        right: 10,               // Aligns with navbar's left edge
        background: "white",   // Optional: Give it a background
        padding: "8px",        // Optional: Adds some spacing
        borderRadius: "5px",   // Optional: Rounded corners
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" // Optional: Adds a shadow
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
import { useRecoilState } from "recoil";
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { showWalletsAtom } from "../store/atoms";
import '../App.css';



export function NavBar() {
    return <div style={{color:"#0098fe", height: "8vh", padding: "15px 20px", display: "flex", justifyContent:"space-between", alignItems: "center"}}>
        <div style={{fontSize: "30px", fontWeight: "bold", fontFamily: "monospace"}}>
            Bridge Dapp
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
        style={{display: "flex", justifyContent: "space-between", color: "black"}}
        onClick={()=> {
            disconnect({connector});
            setShowWallets(false);
        }}>
            <img
                src={connector?.icon}
                style={{width: "20px", height: "20px", marginRight: "7px"}}
            />
            <div style={{overflow: "hidden"}}>
                {address}
            </div>
        </button>
    }
    
    
    if (!showWallets) {
        return <button className="walletButton" onClick={()=> setShowWallets(true)}>Connect Wallet</button>
    }   

    return <div style={{display: "flex", flexDirection: "column"}}>
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
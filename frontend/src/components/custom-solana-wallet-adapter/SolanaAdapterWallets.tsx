import { useWallet } from "@solana/wallet-adapter-react"
import { ListComponent } from "../ConnectWallet";
import { InputGroupType } from "../InputSections";
import { useSetRecoilState } from "recoil";
import { primaryWalletAddressAtom, secondaryWalletAddressAtom } from "../../store/atoms";


interface SolanaAdapterWalletsprops {
    type: InputGroupType
}

export function  SolanaAdapterWallets({type} : SolanaAdapterWalletsprops) {
    const { wallets, select } = useWallet();
    const setPrimaryWalletAddress = useSetRecoilState(primaryWalletAddressAtom);
    const setSecondaryWalletAddress = useSetRecoilState(secondaryWalletAddressAtom);

    return <div 
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
        {wallets.map((wallet, index) => {
            return <ListComponent 
                key={index}
                handleOnClick={async () => {
                    select(wallet.adapter.name)
                    await wallet.adapter.connect();
                    const walletAddress = wallet.adapter.publicKey?.toBase58()!;
                    if (type === InputGroupType.Primary) {
                        setPrimaryWalletAddress(walletAddress)
                    } else if (type === InputGroupType.Secondary) {
                        setSecondaryWalletAddress(walletAddress)
                    }
                }} 
                icon={wallet.adapter.icon} 
                index={index} 
            />
        })}
    </div>
}
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil"
import { primaryChainAtom, primaryWalletAddressAtom, secondaryChainAtom, secondaryWalletAddressAtom, tokenAmountAtom } from "../store/atoms"
import { memo } from "react"
import { useAccount } from "wagmi"
import { Transfer } from "./Transfer"
import { DropDownComponent } from "./DropDown"
import baseIcon from "../assets/base.png";
import polygonIcon from "../assets/polygon.png";
import solanaIcon from "../assets/solana.png";
import { Address } from "viem"
import { ConnectWallet } from "./ConnectWallet";
import { useAnchorWallet } from "@solana/wallet-adapter-react"


export enum InputGroupType {
    Primary = "Primary",
    Secondary = "Secondary"
}


export interface ChainOption {
    value: string,
    label: string,
    icon: string
}

interface ButtonComponentProps {
    primaryWallet: string,
    secondaryWallet: string,
    primaryChain: string,
    secondaryChain: string, 
    amount: string, 
    walletAddress: Address 
}

interface InputGroupProps {
    labelName: string,
    defaultChain: ChainOption,
    onChange: (chain: { value: string; label: string; icon: string }) => void,
    buttonLabel: string,
    currentChain: ChainOption,
    type: InputGroupType
}

interface AmountInputProps {
    onChange: (value: string) => void
}

const CHAIN_OPTIONS: ChainOption[] = [
    {
        value: 'polygon',
        label: 'Polygon zkEVM',
        icon: polygonIcon
    },
    {
        value: 'solana',
        label: 'Solana Devnet',
        icon: solanaIcon
    },
    {
        value: 'base',
        label: 'Base Sepolia',
        icon: baseIcon
    }
]


export function InputSections() {
    const [primaryChain, setPrimaryChain] = useRecoilState(primaryChainAtom);
    const [secondaryChain, setSecondaryChain] = useRecoilState(secondaryChainAtom);
    const [primaryAddress, setPrimaryAddress] = useRecoilState(primaryWalletAddressAtom);
    const [secondaryAddress, setSecondaryAddress] = useRecoilState(secondaryWalletAddressAtom);
    const setTokenAmount = useSetRecoilState(tokenAmountAtom);
    const {address} = useAccount();
    const publicKey = useAnchorWallet();

    console.log("primaryAddress = " + primaryAddress);
    console.log("secondaryAddress = " + secondaryAddress);
<<<<<<< HEAD
        // console.log("Anchor = " + JSON.stringify(publicKey));
        // console.log("Wagmi = " + address);
=======
    // console.log("Anchor = " + JSON.stringify(publicKey));
    // console.log("Wagmi = " + address);
>>>>>>> b4fb2350b2845e1a101abf5d55eb87c696b5e096
    console.log("-------------------------------");



    return <div style={{display: "flex", flexDirection: "column", width: "350px", backgroundColor: "white", "margin": "10px 0px",
         "padding": "20px", borderRadius: "15px", borderColor: "#D3D3D3", borderStyle: "solid", borderWidth: "0.1px", boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
        <InputGroup 
            labelName="From Network" 
            defaultChain={primaryChain} 
            onChange={(chain) => {
                setPrimaryChain(chain)
            }} 
            buttonLabel="From Wallet" 
            currentChain={primaryChain} 
            type={InputGroupType.Primary}
        />
        <ArrowSymbol/>
        <InputGroup 
            labelName="To Network" 
            defaultChain={secondaryChain} 
            onChange={(chain) => {
                setSecondaryChain(chain)
            }} 
            buttonLabel="To Wallet" 
            currentChain={secondaryChain} 
            type={InputGroupType.Secondary}
        />
        <AmountInput onChange={setTokenAmount}/>
        <Transfer/>
    </div>
}

const InputGroup = memo(function ({labelName, defaultChain, onChange, buttonLabel, currentChain, type}: InputGroupProps) {
    return <div style={{display: "flex", flexDirection: "column", marginBottom: "20px"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
            <div className="spacedDiv black" style={{fontFamily: "Satoshi-Bold"}}>
                {labelName}
            </div>
            <ConnectWallet buttonLabel={buttonLabel} currentChain={currentChain} type={type}/>
        </div>
        <DropDownComponent chainOptions={CHAIN_OPTIONS} defaultChain={defaultChain} onChange={onChange}/>
    </div>
});

const AmountInput = memo(function ({onChange} : AmountInputProps) {

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value)
    };

    return <div style={{display: "flex", flexDirection: "column", marginBottom: "20px"}}>
        <div className="spacedDiv black" style={{fontFamily: "Satoshi-Bold"}}>
            Amount
        </div>
        <input className="inputBoxStyle"
            style={{fontFamily: "Satoshi-Bold"}}
            placeholder="20"
            onChange={handleChange}
        />
    </div>
});

function ArrowSymbol() {
    return <div style={{textAlign: "center"}}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" color="gray" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
        </svg>
    </div>
}
import { useRecoilState } from "recoil"
import { primaryChainAtom, secondaryChainAtom, tokenAmountAtom } from "../store/atoms"
import { memo } from "react"
import { useAccount } from "wagmi"
import { Transfer } from "./Transfer"
import { DropDownComponent } from "./DropDown"
import baseIcon from "../assets/base.png";
import polygonIcon from "../assets/polygon.png";


export interface ChainOption {
    value: string,
    label: string,
    icon: string
}

interface InputGroupProps {
    labelName: string,
    defaultChain: ChainOption,
    onChange: (chain: { value: string; label: string; icon: string }) => void
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
        value: 'base',
        label: 'Base Sepolia',
        icon: baseIcon
    }
]


export function InputSections() {
    const [primaryChain, setPrimaryChain] = useRecoilState(primaryChainAtom);
    const [secondaryChain, setSecondaryChain] = useRecoilState(secondaryChainAtom);
    const [tokenAmount, setTokenAmount] = useRecoilState(tokenAmountAtom);
    const {address} = useAccount();

    console.log("primaryChain = " + JSON.stringify(primaryChain));
    console.log("secondaryChhain = " + JSON.stringify(secondaryChain));


    return <div style={{display: "flex", flexDirection: "column", width: "350px", backgroundColor: "white", "margin": "10px 0px",
         "padding": "20px", borderRadius: "15px", borderColor: "#D3D3D3", borderStyle: "solid", borderWidth: "0.1px", boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
        <InputGroup labelName="From Network" defaultChain={primaryChain} onChange={setPrimaryChain}/>
        <AmountInput onChange={setTokenAmount}/>
        <ArrowSymbol/>
        <InputGroup labelName="To Network" defaultChain={secondaryChain} onChange={setSecondaryChain}/>
        <Transfer primaryChain={primaryChain.value} secondaryChain={secondaryChain.value} amount={tokenAmount} walletAddress={address!}/>
    </div>
}

const InputGroup = memo (function ({labelName, defaultChain, onChange}: InputGroupProps) {
    return <div style={{display: "flex", flexDirection: "column", marginBottom: "20px"}}>
        <div className="spacedDiv black" style={{fontFamily: "Satoshi-Bold"}}>
            {labelName}
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
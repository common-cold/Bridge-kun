import { useRecoilState } from "recoil"
import {DropdownList} from "./DropDown"
import { primaryChainAtom, secondaryChainAtom, tokenAmountAtom } from "../store/atoms"
import { memo } from "react"
import { useAccount } from "wagmi"
import { Transfer } from "./Transfer"

interface InputGroupProps {
    labelName: string,
    defaultValue: string,
    onChange: (value: string) => void
}

interface AmountInputProps {
    onChange: (value: string) => void
}


export function InputSections() {
    const [primaryChain, setPrimaryChain] = useRecoilState(primaryChainAtom);
    const [secondaryChain, setSecondaryChain] = useRecoilState(secondaryChainAtom);
    const [tokenAmount, setTokenAmount] = useRecoilState(tokenAmountAtom);
    const {address} = useAccount();


    return <div style={{display: "flex", flexDirection: "column", width: "350px", backgroundColor: "white", "margin": "90px 0px",
         "padding": "20px"}}>
        <div className="black" style={{fontFamily: "Satoshi-Black", fontSize: "30px", marginBottom: "30px"}}>Deposit Tokens</div>
        <InputGroup labelName="From Network" defaultValue={primaryChain} onChange={setPrimaryChain}/>
        <InputGroup labelName="To Network" defaultValue={secondaryChain} onChange={setSecondaryChain}/>
        <AmountInput onChange={setTokenAmount}/>
        <Transfer primaryChain={primaryChain} secondaryChain={secondaryChain} amount={tokenAmount} walletAddress={address!}/>
    </div>
}

const InputGroup = memo (function ({labelName, defaultValue, onChange}: InputGroupProps) {
    return <div style={{display: "flex", flexDirection: "column", marginBottom: "20px"}}>
        <div className="spacedDiv black" style={{fontFamily: "Satoshi-Bold"}}>
            {labelName}
        </div>
        <DropdownList defaultValue={defaultValue} onChange={onChange}/>
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
            placeholder="20"
            onChange={handleChange}
        />
    </div>
});
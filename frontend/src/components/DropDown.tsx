import { memo } from "react";

interface DropdownProps {
    defaultValue: string,
    onChange: (value: string) => void
}


export const DropdownList = memo(function (props : DropdownProps) { 
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        props.onChange(event.target.value);
    };
    return (
        <select className="inputBoxStyle" value={props.defaultValue} onChange={handleChange}>
        <option value="polygon">Polygon zkEVM Testnet</option>
        <option value="base">Base Sepolia Testnet</option>
        <option value="none" disabled>More coming soon...</option>
        </select>
    )
});
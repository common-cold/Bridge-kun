export enum ButtonVariant {
    enabled,
    disabled
}

interface ButtonComponentProps {
    buttonLabel: string,
    handleOnClick: () => void,
    variant: ButtonVariant
}

export interface ConnectWalletButtonProps {
    buttonLabel: string,
    handleOnClick: () => void
}

export function ButtonComponent({buttonLabel , handleOnClick, variant} : ButtonComponentProps) {
    return <button className="bg-blue" style={{height: "40px", color: "white", fontFamily: "Satoshi-Black", fontSize: "16px",
                 borderRadius: "10px", backgroundColor: variant === ButtonVariant.enabled ? "#0098fe" : "gray", 
                 borderStyle: "none", cursor: variant === ButtonVariant.enabled ? "pointer" : "not-allowed"}}
                 disabled = {ButtonVariant.disabled === variant}
                 onClick={handleOnClick}>
                    {buttonLabel}
    </button>
}
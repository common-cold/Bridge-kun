import { atom } from "recoil";
import solanaIcon from "../assets/solana.png";
import polygonIcon from "../assets/polygon.png";

export const primaryChainAtom = atom({
    key: "primaryChainAtom",
    default: {
        value: 'polygon',
        label: 'Polygon zkEVM',
        icon: polygonIcon
    }
});

export const secondaryChainAtom = atom({
    key: "secondaryChainAtom",
    default:  {
        value: 'solana',
        label: 'Solana Devnet',
        icon: solanaIcon
    }
});

export const primaryWalletAddressAtom = atom({
    key: "primaryWalletAddressAtom",
    default: ""
});

export const secondaryWalletAddressAtom = atom({
    key: "secondaryWalletAddressAtom",
    default: ""
});

export const tokenAmountAtom = atom({
    key: "tokenAmountAtom",
    default: "0"
});

export const showWalletsAtom = atom({
    key: "showWalletsAtom",
    default: false
});

export const buttonDisabledAtom = atom({
    key: "buttonDisabledAtom",
    default: false
});
import { atom } from "recoil";
import baseIcon from "../assets/base.png";
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
        value: 'base',
        label: 'Base Sepolia',
        icon: baseIcon
    }
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

export const addressAtom = atom({
    key: "addressAtom",
    default: null
})
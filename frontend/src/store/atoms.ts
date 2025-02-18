import { atom } from "recoil";

export const primaryChainAtom = atom({
    key: "primaryChainAtom",
    default: "polygon"
});

export const secondaryChainAtom = atom({
    key: "secondaryChainAtom",
    default: "base"
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
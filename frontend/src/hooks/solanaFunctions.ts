import { BN, Idl, Program } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey } from "@solana/web3.js";
import { getProgram } from "../config";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";



export function useSolanaFunctions() {
    const MINT_AUTHORITY_KEYPAIR = Keypair.fromSecretKey(bs58.decode(import.meta.env.VITE_MINT_AUTHORITY_PRIVATE_KEY));
    const wallet = useAnchorWallet(); 
    const bridgeContract: Program<Idl> = getProgram(wallet);


    const createAta = async (ata: PublicKey) => {
        const ataTx = await bridgeContract.methods
            .createAssociatedTokenAccount()
            .accounts({
                signer: wallet!.publicKey,
                mintAccount: import.meta.env.VITE_BNFSCOIN_SOL_ADDRESS,
                associatedTokenAccount: ata,
                systemProgram: SYSTEM_PROGRAM_ID,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID 
            })
            .rpc();
        console.log("ATA Tx: " + ataTx);
    }

    const mintToken = async (ata: PublicKey, tokenAmount: BN) => {
        const mintTx = await bridgeContract.methods
            .mintToken(tokenAmount)
            .accounts({
                mintAuthority: MINT_AUTHORITY_KEYPAIR.publicKey,
                mintAccount: import.meta.env.VITE_BNFSCOIN_SOL_ADDRESS,
                associatedTokenAccount: ata,
                tokenProgram: TOKEN_2022_PROGRAM_ID
            })
            .signers([MINT_AUTHORITY_KEYPAIR])
            .rpc();
        console.log("Mint Tx: " + mintTx);
    }

    const rescaleToken18To9 = (amount: string) => {
        let decimal18Token = BigInt(Number.parseFloat(amount) * Math.pow(10, 18));
        let scalingFactor = BigInt(Math.pow(10, 9));
        return decimal18Token/scalingFactor;
    }

    return {createAta, mintToken, rescaleToken18To9};
}
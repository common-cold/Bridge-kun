import { BN, Idl, Program } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey } from "@solana/web3.js";
import { getProgram } from "../config";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { hexlify } from "ethers";



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

    const mintToken = async (userBalancePda: PublicKey, ata: PublicKey, tokenAmount: BN) => {
        const mintTx = await bridgeContract.methods
            .mintToken(tokenAmount)
            .accounts({
                mintAuthority: MINT_AUTHORITY_KEYPAIR.publicKey,
                mintAccount: import.meta.env.VITE_BNFSCOIN_SOL_ADDRESS,
                associatedTokenAccount: ata,
                userBalanceAccount: userBalancePda,
                tokenProgram: TOKEN_2022_PROGRAM_ID
            })
            .signers([MINT_AUTHORITY_KEYPAIR])
            .rpc();
        console.log("Mint Tx: " + mintTx);
        return mintTx;
    }

    const burnToken = async (walletAddress: PublicKey, ata: PublicKey, userBalancePda: PublicKey, polygonAddress: String, tokenAmount: BN) => {
        const burnTx = await bridgeContract.methods
          .burnToken(polygonAddress, tokenAmount)
          .accounts({
            signer: walletAddress,
            mintAccount: import.meta.env.VITE_BNFSCOIN_SOL_ADDRESS,
            associatedTokenAccount: ata,
            userBalanceAccount: userBalancePda,
            tokenProgram: TOKEN_2022_PROGRAM_ID
          })
          .rpc();
        console.log("Burn Tx: " + burnTx);
    }

    const pollSolanaBridgeForBalance = async (userBalancePda: PublicKey, tokenAmount: BN) => {
        //@ts-ignore
        const prevAmount: BN = (await bridgeContract.account.userBalance.fetch(userBalancePda)).balance;
        
        while(true) {
            //@ts-ignore
            const account = await bridgeContract.account.userBalance.fetch(userBalancePda);

            console.log(account.balance.toNumber());
            if (account.balance >= prevAmount.add(tokenAmount)) {
                console.log("broke free");
                break;
            }
            await new Promise(r => setTimeout(r, 5000));
        }

    }

    const createUserBalancePda = async (walletAddress: PublicKey, pdaAddress: PublicKey) => {
        const tx = await bridgeContract.methods
            .createUserBalancePda()
            .accounts({
                signer: MINT_AUTHORITY_KEYPAIR.publicKey,
                userAccount: walletAddress,
                userBalanceAccount: pdaAddress,
                systemProgram: SYSTEM_PROGRAM_ID
            })
            .signers([MINT_AUTHORITY_KEYPAIR])
            .rpc();
        
        console.log(tx);
    }

    const rescaleToken18To9 = (amount: string) => {
        let decimal18Token = BigInt(Number.parseFloat(amount) * Math.pow(10, 18));
        let scalingFactor = BigInt(Math.pow(10, 9));
        return decimal18Token/scalingFactor;
    }

    const convertBase58Tou32Bytes = (solanaAddress: string) => {
        const byteArray = bs58.decode(solanaAddress);
        const hexString = hexlify(byteArray);
        return hexString;
    }

    return {createAta, mintToken, burnToken, pollSolanaBridgeForBalance, createUserBalancePda, rescaleToken18To9, convertBase58Tou32Bytes};
}
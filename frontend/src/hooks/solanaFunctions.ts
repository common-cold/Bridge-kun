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
    const SOLANA_BRIDGE_ADDRESS = new PublicKey(import.meta.env.VITE_SOLANA_BRIDGE_ADDRESS!);
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

    const mintToken = async (walletAddress: PublicKey, ata: PublicKey, tokenAmount: BN) => {
         const [userbalancePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("balance"), walletAddress.toBuffer()],
          SOLANA_BRIDGE_ADDRESS
        );   

        const mintTx = await bridgeContract.methods
            .mintToken(tokenAmount)
            .accounts({
                mintAuthority: MINT_AUTHORITY_KEYPAIR.publicKey,
                mintAccount: import.meta.env.VITE_BNFSCOIN_SOL_ADDRESS,
                associatedTokenAccount: ata,
                userBalanceAccount: userbalancePda,
                tokenProgram: TOKEN_2022_PROGRAM_ID
            })
            .signers([MINT_AUTHORITY_KEYPAIR])
            .rpc();
        console.log("Mint Tx: " + mintTx);
        return mintTx;
    }

    const burnToken = async (walletAddress: PublicKey, ata: PublicKey, polygonAddress: String, tokenAmount: BN) => {
        const pda = PublicKey.findProgramAddressSync(
        [Buffer.from("balance"), walletAddress.toBuffer()],
          SOLANA_BRIDGE_ADDRESS
        );

        const burnTx = await bridgeContract.methods
          .burnToken(polygonAddress, tokenAmount)
          .accounts({
            signer: walletAddress,
            mintAccount: import.meta.env.VITE_BNFSCOIN_SOL_ADDRESS,
            associatedTokenAccount: ata,
            userBalanceAccount: pda[0],
            tokenProgram: TOKEN_2022_PROGRAM_ID
          })
          .rpc();
        console.log("Burn Tx: " + burnTx);
    }

    const pollSolanaBridgeForBalance = async (walletAddress: PublicKey, tokenAmount: BN) => {
        const [userbalancePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("balance"), walletAddress.toBuffer()],
          SOLANA_BRIDGE_ADDRESS
        );
        
        //@ts-ignore
        const prevAmount: BN = (await bridgeContract.account.userBalance.fetch(userbalancePda)).balance;
        
        while(true) {
            //@ts-ignore
            const account = await bridgeContract.account.userBalance.fetch(userbalancePda);

            console.log(account.balance.toNumber());
            if (account.balance >= prevAmount.add(tokenAmount)) {
                console.log("broke free");
                break;
            }
            await new Promise(r => setTimeout(r, 5000));
        }

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

    return {createAta, mintToken, burnToken, pollSolanaBridgeForBalance, rescaleToken18To9, convertBase58Tou32Bytes};
}
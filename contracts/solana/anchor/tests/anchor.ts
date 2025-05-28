import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bridge } from "../target/types/bridge";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Wallet } from "ethers";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { BN } from "bn.js";
import dotenv from "dotenv";

dotenv.config({ path: "./tests/.env" });

describe("anchor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Bridge as Program<Bridge>;

  const payerWalletKeypair = process.env.MINT_AUTHORITY_PRVATE_KEY;
  const payerWallet = Keypair.fromSecretKey(bs58.decode(process.env.MINT_AUTHORITY_PRVATE_KEY));
  const testWallet = Keypair.fromSecretKey(bs58.decode(process.env.TEST_WALLET_KEY_PAIR));
  const mint = new anchor.web3.PublicKey(process.env.MINT_ADDRESS);
  const tokenDecimals = new BN(10).pow(new BN(9));

  // it("Is initialized!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.initialize().rpc();
  //   console.log("Your transaction signature", tx);
  // });

  // it("Create token", async () => {
  //   const mint_account = new anchor.web3.Keypair();
  //   const tx = await program.methods
  //   .createTokenMint()
  //   .accounts({
  //     signer: payerWallet.publicKey,
  //     mintAccount: mint_account.publicKey,
  //     tokenProgram: TOKEN_2022_PROGRAM_ID,
  //     systemProgram: anchor.web3.SystemProgram.programId
  //   })
  //   .signers([payerWallet, mint_account])
  //   .rpc();
  //   console.log("TX: ", tx)
  // })

  // it("Deposited on Opposite chain", async () => {
  //   const pda = anchor.web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("balance"), testWallet.publicKey.toBuffer()],
  //     program.programId
  //   );
  //   console.log(pda);

  //   let tx = await program.methods
  //     .depositedOnOppositeChain(new BN(1).mul(tokenDecimals))
  //     .accounts({
  //       signer: testWallet.publicKey,
  //       userAccount: testWallet.publicKey,
  //       userBalanceAccount: pda,
  //       systemProgram: anchor.web3.SystemProgram.programId
  //     })
  //     .signers([testWallet])
  //     .rpc();

  //     console.log(tx);
  // });

  // it("Create Associated Token account", async () => {
  
  //   const ata = getAssociatedTokenAddressSync(
  //     mint,
  //     payerWallet.publicKey,
  //     false,
  //     TOKEN_2022_PROGRAM_ID,
  //     ASSOCIATED_TOKEN_PROGRAM_ID
  //   );
    
  //   const tx2 = await program.methods
  //   .createAssociatedTokenAccount()
  //   .accounts({
  //     signer: payerWallet.publicKey,
  //     mintAccount: mint,
  //     associatedTokenAccount: ata,
  //     systemProgram: anchor.web3.SystemProgram.programId,
  //     tokenProgram: TOKEN_2022_PROGRAM_ID,
  //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID 
  //   })
  //   .signers([payerWallet])
  //   .rpc();

  //   console.log("Ata TX: " + tx2);
  // })

  // it("Mint token to ATA", async () => {
  //   const ata = getAssociatedTokenAddressSync(
  //     mint,
  //     testWallet.publicKey,
  //     false,
  //     TOKEN_2022_PROGRAM_ID,
  //     ASSOCIATED_TOKEN_PROGRAM_ID
  //   );

  //   const newWallet = new PublicKey("ywouFgXjDx2aJizmAG4DBKcxUrfvNn1kjtpwpB2Xtaf")
  //   const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("balance"), newWallet.toBuffer()],
  //     program.programId
  //   );
  //   console.log(ata);

  //   const tx = await program.methods
  //     .mintToken(new BN(2).mul(tokenDecimals).div(new BN(100)))
  //     .accounts({
  //         mintAuthority: payerWallet.publicKey,
  //         mintAccount: mint,
  //         associatedTokenAccount: ata,
  //         userBalanceAccount: pda,
  //         tokenProgram: TOKEN_2022_PROGRAM_ID
  //     })
  //     .signers([payerWallet])
  //   .rpc();

  //   console.log("Mint TX: " + tx);

  // });

  it("Burn Tokens", async () => {
    const pda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("balance"), testWallet.publicKey.toBuffer()],
      program.programId
    );
    console.log("PDA: " + pda[0]);

    const ata = getAssociatedTokenAddressSync(
      mint,
      testWallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const tx = await program.methods
      .burnToken("ywouFgXjDx2aJizmAG4DBKcxUrfvNn1kjtpwpB2Xtaf", new BN(2).mul(tokenDecimals).div(new BN(100)))
      .accounts({
        signer: testWallet.publicKey,
        mintAccount: mint,
        associatedTokenAccount: ata,
        userBalanceAccount: pda[0],
        tokenProgram: TOKEN_2022_PROGRAM_ID
      })
      .signers([testWallet])
      .rpc();
      console.log(tx);
  });

  // it("Read balance", async () => {
  //   const newWallet = new PublicKey("ywouFgXjDx2aJizmAG4DBKcxUrfvNn1kjtpwpB2Xtaf")
  //   const pda = anchor.web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("balance"), newWallet.toBuffer()],
  //     program.programId
  //   );
  //   const ata = getAssociatedTokenAddressSync(
  //     mint,
  //     testWallet.publicKey,
  //     false,
  //     TOKEN_2022_PROGRAM_ID,
  //     ASSOCIATED_TOKEN_PROGRAM_ID
  //   );
  //   console.log(pda);
  //   console.log(ata);   
  //   try {
  //     const connection = new Connection("https://api.devnet.solana.com");
  //     const balanceAccount = await program.account.userBalance.fetch(pda[0]);
  //     const ataAccount = await getAccount(connection, ata, "confirmed", TOKEN_2022_PROGRAM_ID);
  //     console.log(balanceAccount.balance.toNumber());
  //     console.log(ataAccount.amount);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // });

});

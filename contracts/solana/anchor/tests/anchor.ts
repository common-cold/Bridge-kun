import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bridge } from "../target/types/bridge";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Wallet } from "ethers";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { BN } from "bn.js";

describe("anchor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Bridge as Program<Bridge>;

  const payerWallet = Keypair.fromSecretKey(bs58.decode("4z51TiKiNBqHN6ik2poMKZfTKfGyQkjNU6z7AtBjUNNvfCkhiHNWr87jF8xXtnHHYU3qVnV1a8qQxtCVQAC8nt1P"));
  const mint = new anchor.web3.PublicKey("9tRbLwrMqR4RaWLbLdRJGW8fKsd3ft7pUwp2nTHtJcdZ");
  const tokenDecimals = new BN(10).pow(new BN(6));

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Create token", async () => {
    const mint_account = new anchor.web3.Keypair();
    const tx = await program.methods
    .createTokenMint()
    .accounts({
      signer: payerWallet.publicKey,
      mintAccount: mint_account.publicKey,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([payerWallet, mint_account])
    .rpc();
    console.log("TX: ", tx)
  })

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
  //     payerWallet.publicKey,
  //     false,
  //     TOKEN_2022_PROGRAM_ID,
  //     ASSOCIATED_TOKEN_PROGRAM_ID
  //   );
  //   console.log(ata);

  //   const tx = await program.methods
  //   .mintToken(new BN(4).mul(tokenDecimals))
  //   .accounts({
  //     mintAuthority: anchor.getProvider().wallet.publicKey,
  //     mintAccount: mint,
  //     associatedTokenAccount: ata,
  //     tokenProgram: TOKEN_2022_PROGRAM_ID
  //   })
  //   .rpc();

  //   console.log("Mint TX: " + tx);

  // });

});

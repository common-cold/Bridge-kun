import { Address } from "viem"
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { baseAbi, nfsCoinAbi, polygonAbi } from "../contract/abi";
import { ethers } from "ethers";
import { baseSepolia, polygonZkEvmCardona } from "viem/chains";
import { useRecoilState, useRecoilValue } from "recoil";
import { buttonDisabledAtom, primaryChainAtom, primaryWalletAddressAtom, secondaryChainAtom, secondaryWalletAddressAtom, tokenAmountAtom } from "../store/atoms";
import { baseClient, getProgram, polygonBridgeContract, polygonClient } from '../config'
import toast from "react-hot-toast";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { BN, Idl, Program } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import{ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID} from "@solana/spl-token";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { usePolygonFunctions } from "../hooks/polygonFunctions";
import { useBaseFunctions } from "../hooks/baseFunctions";
import { useSolanaFunctions } from "../hooks/solanaFunctions";


const POLYGON_CARDONA_ID = polygonZkEvmCardona.id;
const BASE_SEPOLIA_ID = baseSepolia.id;
const tokenDecimals = new BN(10).pow(new BN(9));
const MINT_AUTHORITY_KEYPAIR = Keypair.fromSecretKey(bs58.decode(import.meta.env.VITE_MINT_AUTHORITY_PRIVATE_KEY));


export function Transfer() {
    const primaryChain = useRecoilValue(primaryChainAtom);
    const secondaryChain = useRecoilValue(secondaryChainAtom);
    const primaryAddress = useRecoilValue(primaryWalletAddressAtom);
    const secondaryAddress = useRecoilValue(secondaryWalletAddressAtom);
    const amount = useRecoilValue(tokenAmountAtom);
    const [buttonDisabled, setButtonDisabled] = useRecoilState(buttonDisabledAtom);
    const {writeContractAsync} = useWriteContract();
    const { chainId } = useAccount();
    const wallet = useAnchorWallet(); 
    const {connection} = useConnection();
    const {address: wagmiAddress} = useAccount();
    const bridgeContract: Program<Idl> = getProgram(wallet);
    const {lockTokenOnPolygon, withdrawFromPolygon, pollPolygonBridgeForBalance} = usePolygonFunctions(); 
    const {withdrawFromBase, burnTokenOnBase, pollBaseBridgeForBalance} = useBaseFunctions();
    const {createAta, mintToken, pollSolanaBridgeForBalance, rescaleToken18To9, convertBase58Tou32Bytes} = useSolanaFunctions();
    async function transfer() {
        try{
            if(primaryChain.value == "polygon" && secondaryChain.value == "base") {
                if (chainId !== polygonZkEvmCardona.id) {
                    throw new Error ("Please switch your network to Polygon zkEVm Cardona");
                }

                const tokenAmount = ethers.parseUnits(amount, 18);
                setButtonDisabled(true);
                
                //lock token on Polygon
                await lockTokenOnPolygon(tokenAmount, null);

                //Check if the event relayed to base bridge via nodejs indexer by polling the user balance 
                await pollBaseBridgeForBalance(tokenAmount);
                let tx = await withdrawFromBase(tokenAmount);

                toast.success(
                            <div className="toastMessage">
                              Bridge Successful!<br />
                              <a
                                href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#3674e5', textDecoration: 'underline' }}
                              >
                                View on Base Sepolia Explorer
                              </a>
                            </div>,
                    {duration: 10000}
                );

            } else if (primaryChain.value == "base" && secondaryChain.value == "polygon") {
                if (chainId !== baseSepolia.id) {
                    throw new Error ("Please switch your network to Base Sepolia");
                }

                const tokenAmount = ethers.parseUnits(amount, 18);
                setButtonDisabled(true);

                //Call burn on base bridge
                await burnTokenOnBase(tokenAmount);

                //Check if the event relayed to polygon bridge via nodejs indexer by polling the user balance 
                await pollPolygonBridgeForBalance(tokenAmount);
                let tx = await withdrawFromPolygon(tokenAmount);

                toast.success(
                    <div className="toastMessage">
                      Bridge Successful!<br />
                      <a
                        href={`https://cardona-zkevm.polygonscan.com/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3674e5', textDecoration: 'underline' }}
                      >
                        View on Polygon Cardona Explorer
                      </a>
                    </div>,
                    {duration: 10000}
                );
            } else if (primaryChain.value === "polygon" && secondaryChain.value === "solana") {
                const tokenAmount = ethers.parseUnits(amount, 18);
                setButtonDisabled(true);
                
                const encodedSolanaWalletAddr = convertBase58Tou32Bytes(wallet!.publicKey.toString());
                //lock token on Polygons
                await lockTokenOnPolygon(tokenAmount, encodedSolanaWalletAddr);

                //rescale token from 18 decimal in Polygon to 9 decimal in Solana
                let rescaledTokenAmount = new BN(rescaleToken18To9(amount).toString());

                //Check if the event relayed to solana bridge via nodejs indexer by polling the user balance
                await pollSolanaBridgeForBalance(wallet!.publicKey, rescaledTokenAmount);
                const ata = getAssociatedTokenAddressSync(
                    new PublicKey(import.meta.env.VITE_BNFSCOIN_SOL_ADDRESS),
                    wallet?.publicKey!,
                    false,
                    TOKEN_2022_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );
                console.log("ATA: " + ata);
                const ataInfo = await connection.getAccountInfo(ata);
                if (!ataInfo) {
                    //first create an ATA for the wallet
                    await createAta(ata);
                }
                //minting equivalent amount to ATA
                const tx = await mintToken(wallet!.publicKey, ata, rescaledTokenAmount);

                toast.success(
                    <div className="toastMessage">
                      Bridge Successful!<br />
                      <a
                        href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3674e5', textDecoration: 'underline' }}
                      >
                        View on Solana Devnet Explorer
                      </a>
                    </div>,
                    {duration: 10000}
                );
            }
            
            setButtonDisabled(false);
    
        } catch(e) {
            const error = e as Error;
            toast.error(
                <div className="toastMessage">
                  {error.message}
                </div>,
                { duration: 6000 }
            );
            console.log(error);  
            setButtonDisabled(false);
        }

    }
    
    
    return <button className="bg-blue" style={{height: "40px", color: "white", fontFamily: "Satoshi-Black", fontSize: "16px",
                 borderRadius: "10px", backgroundColor: buttonDisabled ? "gray" : "#0098fe", 
                 borderStyle: "none", cursor: buttonDisabled ? "not-allowed" : "pointer"}}
                 disabled = {!primaryAddress || !secondaryAddress || buttonDisabled}
                 onClick={()=> (transfer())}>
                    Transfer
    </button>
}
import { useAccount } from "wagmi"
import { ethers } from "ethers";
import { baseSepolia, polygonZkEvmCardona } from "viem/chains";
import { useRecoilState, useRecoilValue } from "recoil";
import { buttonDisabledAtom, primaryChainAtom, primaryWalletAddressAtom, secondaryChainAtom, secondaryWalletAddressAtom, tokenAmountAtom } from "../store/atoms";
import toast from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import{ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID} from "@solana/spl-token";
import { usePolygonFunctions } from "../hooks/polygonFunctions";
import { useBaseFunctions } from "../hooks/baseFunctions";
import { useSolanaFunctions } from "../hooks/solanaFunctions";
import { CustomError } from "../class/CustomError";



export function Transfer() {
    const primaryChain = useRecoilValue(primaryChainAtom);
    const secondaryChain = useRecoilValue(secondaryChainAtom);
    const primaryAddress = useRecoilValue(primaryWalletAddressAtom);
    const secondaryAddress = useRecoilValue(secondaryWalletAddressAtom);
    const amount = useRecoilValue(tokenAmountAtom);
    const [buttonDisabled, setButtonDisabled] = useRecoilState(buttonDisabledAtom);
    const { chainId } = useAccount();
    const wallet = useAnchorWallet(); 
    const {connection} = useConnection();;
    const {lockTokenOnPolygon, withdrawFromPolygon, pollPolygonBridgeForBalance} = usePolygonFunctions(); 
    const {withdrawFromBase, burnTokenOnBase, pollBaseBridgeForBalance} = useBaseFunctions();
    const {createAta, mintToken, burnToken, pollSolanaBridgeForBalance, rescaleToken18To9, convertBase58Tou32Bytes} = useSolanaFunctions();
    async function transfer() {
        try{
            if(primaryChain.value === "polygon" && secondaryChain.value === "base") {
                if (chainId !== polygonZkEvmCardona.id) {
                    throw new CustomError ("Please switch your network to Polygon zkEVm Cardona");
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

            } else if (primaryChain.value === "base" && secondaryChain.value === "polygon") {
                if (chainId !== baseSepolia.id) {
                    throw new CustomError ("Please switch your network to Base Sepolia");
                }

                const tokenAmount = ethers.parseUnits(amount, 18);
                setButtonDisabled(true);

                //Call burn on base bridge
                await burnTokenOnBase(tokenAmount);

                //Check if the event relayed to polygon bridge via nodejs indexer by polling the user balance 
                await pollPolygonBridgeForBalance(tokenAmount);

                //call withdraw on polygon
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
            } else if (primaryChain.value === "solana" && secondaryChain.value === "polygon") {
              
              //rescale token to 9 decimal for Solana
              let rescaledTokenAmount = new BN(rescaleToken18To9(amount).toString());
              setButtonDisabled(true);

              //call burnToken on solana
              const ata = getAssociatedTokenAddressSync(
                    new PublicKey(import.meta.env.VITE_BNFSCOIN_SOL_ADDRESS),
                    wallet?.publicKey!,
                    false,
                    TOKEN_2022_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );
              console.log("ATA: " + ata);
              await burnToken(wallet!.publicKey, ata, secondaryAddress!, rescaledTokenAmount);

              //Check if the event relayed to polygon bridge via nodejs indexer by polling the user balance
              const tokenAmount = ethers.parseUnits(amount, 18);
              await pollPolygonBridgeForBalance(tokenAmount);

              //call withdraw on polygon
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

            }
            
            setButtonDisabled(false);
    
        } catch(e) {
            let toastMessage;
            if (e instanceof(CustomError)) {
              toastMessage = e.message;
            } else {
              toastMessage = "Unexpected Error. Please try again later" 
            }
            toast.error(
                <div className="toastMessage">
                  {toastMessage}
                </div>,
                { duration: 6000 }
            );
            console.log(e);  
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
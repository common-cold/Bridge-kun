"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BridgeEvent {
    constructor(event_type, source_address, polygon_address, amount) {
        this.event_type = event_type;
        this.source_address = source_address;
        this.polygon_address = polygon_address;
        this.amount = amount;
    }
}
const schema = {
    struct: {
        event_type: 'string',
        source_address: { array: { type: 'u8', len: 32 } },
        polygon_address: 'string',
        amount: 'u64'
    }
};
// const res = "Zb1eU3aiYdwEAAAAQnVybg6Wf2S/iAnDdb1s8fnrnyCsEUFy0j7FIRjRUsP8lxWMKgAAADB4ZjM5N0E2RDIyRmQxQTM1ZjNlNTlDYjcyQzM1ZkYxYmYyMDJFYUUyYwAAAAAAAAAA";
// const tes = "Zb1eU3aiYdwEAAAAQnVybg6Wf2S/iAnDdb1s8fnrnyCsEUFy0j7FIRjRUsP8lxWMKgAAADB4ZjM5N0E2RDIyRmQxQTM1ZjNlNTlDYjcyQzM1ZkYxYmYyMDJFYUUyYwBlzR0AAAAA"
// const buffer = Buffer.from(tes, "base64");
// const obj = borsh.deserialize(schema, buffer.slice(8));
// console.log(obj);
// const log = [
//         "Program G3dDgLNsvXbwk3VEwdaJ48Ju7Cruk3M9Xk3kQwhAZKht invoke [1]",
//         "Program log: Instruction: BurnToken",
//         "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb invoke [2]",
//         "Program log: Instruction: Burn",
//         "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb consumed 1676 of 192854 compute units",
//         "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb success",
//         "Program data: Zb1eU3aiYdwEAAAAQnVybg6Wf2S/iAnDdb1s8fnrnyCsEUFy0j7FIRjRUsP8lxWMKgAAADB4ZjM5N0E2RDIyRmQxQTM1ZjNlNTlDYjcyQzM1ZkYxYmYyMDJFYUUyYwBlzR0AAAAA",
//         "Program G3dDgLNsvXbwk3VEwdaJ48Ju7Cruk3M9Xk3kQwhAZKht consumed 9822 of 200000 compute units",
//         "Program G3dDgLNsvXbwk3VEwdaJ48Ju7Cruk3M9Xk3kQwhAZKht success"
// ];  
// let isBurnTopic = log.includes("Program log: Instruction: BurnToken");
// if (isBurnTopic) {
//   const programDataString = log.filter(value => (
//     startsWith(value, "Program data")
//   ));
//   if(!programDataString || programDataString.length === 0) {
//     console.log("Not expected event");
//   }
//   const programData = extractData(programDataString[0]);
//   let event = deserializeEventData(programData);
//   let logData: QueueData = {
//     topic: "BURN_SOLANA",
//     receiver: event.polygon_address,
//     amount: rescaleToken9To18(event.amount)
//   }
//   console.log(logData);
// }  else {
//   console.log("Not burn topic");
// }
// const res = bs58.decode("ywouFgXjDx2aJizmAG4DBKcxUrfvNn1kjtpwpB2Xtaf");
// console.log(ethers.decodeBase58("ywouFgXjDx2aJizmAG4DBKcxUrfvNn1kjtpwpB2Xtaf"));
// const hexres = hexlify(res);
// console.log(hexres);
// const res2 =  bs58.encode(Uint8Array.from(Buffer.from(hexres.slice(2), "hex")));
// console.log(res2);
// const mintToSolanaInterface = new ethers.Interface([
//     "event MintToSolana(address indexed sender, bytes32 solanaAddress, uint256 amount)"
// ]);
// const log = {
//     transactionHash: '0x5dffeaae04f0a92666129ddcd2d8e5ba5cff1de0c84fc51b981444db34d8e596',
//     blockHash: '0x4831e1712673fe49412924c8a8a2192092608c669fa4f7c3cc97392293b0e367',
//     blockNumber: 13235637,
//     removed: false,
//     address: '0xDf48C593De5b6226570d002d509d8918c95b9Be1',
//     data: '0x0e967f64bf8809c375bd6cf1f9eb9f20ac114172d23ec52118d152c3fc97158c0000000000000000000000000000000000000000000000000429d069189e0000',
//     topics: [
//       '0x0ebc79505950d7b401caf8f8cd7297d588e72b98c23a9ae9778bda20bcdbc762',
//       '0x000000000000000000000000f397a6d22fd1a35f3e59cb72c35ff1bf202eae2c'
//     ],
//     index: 1,
//     transactionIndex: 0
// };
// const decoded = mintToSolanaInterface.decodeEventLog("MintToSolana", log.data, log.topics);
// console.log(decoded);
// console.log(decoded[0]);
// const MINT_TO_SOLANA_TOPIC = process.env.MINT_TO_SOLANA_TOPIC;
// const SOLANA_BRIDGE_ADDRESSs = "G3dDgLNsvXbwk3VEwdaJ48Ju7Cruk3M9Xk3kQwhAZKht";
// const SOLANA_BRIDGE_ADDRESS = new PublicKey(SOLANA_BRIDGE_ADDRESSs);
// const connection = new Connection("https://api.devnet.solana.com");
// const signerSolana = Keypair.fromSecretKey(bs58.decode("4z51TiKiNBqHN6ik2poMKZfTKfGyQkjNU6z7AtBjUNNvfCkhiHNWr87jF8xXtnHHYU3qVnV1a8qQxtCVQAC8nt1P"));
// function createDepositedOnOppChainTx(queueData: QueueData) {
//     const pubkey = new PublicKey(queueData.receiver!);
//     const tokenAmount = BigInt(queueData.amount);
//     const [userBalancePda, bump] = PublicKey.findProgramAddressSync(
//         [Buffer.from("balance"), pubkey.toBuffer()],
//         SOLANA_BRIDGE_ADDRESS
//     );
//     console.log("PDA: " + userBalancePda);
//     const ix = new TransactionInstruction({
//         keys: [
//             {pubkey: signerSolana.publicKey, isSigner: true, isWritable: true},
//             {pubkey: pubkey, isSigner: false,isWritable: false},
//             {pubkey: userBalancePda, isSigner: false,isWritable: true},
//             {pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false}
//         ],
//         programId: SOLANA_BRIDGE_ADDRESS,
//         data: serializeData(tokenAmount)
//     });
//     return ix;
// }
// async function deposit() {
//   const queueData: QueueData = {
//         topic: "MintToSolana(address,bytes32,uint256)",
//         receiver: "4j95jypPWoXZHADKTvvGpXGUsyigpmDBoeot2npCwQTe",
//         amount: BigInt(1000000000).toString()
//   } 
//   const ix = createDepositedOnOppChainTx(queueData);
//   console.log("IX: " + JSON.stringify(ix));
//   const tx = new Transaction().add(ix);
//   const blockhash = await connection.getLatestBlockhash();
//   tx.recentBlockhash = blockhash.blockhash;
//   tx.feePayer = signerSolana.publicKey;
//   const signature = await connection.sendTransaction(tx, [signerSolana]);
//   console.log("Signature: " + JSON.stringify(signature));
// }
// deposit();
const ethers_1 = require("ethers");
const rawTx = "0xd9caed12000000000000000000000000744c083be5755351e3c9762ac131766cbfd83b4c000000000000000000000000f397a6d22fd1a35f3e59cb72c35ff1bf202eae2c0000000000000000000000000000000000000000000000000de0b6b3a7640000"; // the hex from your error
const parsed = ethers_1.Transaction.from(rawTx);
console.log(JSON.stringify(parsed));
// const polygonClient = createPublicClient({ 
//     chain: polygonZkEvmCardona,
//     transport: http("https://polygonzkevm-cardona.g.alchemy.com/v2/IA5XqK-rU0LYpFekBWARC-2_lWQNqmFG")
// });
// const baseClient = createPublicClient({ 
//     chain: baseSepolia,
//     transport: http("https://base-sepolia.g.alchemy.com/v2/IA5XqK-rU0LYpFekBWARC-2_lWQNqmFG")
// });
// async function getNonce() {
//   const confirmed = await polygonClient.getTransactionCount({
//   address: "0x94A4abD13582A287ab7454866D1f6ccfd46Ae5c6",
//   blockTag: "latest",
//   });
//   const pending = await polygonClient.getTransactionCount({
//     address: "0x94A4abD13582A287ab7454866D1f6ccfd46Ae5c6",
//     blockTag: "pending",
//   });
//   console.log("Confirmed nonce:", confirmed);
//   console.log("Pending nonce:", pending);
// }
// getNonce();

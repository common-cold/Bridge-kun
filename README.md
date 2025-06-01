# <h1 align="center"> Bridge-kun 🌉 </h1>

**A One-Way Bridge for transferring tokens between Polygon, Solana and Base blockchains.** 🚀

---

### Key Components 🧩

1. **Backend** 🛠️: Contains the Indexer, handles blockchain interactions, event polling, and queue processing.  
2. **Frontend** 💻: A React + TypeScript + Vite application for user interaction.  
3. **Smart Contracts** 🔗: Solidity & Anchor contracts for bridging tokens between Polygon, Base and Solana.  

---

## Usage 🧑‍💻

1. This is a **one-way bridge**, so assets from **Polygon zkEVM Cardona TestNet** can be transferred to **Base Sepolia** & **Solana Devnet**.  
2. It supports **NFSCoin** present on Polygon, which can be bridged to **BNFSCoin** on Base & Solana.
3. **NFSCoin** and **BNFSCoin** reside at `0x744c083Be5755351e3c9762AC131766cbFd83b4c` on **Polygon** & **Base**.
4. Mint of **BNFSCoin** on **Solana Devent** resides at `9tRbLwrMqR4RaWLbLdRJGW8fKsd3ft7pUwp2nTHtJcdZ`
> **NFSCoin** stands for **Need For Speed Coin**, inspired by the popular racing game. 🏎️  

### Steps to Use:

1. **Switch your wallet** to **Polygon zkEVM Cardona Testnet**.
2. Airdrop yourself some **Polygon Cardona ETH**. 
3. **Airdrop yourself NFSCoin** using the button at the top right (you will receive **10 NFSCoin**).  
4. Airdrop yourself some **Base Sepolia ETH** and **Solana Devent** on resepective wallets before transferring to respective chains
5. You can now **bridge any amount of NFSCoin** from **Polygon zkEVM Cardona Testnet** to **Base Sepolia** or **Solana Devent**.
6. Similarly, you can bridge **BNFSCoin** **from Base Sepolia** or **Solana Devent** back to **Polygon zkEVM**.  

Enjoy seamless and secure token transfers! 🌉✨

---

## Demo 💻

### Polygon to Solana Transfer


https://github.com/user-attachments/assets/b1181e2f-5a5f-4704-8fb7-98add911d937




### Solana to Polygon Transfer


https://github.com/user-attachments/assets/8a8ebfdf-8280-44f9-b3dd-5be361ef5275




### Polygon to Base Transfer


https://github.com/user-attachments/assets/0910e7f1-f149-42c4-bd87-0d95e81eb7fd



### Base to Polygon Transfer
   

https://github.com/user-attachments/assets/c63e3eec-228a-444e-a2a7-1028dfac819c



---

## Backend 🛠️

The backend contains the Indexer and is responsible for interacting with the blockchain, processing events, and managing the bridging logic.

### Backend Setup ⚙️

1. Navigate to the `backend` directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PRIVATE_KEY=""
   POLYGON_BRIDGE_ADDRESS=""
   BASE_BRIDGE_ADDRESS=""
   NFSCOIN_ADDRESS="0x744c083Be5755351e3c9762AC131766cbFd83b4c"
   BNFSCOIN_ADDRESS="0x744c083Be5755351e3c9762AC131766cbFd83b4c"
   POLYGON_RPC_URL=""
   BASE_RPC_URL=""
   MINT_TOPIC="Mint(address,uint256)"
   BURN_TOPIC="Burn(address,uint256)"
   BURN_TOPIC_SOLANA = "BURN_TOPIC_SOLANA"
   MINT_TO_SOLANA_TOPIC = "MintToSolana(address,bytes32,uint256)"
   SOLANA_BRIDGE_ADDRESS = ""
   BNFSCOIN_SOL_ADDRESS = ""
   MINT_AUTHORITY_PRIVATE_KEY = ""
   ```
4. Start the backend:
   ```sh
   npm run dev
   ```

---

## Frontend 💻

The frontend provides a user interface for interacting with the cross-chain bridge.

### Frontend Setup ⚙️

1. Navigate to the `frontend` directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   VITE_PRIVATE_KEY=""
   VITE_POLYGON_BRIDGE_ADDRESS=""
   VITE_BASE_BRIDGE_ADDRESS=""
   VITE_NFSCOIN_ADDRESS="0x744c083Be5755351e3c9762AC131766cbFd83b4c"
   VITE_BNFSCOIN_ADDRESS="0x744c083Be5755351e3c9762AC131766cbFd83b4c"
   VITE_POLYGON_RPC_URL=""
   VITE_BASE_RPC_URL=""
   VITE_MINT_TOPIC="Mint(address,uint256)"
   VITE_BURN_TOPIC="Burn(address,uint256)"
   VITE_SOLANA_BRIDGE_ADDRESS = ""
   VITE_BNFSCOIN_SOL_ADDRESS = ""
   VITE_MINT_AUTHORITY_PRIVATE_KEY = ""
   ```
4. Start the frontend:
   ```sh
   npm run dev
   ```

---

## Smart Contracts 📜

### Solana Bridge Program Overview

The Solana Anchor program implements the bridging logic for tokens between Solana and EVM chains. Key features include:

- **Token Minting & Burning:**  
  - Allows minting of bridged tokens (`BNFSCOIN`) on Solana when assets are locked on the opposite chain.
  - Supports burning tokens on Solana to initiate unlocks on the EVM side.

- **User Balance Management:**  
  - Maintains per-user balances via PDAs to track bridged assets and prevent double spending.

- **Token Metadata:**  
  - Initializes token mints with metadata (name, symbol) for bridged assets.

- **Event Emission:**  
  - Emits events (e.g., `Burn`) for off-chain indexers to track cross-chain activity.

- **Security Checks:**  
  - Ensures users cannot mint or burn more than their available balance.

This program is designed to be called by the backend/indexer when cross-chain events are detected, enabling seamless and secure bridging between Solana and EVM networks.

### Polygon/Base Bridge Contract Overview
-  **PolygonBridge.sol**: Handles bridging logic on the Polygon chain (This is the primary chain).  
- **BaseBridge.sol**: Handles bridging logic on the Base chain.  
- **NFSCoin.sol**: ERC-20 token implementation.
- **BNFSCoin.sol**: Another ERC-20 token implementation.  
- **IBNFSCoin.sol**: Interface for the BNFSCoin contract.  

---

## Tech Stack 🧰

- **Frontend**: React, Recoil, ethers.js, wagmi  
- **Backend**: Node.js, TypeScript, Bull, Redis, ethers.js  
- **Smart Contracts**: Anchor, Solidity, Foundry, OpenZeppelin Contracts  

---

## Future Enhancements 🚀✨

1. Add support for **multiple tokens** to enable broader use cases. 🪙  
2. Upgrade the current **one-way bridge** to a **multi-directional bridge** for seamless transfers in both directions. 🔄

---

## License 📜

This project is licensed under the [MIT License](LICENSE). 📝

---

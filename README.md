# <h1 align="center"> Bridge-kun 🌉 </h1>

**A One-Way Bridge for transferring tokens between Polygon and Base blockchains.** 🚀

---

### Key Components 🧩

1. **Backend** 🛠️: Contains the Indexer, handles blockchain interactions, event polling, and queue processing.  
2. **Frontend** 💻: A React + TypeScript + Vite application for user interaction.  
3. **Smart Contracts** 🔗: Solidity contracts for bridging tokens between Polygon and Base.  

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
   NFSCOIN_ADDRESS=""
   BNFSCOIN_ADDRESS=""
   POLYGON_RPC_URL=""
   BASE_RPC_URL=""
   MINT_TOPIC="Mint(address,uint256)"
   BURN_TOPIC="Burn(address,uint256)"
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
   VITE_NFSCOIN_ADDRESS=""
   VITE_BNFSCOIN_ADDRESS=""
   VITE_POLYGON_RPC_URL=""
   VITE_BASE_RPC_URL=""
   VITE_MINT_TOPIC="Mint(address,uint256)"
   VITE_BURN_TOPIC="Burn(address,uint256)"
   ```
4. Start the frontend:
   ```sh
   npm run dev
   ```

---

## Smart Contracts 🔗

The smart contracts implement the bridging logic and token standards.

### Contracts 📜

- **PolygonBridge.sol**: Handles bridging logic on the Polygon chain (This is the primary chain).  
- **BaseBridge.sol**: Handles bridging logic on the Base chain.  
- **NFSCoin.sol**: ERC-20 token implementation.  
- **BNFSCoin.sol**: Another ERC-20 token implementation.  
- **IBNFSCoin.sol**: Interface for the BNFSCoin contract.  

### Deployment 🚀

1. Compile and deploy `PolygonBridge.sol` & `NFSCoin.sol` contracts on the **Polygon zkEVM** network using your preferred tool (e.g., Hardhat, Remix).  
2. Compile and deploy `BaseBridge.sol` & `BNFSCoin.sol` contracts on the **Base Sepolia** network using your preferred tool (e.g., Hardhat, Remix).  
3. Update the `.env` files in both `backend` and `frontend` with the deployed contract addresses.  

---

## Tech Stack 🧰

- **Frontend**: React, Recoil, ethers.js, wagmi  
- **Backend**: Node.js, TypeScript, Bull, Redis, ethers.js  
- **Smart Contracts**: Solidity, Foundry, OpenZeppelin Contracts  

---

## Future Enhancements 🚀✨

1. Extend bridging functionality to support **Solana** blockchain networks. 🌐  
2. Add support for **multiple tokens** to enable broader use cases. 🪙  
3. Upgrade the current **one-way bridge** to a **multi-directional bridge** for seamless transfers in both directions. 🔄  

---

## License 📜

This project is licensed under the [MIT License](LICENSE). 📝

---

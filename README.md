# RozgarID — Self Sovereign Identity for Migrant Workers

RozgarID is a comprehensive, self-sovereign identity (SSI) ecosystem specifically designed to empower migrant workers with verifiable credentials. The system allows workers to securely manage and share verified work histories, identity proofs, and other critical credentials, effectively bridging the trust gap between informal sector workers and modern employers.

## 🏗️ Project Architecture

This is a complete monorepo setup utilizing separate NPM workspaces to manage the entire platform seamlessly:

### 1. Core Backend (`/backend`)
A fast Node.js/Express backend that acts as the backbone of the application. It handles credential issuance logic, secure database management (MongoDB), smart contract integrations, and robust APIs required for verifying IDs.

### 2. Employer & Verifier Portal (`/frontend`)
A responsive React & Vite frontend specifically built for credential issuers (like non-profits, government bodies) and verifiers (employers). It enables them to issue verifiable credentials and quickly authenticate user-presented credentials via QR codes.

### 3. Worker Wallet PWA (`/wallet-pwa`)
Meticulously styled Progressive Web Application (PWA) tailored for the workers. It functions as a digital credential wallet where workers can securely receive, store, view, and share their decentralized verifiable proofs. It is fully responsive and primarily built for mobile experiences.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- Recommended: NPM

### Installation

From the project root directory, run the following command to install the dependencies across all workspace packages:

```bash
npm install
```

### Running Development Servers

The root `package.json` is equipped with useful scripts. You can run individual pieces of the stack simultaneously:

**Start the Backend API Server:**
```bash
npm run dev:backend
```
*(By default, this will run on `http://localhost:5000`)*

**Start the Issuer/Verifier Frontend Portal:**
```bash
npm run dev:frontend
```
*(Usually runs at `http://localhost:5173`)*

**Start the Worker Wallet Application:**
```bash
npm run dev:wallet
```

*(Usually runs at `http://localhost:5174` or similar)*

---

## 🔒 Security & Verifications
- Incorporates industry-level encryption and secure QR code hashing for credentials verification.
- Uses blockchain-based anchoring on the Polygon Amoy Testnet (where applicable) to secure the integrity of the credentials.

🏥 Patient Record Blockchain System

A hybrid medical record management system integrating:

Next.js (Frontend + Backend API)

Prisma + SQLite (Database)

JWT Authentication

Role-Based Access Control

Solidity Smart Contract

Hardhat Local Blockchain

SHA-256 Cryptographic Hashing

📌 Project Overview

This system allows:

👨‍⚕️ Doctors to create medical records

👤 Patients to view their own records

⛓️ Blockchain to store cryptographic hashes of records

The actual medical data is stored off-chain in the database.

Only the SHA-256 hash of the record is stored on-chain to ensure integrity.

🏗️ System Architecture
User (Doctor / Patient)
        ↓
Next.js Frontend
        ↓
Next.js API Routes
        ↓
Prisma ORM
        ↓
SQLite Database

AND

Medical Record (Serialized)
        ↓
SHA-256 Hash
        ↓
MedicalRecord Smart Contract
        ↓
Hardhat Local Blockchain
🔐 Security Design
Why Hybrid?

Medical data should NOT be stored directly on blockchain because:

Blockchain storage is expensive

Blockchain is public

Sensitive data must remain private

Instead:

Full record → Database

Hash of record → Blockchain

If database data changes:

Hash changes

Blockchain hash remains same

Tampering can be detected

👥 User Roles
Role	Permissions
DOCTOR	Create records, view patient records
PATIENT	View own records
ADMIN	Reserved (not implemented yet)

Role validation is enforced server-side using JWT.

🗄️ Database Schema
1️⃣ User Model

Fields:

id (Primary Key)

name

email (Unique)

password (bcrypt hashed)

role (PATIENT / DOCTOR / ADMIN)

createdAt

Relationship:
One User → Many PatientRecords

2️⃣ PatientRecord Model

Fields:

id

patientId (Foreign Key → User.id)

diagnosis

treatment

createdAt

🔌 Backend APIs (Current Implementation)
🟢 Register User
POST /api/auth/register

Registers a new user with role.

🟢 Login User
POST /api/auth/login

Returns JWT stored in HTTP-only cookie.

🟢 Get Current User
GET /api/auth/me

Returns authenticated user details.

🟢 Create Medical Record (Blockchain Integrated)
POST /api/records/create

Flow:

JWT verified

Role checked (must be DOCTOR)

Record inserted into database

Record serialized

SHA-256 hash generated

Smart contract storeRecord() called

Blockchain transaction mined

Hash stored on-chain

Response:

{
  "message": "Record created successfully!",
  "record": { ... },
  "blockchainHash": "abc123..."
}
🟢 Fetch Medical Records
GET /api/records/get

PATIENT → automatically fetches own records

DOCTOR → selects patient from dropdown and fetches records

⛓️ Blockchain Layer
Smart Contract: MedicalRecord.sol

Deployed locally using Hardhat.

Stores:

recordId

recordHash

timestamp

Functions
function storeRecord(uint256 _recordId, string memory _recordHash)
function getRecord(uint256 _recordId)

The blockchain stores only hashes, not medical data.

📁 Folder Structure (Current Project)
📂 Web Application (Next.js)
patient-record-blockchain/
│
├── prisma/
│   ├── schema.prisma
│   └── dev.db
│
├── src/
│   ├── abi/
│   │   └── MedicalRecord.json      # Smart contract ABI
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.js
│   │   │   │   ├── login/route.js
│   │   │   │   └── me/route.js
│   │   │   │
│   │   │   ├── users/
│   │   │   │   └── patients/route.js
│   │   │   │
│   │   │   ├── records/
│   │   │   │   ├── create/route.js
│   │   │   │   └── get/route.js
│   │   │
│   │   ├── (protected)/
│   │   │   ├── records/page.tsx
│   │   │   └── submit/page.tsx
│   │
│   ├── lib/
│   │   ├── prisma.js
│   │   └── blockchain.js
│   │
│   └── hooks/
│       └── useAuth.ts
│
├── .env.local
├── package.json
└── README.md
📂 Blockchain (Hardhat Project)
hardhat-project/
│
├── contracts/
│   └── MedicalRecord.sol
│
├── scripts/
│   └── deploy.js
│
├── artifacts/
│
├── hardhat.config.js
└── package.json
🚀 Setup Instructions
1️⃣ Start Hardhat Blockchain

Inside hardhat-project:

npx hardhat node

In another terminal:

npx hardhat run scripts/deploy.js --network localhost

Copy deployed contract address.

2️⃣ Configure Environment

In patient-record-blockchain/.env.local:

JWT_SECRET=dev-secret
HARDHAT_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
3️⃣ Start Web App
npm run dev

Visit:

http://localhost:3000
🎤 Demo Flow (Current Working Version)

Register Patient

Register Doctor

Doctor logs in

Doctor creates medical record

Observe transaction in Hardhat terminal

Patient logs in

Patient views own records

Explain:

Data stored in DB

Hash stored on blockchain

Integrity preserved

✅ Current Progress

✔ Authentication system
✔ Role-based access control
✔ Record creation
✔ Record viewing
✔ SHA-256 hashing
✔ On-chain hash storage
✔ Hardhat local blockchain integration

🔮 Next Planned Improvements

Record verification endpoint

Tamper detection endpoint

UI indicator for blockchain verification

Deployment to public testnet

Production database upgrade
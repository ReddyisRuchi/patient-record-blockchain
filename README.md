# Patient Record Management System Using Blockchain

A full-stack medical record management system built with Next.js, Prisma, and Solidity. Medical data is stored off-chain in a PostgreSQL database while cryptographic hashes are stored on the Ethereum Sepolia testnet — enabling tamper detection without exposing sensitive data on a public ledger.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [User Roles](#user-roles)
- [Features](#features)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Smart Contract](#smart-contract)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Demo Flow](#demo-flow)
- [Team](#team)

---

## Overview

This system solves a core problem in healthcare data management: how do you prove a medical record hasn't been tampered with, without storing sensitive patient data on a public blockchain?

**Solution:** Store the full record in a private database. Compute a SHA-256 hash of the record and store only that hash on-chain. Any modification to the record will produce a different hash, which can be detected by comparing against the on-chain value.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL via Prisma ORM |
| Authentication | JWT (HTTP-only cookies) |
| Blockchain | Solidity, Hardhat, Ethers.js v6 |
| Network | Ethereum Sepolia Testnet |
| Hashing | SHA-256 (Node.js crypto) |

---

## System Architecture

```
User (Browser)
      ↓
Next.js Frontend (React + Tailwind)
      ↓
Next.js API Routes (Server-side)
      ↓
Prisma ORM → PostgreSQL (Supabase)

AND

Medical Record (Serialized JSON)
      ↓
SHA-256 Hash
      ↓
MedicalRecord.sol (Solidity Smart Contract)
      ↓
Ethereum Sepolia Testnet
```

**Why hybrid storage?**
- Blockchain storage is expensive and public — unsuitable for sensitive medical data
- The database holds the full record; the blockchain holds only its fingerprint
- If the database record is altered, the hash will no longer match the on-chain value → tamper detected

---

## User Roles

| Role | Permissions |
|---|---|
| `PATIENT` | View own records, verify own records, view own profile |
| `HEALTHCARE_ADMIN` | Create records, view all patient records, manage donations registry, access audit log |
| `DONOR` | Register as a donor |

Role validation is enforced server-side on every protected API route using JWT decoding.

---

## Features

### Authentication
- Register with role selection (Patient, Healthcare Admin, Donor)
- Login with email and password
- JWT stored in HTTP-only cookie (7-day expiry)
- Session timeout warning after 15 minutes of inactivity with 60-second countdown
- Password change from profile page

### Medical Records
- Healthcare admins create records with: department, visit type, symptoms, diagnosis, prescription, severity, follow-up, notes
- Each record is SHA-256 hashed and stored on the Sepolia blockchain
- Blockchain hash displayed on record detail with direct Etherscan link
- Integrity verification compares live hash against on-chain value
- Record tracking timeline (location + action events stored on-chain)
- Print record from detail page

### Records View
- Role-aware: patients see only their own records; admins select from patient dropdown
- Search by diagnosis, department, or prescription
- Filter by severity and department
- Colour-coded severity badges (Mild / Moderate / Severe / Critical)
- Skeleton loading states and empty state illustrations
- Auto-fetch on patient selection

### Donations Registry (Healthcare Admin)
- Add blood/organ donations with type, blood group, donor info, location, expiry date
- Filter donations by blood group
- Expiry alerts: yellow warning within 3 days, red "Expired" label for past dates
- Assign donations to patients
- QR code tracking page per donation with blockchain event timeline

### Dashboard
- Role-aware stat cards:
  - Patient: total records, last visit date
  - Healthcare Admin: total records, total patients, records this month
- Recent activity feed (last 5 records)
- Quick action cards (role-filtered)

### Profiles
- Patient profile: avatar with initials, record stats, full record timeline, change password
- Healthcare Admin profile: identity card, system stats, recent activity, change password
- Clicking username in navbar navigates to profile

### UI / UX
- Dark mode toggle (persisted to localStorage, respects system preference)
- Command palette (`Cmd+K` / `Ctrl+K`) with role-filtered navigation
- Staggered fade-in animations on page load
- Scroll-reveal animations on landing page feature strip
- Toast notifications replacing all `alert()` calls
- Confirmation modals before destructive or blockchain-writing actions
- Breadcrumbs and back button on detail pages
- Active nav link indicator
- Audit log page for Healthcare Admins

---

## Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| id | Int | Primary key |
| name | String | |
| email | String | Unique |
| password | String | bcrypt hashed |
| role | String | PATIENT / HEALTHCARE_ADMIN / DONOR |
| createdAt | DateTime | |

### PatientRecord
| Field | Type | Notes |
|---|---|---|
| id | Int | Primary key |
| patientId | Int | FK → User.id |
| department | String | |
| visitType | String | |
| symptoms | String | |
| diagnosis | String | |
| prescription | String | |
| severity | String | Mild / Moderate / Severe / Critical |
| followUp | String | |
| notes | String? | Optional |
| blockchainHash | String? | SHA-256 hash stored on-chain |
| createdAt | DateTime | |

### Donation
| Field | Type | Notes |
|---|---|---|
| id | Int | Primary key |
| type | String | Blood / Organ |
| bloodGroup | String? | e.g. A+, O- |
| status | String | collected / assigned |
| collectedAt | DateTime | |
| expiryDate | DateTime? | Optional |
| currentLocation | String | |
| patientId | Int? | FK → User.id (when assigned) |
| createdAt | DateTime | |

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT cookie |
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/auth/logout` | Clear JWT cookie |
| POST | `/api/auth/change-password` | Update password (authenticated) |

### Records
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/records/create` | Create record, hash + store on blockchain |
| GET | `/api/records/get` | Get records (role-filtered) |
| GET | `/api/records/getById?id=` | Get single record by ID |
| GET | `/api/records/verify?id=` | Verify record integrity against blockchain |

### Tracking
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/track/add` | Add tracking event to blockchain |
| GET | `/api/track/history?id=` | Get tracking history from blockchain |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/patients` | List all patients |

### Donations
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/donations/create` | Create a donation entry |
| GET | `/api/donations/get` | List all donations |
| POST | `/api/donations/assign` | Assign donation to a patient |

### Stats & Activity
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stats` | Role-aware dashboard statistics |
| GET | `/api/activity` | Recent activity feed |

---

## Smart Contract

**File:** `contracts/MedicalRecord.sol`  
**Network:** Ethereum Sepolia Testnet

### Functions

```solidity
// Store a record hash on-chain
function storeRecord(uint256 _recordId, string memory _recordHash) public

// Retrieve a stored hash
function getRecord(uint256 _recordId) public view returns (string memory)

// Add a tracking event (location + action)
function addEvent(uint256 _recordId, string memory _location, string memory _action) public

// Get full tracking history for a record
function getHistory(uint256 _recordId) public view returns (Event[] memory)
```

The contract stores only hashes and tracking events — no medical data ever touches the blockchain.

---

## Project Structure

```
patient-record-blockchain/
├── contracts/
│   └── MedicalRecord.sol
├── scripts/
│   └── deploy.js
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── abi/
│   │   └── MedicalRecord.json
│   ├── app/
│   │   ├── (protected)/
│   │   │   ├── admin/profile/
│   │   │   ├── audit/
│   │   │   ├── dashboard/
│   │   │   ├── doctor_submit/
│   │   │   ├── donations/
│   │   │   ├── donor/
│   │   │   ├── patients/[id]/
│   │   │   ├── records/
│   │   │   │   └── [id]/
│   │   │   ├── settings/
│   │   │   └── verify/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── donations/
│   │   │   ├── records/
│   │   │   ├── track/
│   │   │   └── users/
│   │   ├── about/
│   │   ├── donation/[id]/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── AuthProvider.jsx
│   │   ├── CommandPalette.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── Navbar.tsx
│   │   ├── ThemeProvider.jsx
│   │   └── Toast.tsx
│   ├── context/
│   │   └── AuthContext.js
│   ├── hooks/
│   │   └── useAuth.js
│   └── lib/
│       ├── api.js
│       ├── blockchain.js
│       ├── blockchainService.js
│       └── prisma.js
├── .env
├── hardhat.config.js
├── package.json
└── tailwind.config.js
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Supabase)
- MetaMask wallet with Sepolia ETH (for blockchain transactions)
- Infura or Alchemy account for Sepolia RPC

### 1. Clone and install

```bash
git clone <repo-url>
cd patient-record-blockchain
npm install
```

### 2. Configure environment variables

Create a `.env` file in the root (see [Environment Variables](#environment-variables)).

### 3. Set up the database

```bash
npx prisma generate
npx prisma migrate deploy
```

### 4. Compile the smart contract

```bash
npx hardhat compile
```

### 5. Deploy the contract to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed contract address into your `.env` as `NEXT_PUBLIC_CONTRACT_ADDRESS`.

### 6. Start the development server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# Authentication
JWT_SECRET="your-secret-key"

# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
```

> Never commit `.env` to version control. The `.gitignore` should exclude it.

---

## Demo Flow

1. Register a **Healthcare Admin** account
2. Register a **Patient** account
3. Log in as Healthcare Admin
4. Navigate to **Create Record**, select the patient, fill in medical details, submit
5. Observe the blockchain transaction — the record hash is stored on Sepolia
6. Open the record detail page — view the SHA-256 hash and click **View on Etherscan**
7. Click **Verify** — the system fetches the on-chain hash and compares it to the current record
8. Log in as the Patient — view their own records, verify integrity, check their profile
9. As Healthcare Admin, open **Donations Registry** — add a blood donation with expiry date, assign to a patient, track via QR code
10. Open the **Audit Log** to see recent system activity

---

## Team

| Name | Role |
|---|---|
| P. Phani Prasad | Guide |
| Anugu Ruchi Reddy | Member |
| Aditi Joshi | Member |
| Kondru Raja Nakshathra | Member |

**BE 4th Year · Sem 8 · CSE A**

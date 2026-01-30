# Setu - Project Context

## Project Overview
**Setu** is a web-based platform facilitating transparent financial agreements and group lending. It allows users to create 1-on-1 lending agreements, form groups, and manage money requests where multiple members can contribute to a single loan request.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Firebase Auth (Google Sign-In)
- **Styling:** Tailwind CSS 4, Radix UI, Lucide React (Shadcn UI components)
- **Location Services:** Radar SDK
- **Email:** Nodemailer
- **Package Manager:** pnpm (inferred from lockfile)
- **Validation:** Zod (Schema Validation)

## Key Features
- **1-on-1 Agreements:** Create and track individual lending agreements.
- **Group Lending:**
    - Create groups and manage members (Admin controls).
    - **Money Requests:** Users can request a total amount from a group.
    - **Partial Contributions:** Group members can contribute partial amounts.
    - **Automatic Agreement Creation:** Each contribution generates a separate 1-on-1 agreement.
- **Context-Aware AI Mediation:**
    - **Live Location Check:** Uses Radar SDK to detect borrower's context.
    - **Empathetic Logic:** Silences/delays reminders if the borrower is at a sensitive location (e.g., Hospital).
- **Trust Score System:**
    - **Reputation Engine:** Users start with a score of 100.
    - **Accountability:** Timely payments maintain the score; delays lower it.
- **Witness & Settlement:** Approval workflows for witnesses and payment settlements.

## Problem & Solution (Presentation Context)

### Problem: The "Awkward Gap"
- **Emotional Conflict:** Asking friends for money back is awkward and strains relationships.
- **Financial Risk:** Informal lending is undocumented, leading to forgotten loans ($2T+ market).
- **Missing Tool:** Venmo is for payments, not loans. Legal contracts are too complex.

### Solution: Setu - The Intelligent Bridge
- **Clarity:** "Friendly but Formal" digital agreements replace vague promises.
- **Accountability:** Dynamic Trust Scores serve as social collateral.
- **Empathy:** Context-Aware AI checks location before sending reminders (e.g., silent mode at hospitals).
- **Community:** Group lending allows micro-contributions from multiple friends.

## Process Flow
1.  **Initiation:** User creates Agreement (1-on-1) or Money Request (Group).
2.  **Validation:** Borrower accepts; Witness verifies (optional).
3.  **Smart Monitoring:** System tracks due date.
    - *Check:* Is due date near?
    - *Logic:* Check Location (Radar SDK). If Sensitive (Hospital) -> Silence. If Normal -> Remind (Email/AI Call).
4.  **Settlement:** Borrower pays -> Lender confirms -> Trust Score Updated.

## Architecture
- **Directory Structure:**
    - `app/`: Next.js App Router pages and layouts.
    - `app/api/`: Backend API routes (Server Actions/API endpoints).
    - `app/dashboard/`: Main authenticated user interface.
    - `components/`: Reusable UI components (Shadcn UI).
    - `lib/`: Utilities (MongoDB connection, Email, general utils).
    - `models/`: Mongoose schemas (`User`, `Group`, `Agreement`, `MoneyRequest`, `LiveLocation`).
    - `hooks/`: Custom React hooks (e.g., `use-toast`, `use-mobile`).

## Key Commands
- **Development Server:** `pnpm dev` (or `npm run dev`)
- **Build:** `pnpm build`
- **Start Production:** `pnpm start`
- **Lint:** `pnpm lint`

## Configuration
- **Environment Variables:** Managed in `.env` (requires `MONGODB_URI`, Firebase credentials, etc.).
- **Database:** `lib/mongodb.ts` implements a cached connection pattern.
- **Auth:** `firebase.ts` initializes the Firebase app and auth service.
# Credit Score

![Credit Score Logo](frontend/public/globe.svg)

> **A premium, fast, and secure application empowering informal workers to build their financial credibility through mobile money transaction history.**

---

## Overview

The **Credit Score** system is designed to solve a critical issue in developing markets: informal workers and small business owners lack traditional credit histories, making it impossible to access formal financing. By securely ingesting and analyzing their Mobile Money (MoMo) transaction data, this platform dynamically generates a **verified, FICO-style 1000-point Credit Score**. 

## Key Features

- **Interactive 3D Landing Page:** A premium, glassmorphism-inspired landing page featuring a live 3D network sync globe.
- **Dynamic FICO-Style Dashboard:** A comprehensive, dark-mode-first dashboard with an animated 1000-point credit score gauge, loan readiness indicators, and financial trend charts.
- **MoMo Transaction Ingestion:** Users can manually add or bulk-upload CSV exports of their Mobile Money statements.
- **Automated Credit Engine:** A Supabase Edge Function that analyzes income consistency, savings behavior, and transaction velocity to calculate real-time scores.
- **AI Growth Recommendations:** Automated, personalized tips helping users improve their financial health.
- **Native Support Ticketing:** Integrated with the **Resend API** to instantly route user support requests directly to the system administration team.

---

## Architecture & Tech Stack

This project is built on a cutting-edge, scalable tech stack:

- **Frontend Framework:** Next.js 16 (App Router) powered by Turbopack.
- **Styling & UI:** Tailwind CSS v4, Base UI, Shadcn UI patterns, and Framer Motion for micro-animations.
- **Backend & Database:** Supabase (PostgreSQL).
- **Authentication:** Supabase Auth with Row Level Security (RLS) ensuring strict data privacy.
- **Serverless Compute:** Supabase Edge Functions for isolated, secure scoring algorithms.
- **Email Infrastructure:** Resend API for seamless transactional emails.

---

## Credit Scoring Algorithm

The system calculates a user's score (from 0 to 1000) by analyzing their recent transaction history (last 90 days). The algorithm evaluates three core financial behaviors:

1. **Income Consistency (40% weight):**
   - Evaluates the total volume of incoming transfers and income.
   - Points are awarded incrementally as total income crosses specific thresholds (e.g., > 100, 500, 2000).
2. **Savings Behavior (30% weight):**
   - Measures the ratio of total savings deposits against total expenses.
   - High savings relative to expenses yields maximum points in this category.
3. **Transaction Activity (30% weight):**
   - Calculates the frequency of interactions (total number of transactions).
   - Consistent, frequent use of the account (e.g., > 10, > 25 transactions) demonstrates financial reliability.

These weighted factors are combined to produce the final 1000-point score, which is then mapped to loan readiness tiers (Needs Work, Fair, Good, Excellent).

---

## Quick Start Guide

### 1. Backend Setup (Supabase)

If you are running the project locally, you can use the Supabase CLI to host the entire backend on your machine.

```bash
# Install Supabase CLI
npm i -g supabase

# Initialize and start local backend
cd backend
supabase init
supabase start
```
*Note: Ensure Docker is running. The `supabase start` command will output your local API URL and anon key.*

**Apply Migrations & Edge Functions:**
```bash
# Apply database schema and RLS policies
supabase db reset

# Serve the credit scoring edge function locally
supabase functions serve calculate-score --no-verify-jwt
```

### 2. Frontend Setup

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

Edit your `.env.local` to include your Supabase keys (from step 1) and your Resend API key:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
RESEND_API_KEY=re_your_resend_api_key
```

**Start the development server:**
```bash
npm run dev
```
Your application will now be running on [http://localhost:3000](http://localhost:3000).

---

## Transaction CSV Upload Format

To test the bulk-upload feature on the dashboard, ensure your CSV matches the exact format below:

```csv
transaction_date,amount_ghs,type,source,description
2026-01-05,500.00,income,mobile_money,Weekly market sales
2026-01-06,50.00,savings,mobile_money,Weekly savings
2026-01-07,30.00,bill_payment,mobile_money,Electricity bill
2026-01-08,20.00,expense,cash,Transport
```

**Valid Enums:**
- `type`: `income`, `expense`, `savings`, `bill_payment`
- `source`: `mobile_money`, `cash`, `bank_transfer`

---

## Security & Privacy

- All user data is secured using Postgres Row Level Security (RLS). Users can only read and write their own transaction data.
- Edge functions are isolated and executed securely to prevent score manipulation.
- Authentication sessions are managed securely via Supabase JWTs.

# Credit Score

![Credit Score Logo](frontend/public/globe.svg)

**Credit Score** is a platform designed to help informal workers and small business owners build their financial credibility. By analyzing Mobile Money (MoMo) transactions, the platform generates a verified credit score, giving users the ability to access formal financing and loans without a traditional credit history.

## How It Works

1. **Upload Transactions:** Users can add or upload their Mobile Money statements.
2. **Get Scored:** The system automatically analyzes income consistency, savings, and activity to generate a 1000-point credit score.
3. **Track Progress:** Users receive actionable tips and a dynamic dashboard to understand their financial health and loan readiness.

---

## How to Run the Project

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed
- [Docker](https://www.docker.com/) (needed for the local backend)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed (`npm i -g supabase`)

### 2. Start the Backend
Open a terminal and start the local database and backend services:
```bash
cd backend
supabase start
supabase db reset
supabase functions serve calculate-score --no-verify-jwt
```
*(Keep this terminal running)*

### 3. Setup the Frontend Environment
Open a **new** terminal window and prepare your environment variables:
```bash
cd frontend
cp .env.example .env
```
Open the newly created `.env` file and fill in the required keys (you will get these when you ran `supabase start`).

### 4. Start the Application
Install dependencies and run the frontend:
```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to see the application!

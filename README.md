# Credit Score

![Credit Score Logo](frontend/public/globe.svg)

**Credit Score** is a platform designed to help informal workers and small business owners build their financial credibility. By analyzing Mobile Money (MoMo) transactions, the platform generates a verified credit score, giving users the ability to access formal financing and loans without a traditional credit history.

---

## Live Demo & Testing

You can access and test the live application immediately without any local installation:
**Live Application:** [https://credit-score-4a1w-wheat.vercel.app/](https://credit-score-4a1w-wheat.vercel.app/)

### Instructions for Facilitators & Evaluators
To test the platform on your end (either via the live link above or a local clone):
1. **Request/Download a Statement:** Obtain a Mobile Money statement file. Notice there is **no manual keying in of transaction data required**—the application parses the document directly.
2. **Supported Format:** The platform currently supports **Ghana Mobile Money (GH MoMo)** statements.
3. **Upload & Test:** Upload the statement file into the application to witness the automated analysis, financial breakdown, and 1000-point credit score generation in real time.

---

## How It Works

1. **Upload Statement:** Instead of manual data entry, users directly upload their Mobile Money statement files (currently supporting **Ghana MoMo** statements).
2. **Get Scored:** The system automatically analyzes income consistency, savings, and transaction activity to generate a 1000-point credit score.
3. **Track Progress:** Users receive actionable tips and a dynamic dashboard to understand their financial health and loan readiness.

---

## How to Run the Project Locally

If you are cloning the repository and wish to run the backend and frontend locally on your machine, follow these steps:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed
- [Docker](https://www.docker.com/) (needed for the local Supabase backend database and edge functions)
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
Open the newly created `.env` file and fill in the required keys (you will get these when you run `supabase start`).

### 4. Start the Application
Install dependencies and run the frontend:
```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to test the application locally!

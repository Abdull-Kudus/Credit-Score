# Credit Score

**Credit Score** is a platform designed to help informal workers and small business owners build their financial credibility. By analyzing Mobile Money (MoMo) transactions, the platform generates a verified credit score, giving users the ability to access formal financing and loans without a traditional credit history.

---

## Live Demo & Access

You can access and test the live application from here:
**Live Application:** [https://credit-score-4a1w-wheat.vercel.app/](https://credit-score-4a1w-wheat.vercel.app/)

---

## Step-by-Step Testing Flow (Live & Local)

Whether you are testing via the **Live Demo** link above or running the application **Locally**, follow this exact step-by-step workflow to experience the platform:

1. **Access the Platform:**
   - Open the live link [https://credit-score-4a1w-wheat.vercel.app/](https://credit-score-4a1w-wheat.vercel.app/) (or visit `http://localhost:3000` if running locally).
2. **Get Started & Authenticate:**
   - Click on the **"Get Started"** button on the homepage.
   - Sign up or log in by selecting **"Continue with Google"** (or using your email credentials).
3. **Navigate to Transactions:**
   - From the navigation menu, click on **Transactions**.
4. **Upload MoMo Statement:**
   - Click on the upload button and select your **Ghana Mobile Money (GH MoMo)** statement file.
   - *Note:* There is **no manual keying in of transaction data required**—the application automatically parses and extracts all relevant financial data directly from the document.
5. **View Overview & Credit Score:**
   - Navigate to the **Overview** dashboard.
   - See your detailed transaction breakdown, income consistency analysis, savings habits, and your dynamically generated **1000-point credit score** in real time!

---

## How It Works

1. **Upload Statement:** Instead of tedious manual data entry, users directly upload their Mobile Money statement files (supporting **Ghana MoMo** statements).
2. **Automated Analysis & Scoring:** The system automatically analyzes income consistency, transaction activity, and savings patterns to generate a reliable 1000-point credit score.
3. **Actionable Financial Insights:** Users receive personalized, actionable tips and a dynamic overview dashboard to understand their financial health and unlock loan readiness.

---

## How to Run the Project Locally

The application is powered by a **Next.js frontend** connected to a **Supabase cloud backend**.

> [!NOTE]
> **No Docker installation is required** to run this application locally! Because the project uses a hosted Supabase instance for its database and authentication, the entire application runs directly from the frontend directory.

Follow every single step below to get the project running on your local machine:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (bundled with Node.js)
- [Git](https://git-scm.com/) installed

### 2. Clone the Repository
Open your terminal and clone the project repository to your local machine:
```bash
git clone https://github.com/Abdull-Kudus/Credit-Score.git
cd Credit-Score
```

### 3. Setup the Frontend Environment
The application is run from the `frontend` directory where the UI and Supabase client integration reside:
```bash
cd frontend
```

Create your local environment file by copying the example file:
```bash
cp .env.example .env
```

Open the `.env` file in your code editor and configure your Supabase environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-url.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```
*(Note: If you have existing project keys in your `.env` file, ensure they match your active Supabase instance).*

### 4. Install Dependencies & Start the Development Server
With your terminal still inside the `frontend` directory, install all required packages and start the development server:
```bash
npm install
npm run dev
```

### 5. Open in Your Browser
Once the server starts, open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

You are now ready to follow the **Step-by-Step Testing Flow** outlined above!

---

## Backend Environment & Management (Optional)

While the application runs directly from the `frontend` folder using Supabase's cloud backend, a `backend/` directory is also provided for repository administration, database migrations, and edge functions management using the Supabase CLI.

If you need to administer database schemas or deploy backend edge functions:
1. Navigate to the backend directory:
   ```bash
   cd ../backend
   ```
2. Create an environment file from the example:
   ```bash
   cp .env.example .env
   ```
3. Add your personal Supabase access token for CLI operations:
   ```env
   SUPABASE_ACCESS_TOKEN="your_supabase_personal_access_token"
   ```
4. Use the [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm i -g supabase`) to push migrations or serve functions if you are developing or testing new backend features.

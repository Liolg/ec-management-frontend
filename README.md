# EC Management Frontend

EC Management is a React and Django app for single-company bookkeeping, product costing, inventory, and reporting.

## Run locally

Use Node.js 20.19+ on the Node 20 series or Node.js 22.12+. Set up the Django backend, apply its migrations, and create a user using the backend README.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:5173 and sign in with the Django user. `VITE_API_URL` defaults to `http://localhost:8000`. Set it in `.env.local` if Django runs on a different origin, then configure Django to allow the frontend origin.

## First-run workflow

1. Open **Setup** and enter the company name and currency. Django creates the standard chart of accounts. In Setup, you can later map different accounts to business operations.
2. Use **Accounts** and **Journal Entries** for the chart of accounts and manual entries. Transactions create their own journal entries. Open the linked transaction to void its posting.
3. Under **Products**, create material and labor rates, build a cost sheet, and assign it to a product. Product details show current stock and stock movements. Manual adjustments record stock movements.
4. Under **Transactions**, record and void sales, purchases, expenses, and payments. Payments can link to the corresponding sale or purchase.
5. Use the **Dashboard**, **Profit & Loss**, and **Inventory** to review activity. Date filters apply to income and expenses. Cash, receivables, payables, and inventory show current balances.

Sales move stock without automatically posting cost of goods sold. Profit & Loss reflects posted journal entries. Inventory shows estimated value using current quantity and average incoming unit cost.

## API and checks

The app signs in through `/api/auth/token/` and uses JWT for `/api/accounting/`, `/api/products/`, and `/api/business/`. It refreshes access through `/api/auth/token/refresh/` when a request needs a new token.

```bash
npm run lint
npm run build
npm run preview
```

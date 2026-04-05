# Finance Dashboard Frontend

React + Vite + TypeScript implementation for the frontend assessment.

## Features

- Dashboard summary cards (balance, income, expenses)
- Time-based chart (monthly trend)
- Category chart (spending breakdown)
- Transactions table with search/filter/sort
- Simulated role-based UI behavior from authenticated user role
- Insights section for analyst/admin
- Responsive layout and empty-state handling

## Stack

- React 19
- TypeScript
- Zustand (state)
- Axios (API)
- Recharts (visualization)
- Vitest + Testing Library (minimal tests)

## Setup

1. Copy environment values:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Run dev server:

```bash
npm run dev
```

## Environment

- `VITE_API_URL` default: `http://localhost:4000`

## Demo Users

Use one of these seeded accounts after backend seed:

- `viewer@zorya.app / Password@123`
- `analyst@zorya.app / Password@123`
- `admin@zorya.app / Password@123`

## Scripts

- `npm run dev` start local frontend
- `npm run build` production build
- `npm run test` run minimal tests

## Notes

- Role restrictions are enforced by backend and reflected in UI.
- Admin can add/edit records; viewer and analyst are read-only for transactions.

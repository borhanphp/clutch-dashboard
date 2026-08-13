# Organization Operations Dashboard

A read-only Next.js dashboard for viewing **all organizations** and a **summary of every operation** (loads, contracts/orders, companies, drivers, customers, assets) per organization.

- **No data can be added or edited** — the UI only consumes two read-only `GET` endpoints.
- Separate standalone project (lives outside the main `frontend/` app).

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Axios
- Backend: existing Laravel API (`backend/`)

## Backend endpoints used

Added in `backend/routes/includes/admin.php` (Sanctum-authenticated, GET only):

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/admin/organizations` | All organizations with per-org operations summary |
| GET | `/api/admin/organizations/{id}` | One organization: totals, load status breakdown, 12-month trend, per-company breakdown, contracts, 50 most recent loads |

## Setup

1. Start the Laravel backend:

   ```bash
   cd backend
   php artisan serve        # http://localhost:8000
   ```

2. Configure the dashboard environment (already created for local dev):

   ```bash
   cp .env.example .env.local
   ```

   ```
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
   ```

3. Install and run:

   ```bash
   npm install
   npm run dev              # http://localhost:3100
   ```

4. Sign in with the same username/password used for the main Clutch app
   (`POST /api/login`). The token is stored in `localStorage` and sent as a
   `Bearer` token on every request.

## Pages

| Route | Description |
| ----- | ----------- |
| `/login` | Sign in (only screen that writes anything — the auth token) |
| `/` | All organizations: grand totals, search, one card per organization with loads / tonnage / revenue / contracts summary |
| `/organizations/:id` | Organization detail: stat cards (loads, tonnage, revenue, kms, contracts, companies, drivers, customers, assets), loads-by-status breakdown, 12-month load trend, companies table, contracts/orders table, 50 most recent loads |

## Production build

```bash
npm run build
npm start                  # http://localhost:3100
```

## Notes

- Port `3100` is used so it can run alongside the main frontend (`3000`).
- CORS on the backend already allows any origin (`FRONT_ROUTE='*'`).
- The new admin endpoints are read-only by design; any authenticated user can
  call them. If access should be limited to specific roles, add a role check
  middleware to the `admin` route group in `backend/routes/includes/admin.php`.

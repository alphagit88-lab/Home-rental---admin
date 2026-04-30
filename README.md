# Home Rental Admin

Admin web application for the `Home-Rental-Backend` project.

## What it includes

- Admin sign-in using the backend `POST /api/auth/login` flow
- Server-side proxy routes so the browser does not call `localhost:5001` directly
- Home-rental dashboard overview
- Rental account listing for owners, tenants, and service providers
- Property monitoring with activate/deactivate controls
- Booking and service-request visibility
- Service category management
- Legacy operations user management for admins, customers, suppliers, and drivers

## Local setup

1. In this folder, install dependencies with `npm install`
2. Create `.env.local` with your Cloudflare backend URL:

```env
BACKEND_URL=https://your-cloudflare-backend.trycloudflare.com
```

3. Run the admin app with:

```bash
npm run dev
```

4. Open `http://localhost:3001`

Use `localhost` for local testing.

## Production / VM startup

`npm run start` uses the Next.js production server, which requires a built `.next` directory.
That folder is not committed to git, so on a fresh VM checkout you should either:

```bash
npm install
npm run build
npm run start -- -H 0.0.0.0
```

or simply run:

```bash
npm run start -- -H 0.0.0.0
```

The `prestart` script will build the app automatically before the production server starts.

# SN!P - URL Shortener v2

Full-stack Bitly-style URL shortener with JWT authentication, per-user dashboards, QR codes, and analytics.

## Stack
- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, React Router v6
- **Backend**: Node.js, Express, TypeScript, MongoDB/Mongoose
- **Auth**: JWT stored in httpOnly cookies

## Quick Start
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
./scripts/dev.sh
```
Open http://localhost:5173

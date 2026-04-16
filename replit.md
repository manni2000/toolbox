# DailyTools247

A comprehensive web application offering 130+ free online utility tools covering image processing, PDF manipulation, video/audio conversion, SEO optimization, developer utilities, and financial calculators.

## Architecture

### Monorepo Structure
- `frontend/` — React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- `backend/` — Node.js + Express.js API server

### Frontend (Port 5000)
- **Framework**: React 18 with React Router v6
- **Build**: Vite 7
- **Styling**: Tailwind CSS + Radix UI primitives (shadcn/ui)
- **State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion

### Backend (Port 8000)
- **Runtime**: Node.js (CommonJS)
- **Framework**: Express.js
- **File Processing**: Sharp (images), pdf-lib, pdf-parse, JSZip, archiver
- **Security**: Helmet, CORS, express-rate-limit, xss
- **Cache**: Upstash Redis (optional — requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars)

## Development

### Start Frontend
```bash
cd frontend && npm run dev
```
Runs on http://localhost:5000. Proxies `/api/*` to backend on port 8000.

### Start Backend
```bash
cd backend && node server.js
```
Runs on http://localhost:8000.

## Workflows
- **Start application** — Frontend dev server on port 5000 (`cd frontend && npm run dev`)
- **Backend** — Express API server on port 8000 (`cd backend && node server.js`)

## Deployment
- **Target**: Autoscale
- **Build**: Builds frontend, copies dist to `backend/public/`
- **Run**: Starts backend which serves static frontend files in production
- The backend serves the frontend SPA via `backend/public/` when `NODE_ENV=production`

## Environment Variables
- `PORT` — Backend port (default: 8000)
- `NODE_ENV` — Set to `production` for production deployments
- `UPSTASH_REDIS_REST_URL` — Optional: Redis cache URL
- `UPSTASH_REDIS_REST_TOKEN` — Optional: Redis cache token

## Tool Categories
Image, PDF, Audio, Video, Security, Dev, SEO, Social Media, Text, ZIP, Finance, Education, Date/Time, Internet tools

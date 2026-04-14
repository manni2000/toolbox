# Dailytools247 - Replit Setup

## Project Overview
A comprehensive web application providing 130+ free online tools organized into 14 categories: Image, PDF, SEO, Video, Audio, Text, Security, Date & Time, Developer, Internet, Education, Finance, ZIP, and Social Media.

## Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (with `@vitejs/plugin-react-swc`)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI components)
- **State/Data**: TanStack Query (React Query)
- **Routing**: React Router DOM v6 (lazy-loaded routes)
- **Port**: 5000 (development)
- **Directory**: `frontend/`

### Backend
- **Framework**: Node.js + Express
- **Port**: 8000
- **Directory**: `backend/`
- **Entry**: `backend/server.js`

## Workflows
- **Start application** - Runs the Vite dev server (`cd frontend && npm run dev`) on port 5000
- **Backend API** - Runs the Express server (`cd backend && npm start`) on port 8000

## API Proxy
The Vite dev server proxies all `/api/*` requests to `http://localhost:8000`, so the frontend and backend run together seamlessly.

## Key Directories
- `frontend/src/pages/tools/` - All 130+ tool implementations (14 subfolders)
- `frontend/src/components/` - Shared UI components
- `frontend/src/data/` - Tool definitions and metadata
- `backend/routes/` - Express route handlers grouped by category
- `backend/middleware/` - Security middleware (helmet, CORS, rate limiting)

## Deployment
- **Target**: Autoscale
- **Build**: `cd frontend && npm run build`
- **Run**: `cd backend && node server.js`

## Notable Packages
- Frontend: `sharp` (not needed client-side), `pdf-lib`, `jszip`, `qrcode`, `framer-motion`, `recharts`
- Backend: `sharp`, `pdf-lib`, `multer`, `fluent-ffmpeg`, `archiver`, `node-fetch`

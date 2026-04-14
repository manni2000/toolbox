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
The Vite dev server proxies all `/api/*` requests (regex `^/api/`) to `http://localhost:8000`. The proxy uses a regex pattern to avoid intercepting frontend routes like `/api-docs`.

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
- Backend: `sharp`, `pdf-lib`, `multer`, `fluent-ffmpeg`, `archiver`, `node-fetch`, `pdf-parse`, `qrcode`, `jsqr`, `docx`, `xlsx`

## Backend Routes
- `backend/routes/pdf.js` — PDF compress, info, merge, split, rotate, password, html-to-pdf, to-word, to-excel, to-powerpoint
- `backend/routes/image.js` — Image resize/crop/convert/compress/watermark/flip/rotate, QR generator, QR scanner, background remover, color picker
- `backend/routes/apiv1.js` — Developer API v1: GET /docs, POST /keys/generate, /keys/list, /text, /security, /dev, /finance (X-API-Key auth + rate limiting)
- Other routes: text, security, dev, internet, seo, finance, social, audio, video, zip, education, datetime, blog

## Known Limitations
- PDF-to-image conversion not available (requires Ghostscript, not installed)
- PowerPoint-to-PDF not available (requires LibreOffice, not installed)
- Email breach check in security route returns format-only validation (HaveIBeenPwned requires paid API key)
- API key storage is in-memory (reset on server restart); suitable for dev/demo only

## Bug Fixes Applied
- Fixed Vite proxy: changed `/api` to `^/api/` regex so `/api-docs` frontend route is not proxied
- Fixed BlogPostPage: prioritizes local data (which has `sections`/`faqs`) over simplified API response to prevent crash
- Fixed BlogPostPage: added null safety `(post.sections || [])` and `(post.faqs || [])` guards

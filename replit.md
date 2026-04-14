# dailytools247

A comprehensive web platform offering 130+ free online utility tools across 14 categories (Image, PDF, Video, Audio, SEO, Security, etc.).

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS + shadcn/ui + Radix UI
- **Animation**: Framer Motion
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM v6
- **Package Manager**: npm

## Project Structure

```
frontend/          # Main React frontend application
  src/
    components/    # UI components (shadcn/ui, layout, home)
    pages/         # Route-level components, organized by tool category
    lib/           # Shared utilities, API client
    data/          # Static tool category definitions, SEO metadata
    hooks/         # Custom React hooks
  public/          # Static assets, markdown docs, blog images
```

## Development

The app runs on port 5000 with host 0.0.0.0 to work with Replit's proxy.

```bash
cd frontend && npm run dev
```

## Notes

- Many tools run entirely client-side (browser-based processing)
- Some tools reference a backend API at `/api/v1` (not included in this repo)
- The Vite config has `allowedHosts: true` to support Replit's iframe proxy

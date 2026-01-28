# Dailytools247 - 100+ Free Online Tools Platform

A comprehensive web application providing **100+ free online tools** for image processing, PDF editing, video conversion, text utilities, finance calculators, and more. Built with Django backend and React frontend with TypeScript.

## 🎯 Overview

Dailytools247 is a modern, feature-rich platform that offers a wide variety of utility tools organized into 13 categories. Whether you need to compress images, merge PDFs, convert videos, generate passwords, or calculate EMIs - we've got you covered with professional-grade tools that work entirely in your browser.

### ✨ Key Features
- **100+ Tools** across 13 categories
- **Modern UI** with React, TypeScript, and Tailwind CSS
- **SEO-Friendly URLs** for better discoverability
- **Responsive Design** works on all devices
- **Fast Performance** with Vite build system
- **Type Safety** with full TypeScript support
- **Component Library** built with Radix UI and shadcn/ui

## 📊 Tool Statistics

- **Total Tools**: 100+
- **Categories**: 13
- **Image Tools**: 14
- **PDF Tools**: 13
- **Video Tools**: 6
- **Audio Tools**: 5
- **Text Tools**: 10
- **Security Tools**: 5
- **Date & Time Tools**: 4
- **Developer Tools**: 12
- **Internet Tools**: 5
- **Education Tools**: 6
- **Finance Tools**: 4
- **ZIP Tools**: 4
- **Social Media Tools**: 6

## 🚀 Features

### Image Tools (14 Tools)
- **QR Code Generator** - Generate QR codes from URLs or text
- **QR Code Scanner** - Scan and decode QR codes from images
- **Image Format Converter** - Convert between JPG, PNG, WEBP formats
- **Image Compressor** - Compress images while maintaining quality
- **Image Resize Tool** - Resize images to any dimension
- **Image Crop Tool** - Crop images with custom dimensions
- **Background Remover** - Remove background from images
- **Image to PDF** - Convert multiple images to PDF document
- **Image to Word** - Convert images to Word with OCR
- **Image ↔ Base64** - Convert images to/from Base64
- **Image DPI Checker** - Check image DPI and print sizes
- **EXIF Metadata Viewer** - View photo metadata and camera info
- **Favicon Generator** - Create favicons from images
- **WhatsApp Status Generator** - Create perfect WhatsApp status images

### PDF Tools (13 Tools)
- **PDF Merge** - Combine multiple PDFs into one
- **PDF Split** - Extract pages from PDF
- **PDF to JPG** - Convert PDF pages to images
- **PDF to Word** - Convert PDF to editable Word document
- **PDF to PowerPoint** - Convert PDF to PowerPoint slides
- **PDF to Excel** - Extract tables from PDF to Excel
- **Word to PDF** - Convert Word documents to PDF
- **PowerPoint to PDF** - Convert presentations to PDF
- **HTML to PDF** - Convert web pages to PDF
- **PDF Password Protector** - Add password to PDF files
- **PDF Unlocker** - Remove password from PDFs
- **PDF Page Remover** - Remove specific pages from PDF
- **PDF Rotate Pages** - Rotate PDF pages

### Video Tools (6 Tools)
- **Video Downloader** - Download from YouTube, Instagram, Facebook
- **Video to Audio** - Extract audio from video files
- **Video Trim** - Cut and trim video clips
- **Video Speed Controller** - Change video playback speed
- **Video Thumbnail Generator** - Extract thumbnails from videos
- **Video Resolution Converter** - Change video resolution

### Audio Tools (5 Tools)
- **Audio Format Converter** - Convert between MP3, WAV, AAC formats
- **Speech to Text** - Convert audio to text with language support
- **Audio Trimmer** - Cut and trim audio files
- **Audio Merger** - Merge multiple audio files into one
- **Audio Speed Changer** - Change speed from 0.5x to 2x with pitch control

### Text Tools (10 Tools)
- **Word & Character Counter** - Count words, characters, sentences
- **Case Converter** - Convert text case (upper, lower, title)
- **Color Converter** - Convert between HEX, RGB, HSL
- **Remove Extra Spaces** - Clean up extra whitespace from text
- **Line Sorter** - Sort lines alphabetically or numerically
- **Duplicate Line Remover** - Remove duplicate lines from text
- **Markdown → HTML** - Convert Markdown to HTML
- **Text Summarizer** - Extract key sentences from text
- **Text Diff Checker** - Compare two texts and find differences
- **Meme Generator** - Create memes with custom text

### Security Tools (5 Tools)
- **Password Generator** - Generate secure random passwords
- **Password Strength Checker** - Check how strong your password is
- **Hash Generator** - Generate MD5, SHA1, SHA256 hashes
- **Base64 Encode/Decode** - Encode or decode Base64 strings
- **UUID Generator** - Generate unique UUIDs

### Date & Time Tools (4 Tools)
- **Date Difference Calculator** - Calculate days between two dates
- **Age Calculator** - Calculate exact age from birthdate
- **Working Days Calculator** - Calculate business days between dates
- **Countdown Timer** - Create countdown to any date

### Developer Tools (12 Tools)
- **JSON Formatter** - Format and validate JSON
- **Regex Tester** - Test regular expressions
- **JWT Decoder** - Decode and inspect JWT tokens
- **URL Encoder/Decoder** - Encode or decode URLs
- **URL Shortener** - Generate short URL codes
- **Lorem Ipsum Generator** - Generate placeholder text
- **Sitemap Generator** - Create XML sitemaps
- **Robots.txt Checker** - Validate robots.txt files
- **Cron Expression Generator** - Build cron schedule expressions
- **HTTP Header Checker** - Check HTTP response headers
- **Website Screenshot** - Capture website screenshots
- **Token Calculator** - Estimate token count for LLM APIs

### Internet Tools (5 Tools)
- **IP Address Lookup** - Get info about any IP address
- **User-Agent Parser** - Parse browser user-agent strings
- **DNS Lookup** - Query DNS records for domains
- **SSL Certificate Checker** - Check SSL validity and expiry
- **Website Ping Test** - Test website availability

### Education Tools (6 Tools)
- **Scientific Calculator** - Advanced calculator with trig and log functions
- **Percentage Calculator** - Calculate percentages easily
- **Unit Converter** - Convert length, weight, temperature
- **Age Calculator** - Calculate exact age from birthdate
- **Compound Interest Calculator** - Calculate compound interest with frequency options
- **Simple Interest Calculator** - Calculate simple interest on principal

### Finance Tools (4 Tools)
- **EMI Calculator** - Calculate loan EMI payments
- **GST Calculator** - Calculate GST amounts
- **Salary Calculator** - Convert hourly, monthly, yearly salary
- **Currency Converter** - Convert between currencies

### ZIP Tools (4 Tools)
- **Create ZIP** - Create ZIP from multiple files
- **Extract ZIP** - Extract files from ZIP archive
- **Password-Protected ZIP** - Create encrypted ZIP archives
- **Compression Level ZIP** - ZIP with custom compression

### Social Media Tools (6 Tools)
- **Hashtag Generator** - Generate relevant hashtags
- **Bio Generator** - Create character-limited bios
- **Caption Formatter** - Style captions with Unicode fonts
- **Line Break Generator** - Create invisible line breaks
- **Link-in-Bio Generator** - Create link-in-bio pages
- **WhatsApp Status Generator** - Create perfect WhatsApp status images

## 🎨 Frontend Architecture

The frontend is built with modern React patterns and best practices:

### Component Structure
- **Pages**: Route-level components for each tool
- **Layout Components**: Reusable UI components (Header, Footer, Navigation)
- **UI Components**: shadcn/ui components for consistent design
- **Tool Components**: Specific logic for each utility tool

### Key Features
- **SEO-Friendly Routing**: Clean URLs for each tool (`/qr-code-generator`, `/pdf-merge`)
- **State Management**: Local state with React hooks
- **Data Fetching**: TanStack Query for API calls
- **Form Handling**: React Hook Form with Zod validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Built-in theme switching capability
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Comprehensive error boundaries and user feedback

### Development Experience
- **Hot Module Replacement**: Fast development with Vite
- **TypeScript**: Full type safety and better IDE support
- **ESLint**: Code quality and consistency
- **Vitest**: Unit testing framework
- **Component Library**: Consistent design system

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2.7
- **API**: Django Rest Framework 3.14.0
- **Database**: SQLite (MVP)
- **Image Processing**: Pillow, rembg, qrcode
- **PDF Processing**: PyPDF2, reportlab
- **Video Processing**: moviepy, yt-dlp
- **Audio Processing**: pydub
- **Web Automation**: playwright

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: TanStack React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner
- **Animations**: Framer Motion
- **Charts**: Recharts

## 📋 Prerequisites

- **Python 3.8+** for backend
- **Node.js 18+** for frontend
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/dailytools247.git
cd dailytools247
```

2. **Create virtual environment**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Run migrations**
```bash
python manage.py migrate
```

5. **Start the development server**
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set environment variables**
```bash
# Create .env.local file
echo "VITE_API_URL=http://localhost:8000" > .env.local
```

4. **Start the development server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🌐 Deployment

### Backend Deployment (Render/Railway)

1. **Prepare for production**
```bash
# Install production dependencies
pip install gunicorn

# Collect static files
python manage.py collectstatic --noinput
```

2. **Environment Variables**
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

3. **Deploy on Render**
- Connect your GitHub repository
- Set build command: `pip install -r requirements.txt`
- Set start command: `gunicorn toolbox.wsgi:application`
- Add environment variables

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
```bash
npm run build
```

2. **Deploy on Vercel**
- Connect your GitHub repository
- Set build command: `npm run build`
- Set output directory: `dist`
- Add environment variable: `VITE_API_URL=https://your-backend-url.com`

3. **Deploy on Netlify**
- Connect your GitHub repository
- Set build command: `npm run build`
- Set publish directory: `dist`
- Add environment variable: `VITE_API_URL=https://your-backend-url.com`

## 📁 Project Structure

```
dailytools247/
├── backend/
│   ├── dailytools247/                 # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── image/                   # Image tools app
│   ├── pdf/                     # PDF tools app
│   ├── video/                   # Video tools app
│   ├── audio/                   # Audio tools app
│   ├── zip/                     # ZIP tools app
│   ├── text/                    # Text tools app
│   ├── finance/                 # Finance tools app
│   ├── dev/                     # Development tools app
│   ├── date_time/               # Date & Time tools app
│   ├── security/                # Security tools app
│   ├── education/               # Education tools app
│   ├── internet/                # Internet tools app
│   ├── social/                  # Social media tools app
│   ├── viewers/                 # File viewers app
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/                     # React source code
│   │   ├── components/          # Reusable components
│   │   ├── pages/              # Tool pages and routes
│   │   ├── data/               # Tool categories data
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # Entry point
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
└── README.md
```

## 🔧 Configuration

### Backend Settings

Edit `backend/toolbox/settings.py`:

```python
# Database settings
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.vercel.app",
]

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB
```

### Frontend Configuration

Edit `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test image
```

### Frontend Tests
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

## 📝 API Documentation

The API endpoints are organized by category:

- **Image Tools**: `/api/image/`
- **PDF Tools**: `/api/pdf/`
- **Video Tools**: `/api/video/`
- **Audio Tools**: `/api/audio/`
- **Text Tools**: `/api/text/`
- **Finance Tools**: `/api/finance/`
- **Dev Tools**: `/api/dev/`
- **Date & Time**: `/api/date-time/`
- **Security**: `/api/security/`
- **Education**: `/api/education/`
- **Internet**: `/api/internet/`
- **Social**: `/api/social/`
- **ZIP Tools**: `/api/zip/`

Example API call:
```bash
curl -X POST http://localhost:8000/api/image/generate-qr/ \
  -F "data=https://example.com"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Django and Django Rest Framework teams
- React and Vite teams
- Radix UI and shadcn/ui contributors
- All open-source libraries used in this project

## 📞 Support

For support, please email info@dailytools247.com or create an issue on GitHub.

## 🌟 Highlights

### What Makes Dailytools247 Special?
- **Comprehensive**: 100+ tools covering every daily need
- **Modern Tech Stack**: React 18, TypeScript, Vite, Django
- **Professional UI**: Beautiful, intuitive interface
- **SEO Optimized**: Clean URLs and meta tags for discoverability
- **Fast & Responsive**: Optimized performance across devices
- **Type Safe**: Full TypeScript coverage
- **Well Documented**: Comprehensive README and code comments
- **Easy to Deploy**: Supports Vercel, Netlify, Render, Railway

### Perfect For
- **Developers** needing quick utilities
- **Content creators** processing media files
- **Students** requiring educational tools
- **Business users** needing document tools
- **Social media managers** creating content
- **Anyone** needing daily utility tools

---

**Built with ❤️ for developers and power users**

---

## 🌐 Live Demo

Visit our live site: [https://dailytools247.com](https://dailytools247.com)

## 🚀 Deployment Configuration

### Vercel Configuration
The project includes a `vercel.json` configuration optimized for Vercel deployment:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### SEO Optimization
- **Sitemap**: Automatically generated at `/sitemap.xml`
- **Robots.txt**: Configured for optimal search engine crawling
- **Meta Tags**: Properly configured Open Graph and Twitter Card meta tags
- **Canonical URLs**: Set to `https://dailytools247.com`
- **Structured Data**: JSON-LD schema for better search engine understanding

### Environment Variables
Create `.env.local` for local development:
```bash
VITE_API_URL=http://localhost:8000
```

For production on Vercel:
```bash
VITE_API_URL=https://your-backend-url.com
```

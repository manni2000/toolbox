import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    fs: {
      strict: false,
    },
    proxy: {
      '^/api/': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    historyApiFallback: true,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }
          
          // Radix UI - split into smaller chunks
          if (id.includes('@radix-ui')) {
            if (id.includes('dialog') || id.includes('dropdown') || id.includes('popover')) {
              return 'ui-dialog';
            }
            if (id.includes('select') || id.includes('tabs') || id.includes('navigation')) {
              return 'ui-navigation';
            }
            if (id.includes('toast') || id.includes('alert') || id.includes('label')) {
              return 'ui-feedback';
            }
            return 'ui-base';
          }
          
          // Heavy libraries - lazy load these
          if (id.includes('pdf-lib') || id.includes('pdfjs-dist') || id.includes('jspdf')) {
            return 'pdf-vendor';
          }
          if (id.includes('recharts')) {
            return 'chart-vendor';
          }
          if (id.includes('@xenova/transformers')) {
            return 'ai-vendor';
          }
          
          // Utilities
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
            return 'utils';
          }
          
          // Icons - tree shake
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          // Forms
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
            return 'forms';
          }
          
          // Motion/Animation
          if (id.includes('framer-motion')) {
            return 'motion';
          }
          
          // File handling
          if (id.includes('file-saver') || id.includes('jszip')) {
            return 'files';
          }
          
          // QR codes
          if (id.includes('qrcode') || id.includes('jsbarcode')) {
            return 'qr';
          }
          
          // Crypto
          if (id.includes('crypto-js') || id.includes('uuid')) {
            return 'crypto';
          }
          
          // Date utilities
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date';
          }
          
          // DOM manipulation
          if (id.includes('marked') || id.includes('html2canvas')) {
            return 'dom';
          }
          
          // TanStack Query
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          
          // Node modules that don't fit above
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Lower threshold to catch large chunks
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  preview: {
    port: 8080,
    host: "::",
  }
}));
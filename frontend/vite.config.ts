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
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
          ],
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          'framer-motion': ['framer-motion'],
          'tanstack-query': ['@tanstack/react-query'],
          'pdf-vendor': ['pdf-lib', 'pdfjs-dist', 'jspdf'],
          'chart-vendor': ['recharts'],
          'icon-vendor': ['lucide-react'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'crypto-vendor': ['crypto-js', 'uuid'],
          'file-vendor': ['file-saver', 'jszip'],
          'qr-vendor': ['qrcode', 'jsbarcode'],
          'date-vendor': ['date-fns'],
          'dom-vendor': ['marked', 'html2canvas'],
          'ai-vendor': ['@xenova/transformers'],
        },
      },
    },
    chunkSizeWarningLimit: 3000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  preview: {
    port: 8080,
    host: "::",
  }
}));
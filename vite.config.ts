import path from 'path';
import { defineConfig } from 'vite';
import oxlintPlugin from 'vite-plugin-oxlint';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [react(), tailwindcss(), oxlintPlugin()],
  clearScreen: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    global: 'globalThis',
  },
  ssr: {
    noExternal: ['@tailwindcss/vite'],
  },
  build: {
    rollupOptions: {
      // Exclude binary files that can't be processed by Vite
      external: [
        '@tailwindcss/oxide',
        '@tailwindcss/node',
        '@tailwindcss/oxide-win32-x64-msvc',
        '@tailwindcss/oxide-win32-arm64-msvc',
        '@tailwindcss/oxide-linux-x64-gnu',
        '@tailwindcss/oxide-linux-x64-musl',
        '@tailwindcss/oxide-linux-arm64-gnu',
        '@tailwindcss/oxide-linux-arm64-musl',
        '@tailwindcss/oxide-linux-arm-gnueabihf',
        '@tailwindcss/oxide-darwin-x64',
        '@tailwindcss/oxide-darwin-arm64'
      ],
      output: {
        // Add manualChunks configuration here to avoid duplication
        manualChunks: {
          // React and related libraries
          react: ['react', 'react-dom'],

          // Routing library (if you add it later)
          // router: ['react-router-dom'],

          // State management
          zustand: ['zustand'],

          // Tiptap editor
          tiptap: [
            '@tiptap/markdown',
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-image',
            '@tiptap/suggestion'
          ],

          // Radix UI components
          radix_ui: [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            'sonner'
          ],

          // UI and styling related
          ui: [
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],

          // PDF generation
          pdf: [
            'jspdf',
            'html2canvas'
          ],

          // Markdown processing
          markdown: [
            'marked'
          ],

          // Hotkeys
          hotkeys: [
            'react-hotkeys-hook',
            'tippy.js'
          ],

          // Tauri related
          tauri: [
            '@tauri-apps/api',
            '@tauri-apps/plugin-dialog',
            '@tauri-apps/plugin-fs',
            '@tauri-apps/plugin-process'
          ],

          // DnD functionality
          dnd: [
            '@dnd-kit/core'
          ]
        }
      }
    }
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  }
}));

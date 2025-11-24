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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          radix_ui: [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            'sonner'
          ],
          ui: [
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'tailwindcss',
            '@tailwindcss/typography'
          ],
          tiptap: ['@tiptap/markdown', '@tiptap/react', '@tiptap/starter-kit']
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

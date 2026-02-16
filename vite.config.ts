import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Otimizações para produção
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs em produção
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar vendor chunks para melhor cache
            'react-vendor': ['react', 'react-dom'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'aws-vendor': ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
            'icons-vendor': ['lucide-react']
          }
        }
      },
      // Aumentar limite de aviso de chunk size
      chunkSizeWarningLimit: 1000,
      // Sourcemaps apenas em desenvolvimento
      sourcemap: mode === 'development'
    }
  };
});

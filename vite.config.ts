import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5176,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    // tests/e2e.spec.ts es de Playwright, no de Vitest — si vitest intenta
    // correrlo falla con "test.describe() no esperado acá". Y todavía no hay
    // tests unitarios en este repo, así que sin passWithNoTests el comando
    // "test" fallaría por no encontrar nada — mejor eso que volver a taparlo.
    include: ['src/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
  },
});

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright de admin.
 *
 * Reescrito el 30-08-2026 sobre el scaffold original. Dos cosas cambiaron:
 * los viewports mobile salieron del bloque comentado —"layouts rotos en
 * mobile" era un modo de falla nombrado por el equipo y no habia un solo test
 * que lo pudiera ver— y la captura pasa a ser siempre, porque la Definition
 * of Done ya no pide que una persona abra el navegador y esta suite es lo que
 * la reemplaza. La evidencia tiene que quedar mirable por un agente.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  /* 15 s, no los 5 s por defecto. `main.tsx` fuerza un splash minimo de 5 s
   * (MIN_SPLASH_MS) mas 300 ms de fade en CADA carga de pagina, y mientras
   * dura, `#root` no tiene caja de layout: Playwright lo ve oculto. Con el
   * timeout por defecto toda la suite fallaba justo en el limite. */
  expect: { timeout: 15_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5176',
    screenshot: 'on',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5176',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

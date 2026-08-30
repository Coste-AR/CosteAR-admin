import { test, expect, laAppPinto } from './fixtures';

/**
 * Reemplaza a `tests/e2e.spec.ts`, que se borro el 30-08-2026.
 *
 * Aquel archivo tenia tres tests: dos con el cuerpo entero comentado —pasaban
 * sin ejecutar una sola asercion— y uno que solo miraba el `<title>`. El
 * `<title>` lo pone el index.html, no React: ese test daba verde con la
 * pantalla en blanco. Era cobertura declarada, no cobertura real.
 *
 * Las rutas con `requireAdmin` necesitan un fixture de sesion que todavia no
 * existe. Queda anotado como pendiente en el documento de orquestacion, no
 * como un test comentado que finge cubrirlo.
 */
const RUTAS_PUBLICAS = [
  { path: '/', nombre: 'index' },
  { path: '/login', nombre: 'login' },
  { path: '/forgot-password', nombre: 'recuperar-password' },
] as const;

for (const ruta of RUTAS_PUBLICAS) {
  test(`${ruta.nombre} carga sin errores de consola`, async ({ page, consola }, testInfo) => {
    await page.goto(ruta.path);
    await laAppPinto(page);

    await testInfo.attach(`${ruta.nombre}-${testInfo.project.name}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });

    expect(consola.mensajes, `errores en ${ruta.path}`).toEqual([]);
  });
}

test('el panel /admin no se abre sin sesion', async ({ page }) => {
  await page.goto('/admin');
  // `requireAdmin` tiene que sacarnos de ahi. Si esto empieza a fallar es un
  // agujero de autorizacion, no un test frágil.
  await expect(page).not.toHaveURL(/\/admin(\/|$)/);
});

test('no hay scroll horizontal en mobile', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('Mobile'), 'solo aplica a viewports mobile');

  await page.goto('/login');
  await laAppPinto(page);

  const desborde = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(desborde, 'el login desborda a lo ancho en mobile').toBeLessThanOrEqual(1);
});

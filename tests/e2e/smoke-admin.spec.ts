import { test, expect, laAppPinto } from './fixtures';

test('el panel /admin carga con sesión de administrador', async ({ page, consola, sesionAdmin }, testInfo) => {
  void sesionAdmin;

  await page.goto('/admin');
  await laAppPinto(page);
  await expect(page).toHaveURL(/\/admin$/);

  await testInfo.attach(`admin-${testInfo.project.name}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

  expect(consola.mensajes, 'errores en /admin').toEqual([]);
});

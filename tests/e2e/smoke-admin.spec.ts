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

test.fail(
  'el fixture admin conserva requests sin mockear repetidas y falla en el teardown',
  async ({ page, sesionAdmin }) => {
    void sesionAdmin;

    await page.goto('/admin');
    await laAppPinto(page);

    const statuses = await page.evaluate(async () => {
      const endpoint = '/api/v1/e2e/sin-fixture';
      const responses = await Promise.all([fetch(endpoint), fetch(endpoint)]);
      return responses.map((response) => response.status);
    });

    // El cuerpo termina bien. El teardown falla y enumera dos veces la misma
    // request, demostrando que el fixture conserva orden y repeticiones.
    expect(statuses).toEqual([501, 501]);
  },
);

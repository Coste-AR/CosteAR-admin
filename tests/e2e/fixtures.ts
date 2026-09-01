import { test as base, expect, type Page } from '@playwright/test';

/**
 * Errores de consola y excepciones no atrapadas.
 *
 * Un test que solo hace `goto` + `expect(title)` da verde con la pantalla en
 * blanco: React explota, el root queda vacio y Playwright no se entera porque
 * el `<title>` lo pone el index.html, no la app. Ese es exactamente el test
 * que habia en admin. Aca cualquier error de consola o excepcion de pagina
 * rompe el test, que es la unica forma de que "la pantalla anda" signifique algo.
 */
type ErroresDeConsola = { mensajes: string[] };
type PeticionesSinMockear = { peticiones: string[] };

const PERFIL_ADMIN = {
  id: 'e2e-admin',
  email: 'admin-e2e@costear.test',
  name: 'Admin E2E',
  role: 'ADMIN',
};

const ESTADISTICAS_ADMIN = {
  saas: { totalUsers: 12, activeUsersToday: 3, totalCompanies: 4 },
  vault: {
    totalChunks: 42,
    totalSignals: 7,
    pendingSignals: 0,
    ragMisses: 1,
    userCorrections: 2,
    signalsBySource: {},
  },
};

export const test = base.extend<{
  consola: ErroresDeConsola;
  peticionesSinMockear: PeticionesSinMockear;
  sesionAdmin: void;
}>({
  peticionesSinMockear: async ({}, use) => {
    await use({ peticiones: [] });
  },

  /**
   * El bootstrap de sesion pega a /auth/refresh en CADA carga de pagina. Sin
   * backend levantado eso da 500 y ensucia la consola con un error que no es
   * de la app: la suite entera fallaba por eso.
   *
   * Se responde 401 —"no hay sesion"— que es el estado honesto para una ruta
   * publica y no depende de que alguien tenga Docker corriendo. Es ademas lo
   * que hace la suite determinista en CI, donde no hay API.
   */
  page: async ({ page, peticionesSinMockear }, use) => {
    // Este es el último recurso, no un mock por defecto: cualquier endpoint
    // nuevo que una pantalla empiece a pedir tiene que quedar declarado en el
    // fixture. Devolver 501 mantiene la navegación viva para que el teardown
    // pueda informar TODAS las omisiones en vez de ocultar la primera.
    await page.route('**/api/v1/**', async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());
      peticionesSinMockear.peticiones.push(`${request.method()} ${pathname}`);
      await route.fulfill({
        status: 501,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'API sin mock E2E' }),
      });
    });

    await page.route('**/api/*/auth/refresh', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'no hay sesion' }),
      }),
    );
    await use(page);

    if (peticionesSinMockear.peticiones.length > 0) {
      throw new Error(
        [
          'requests E2E sin fixture:',
          ...peticionesSinMockear.peticiones.map((request) => `- ${request}`),
        ].join('\n'),
      );
    }
  },

  /**
   * Sesión reutilizable para rutas detrás de requireAdmin. Reemplaza el
   * refresh público por un token y responde el perfil que el bootstrap usa
   * para completar el store de auth, además de las lecturas de /admin.
   */
  sesionAdmin: async ({ page }, use) => {
    await page.route('**/api/v1/auth/refresh', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ data: { accessToken: 'e2e-admin-token' } }),
      }),
    );
    await page.route('**/api/v1/user/profile', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ data: PERFIL_ADMIN }),
      }),
    );
    await page.route('**/api/v1/admin/stats', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ data: ESTADISTICAS_ADMIN }),
      }),
    );

    await use();
  },

  consola: async ({ page }, use) => {
    const mensajes: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const texto = msg.text();
      // "Failed to load resource" lo emite el NAVEGADOR cuando una respuesta
      // HTTP no es 2xx, no el codigo de la app. Un 401 del refresh en una ruta
      // publica es el comportamiento correcto y aun asi aparece aca. Filtrarlo
      // es lo que hace que el resto de la lista signifique algo: lo que queda
      // son `console.error` que escribio alguien de nuestro lado.
      if (texto.startsWith('Failed to load resource')) return;
      mensajes.push(`console.error: ${texto}`);
    });
    page.on('pageerror', (err) => {
      mensajes.push(`pageerror: ${err.message}`);
    });

    await use({ mensajes });
  },
});

export { expect };

/**
 * Verifica que la app efectivamente pinto algo, no que el HTML cargo.
 * `#root` vacio es el modo de falla que buscamos: build en verde, pantalla en
 * blanco.
 */
export async function laAppPinto(page: Page) {
  const root = page.locator('#root');
  // Hay que esperar a que pase el splash: mientras el loader esta montado su
  // unico hijo es de posicion fija, asi que `#root` mide cero y cuenta como
  // oculto. El timeout largo esta en `playwright.config.ts` con el motivo.
  await expect(root).toBeVisible();
  await expect(root).not.toBeEmpty();
}

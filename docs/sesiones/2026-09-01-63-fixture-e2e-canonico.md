# 2026-09-01 — El fixture admin deja de borrar requests repetidas

- **Issue:** #63
- **Repo:** CosteAR-admin
- **Rama:** `test/fixture-e2e-canonico`
- **PR:** #68
- **Agente:** Codex · GPT-5
- **Tanda:** B1

## Recursos

| | |
| --- | --- |
| Tiempo de la sesión | ~35 min |
| Tokens consumidos | no informado |
| Intentos hasta el verde válido | 2 |
| Comandos de verificación corridos | `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`, Playwright dirigido con reporter JSON |

## Qué se hizo

El fixture de Playwright acumulaba las peticiones sin respuesta en un `Set`, por lo que una
pantalla que repitiera cinco veces el mismo pedido dejaba una sola evidencia. Ahora conserva cada
ocurrencia, en orden, y el teardown muestra el mismo mensaje que el fixture canónico de frontend.

También se agregó una prueba negativa: entra a `/admin` con la sesión simulada, pide dos veces el
mismo endpoint no configurado, confirma ambos `501` y termina con la falla esperada del teardown.
La salida enumera dos veces `GET /api/v1/e2e/sin-fixture`.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** cargar y renderizar `/admin` antes de ejecutar los dos `fetch` relativos.
- **Qué otra opción había:** pedir una URL absoluta sin navegar primero.
- **Por qué elegí esta:** así el caso demuestra el comportamiento dentro del flujo autenticado
  real y no puede pasar por una falla de parseo de URL ajena al fixture.

- **Qué decidí:** conservar el fixture actual de `sesionAdmin` y cambiar sólo la acumulación y el
  teardown.
- **Qué otra opción había:** copiar entero `fixtures.ts` desde frontend.
- **Por qué elegí esta:** el issue exige copiar la forma, no el archivo; las sesiones y mocks de
  admin son distintos y ya estaban fuera de alcance.

## Dónde el issue no alcanzaba

El issue pedía un caso negativo con `test.fail`, pero no exigía verificar **por qué** fallaba. La
primera versión del test quedó verde porque `fetch('/api/v1/e2e/sin-fixture')` se ejecutó antes de
navegar y falló al resolver la URL. Playwright consideró esa falla como la esperada aunque el
teardown nunca se había probado. El reporter JSON reveló el falso positivo; después de navegar a
`/admin`, el error observado fue el correcto y mostró las dos requests repetidas.

## Qué quedó afuera

- `src/`, el catch-all 501, las rutas de `sesionAdmin` y el test de autorización quedaron intactos.
- No se modificaron dependencias. `npm ci` informó 13 vulnerabilidades existentes: 4 moderadas,
  8 altas y 1 crítica.
- `ESTADO.md` sigue desactualizado respecto de `ORQUESTACION.md`; corregir documentación de flujo
  no pertenece al issue #63.

## Con qué se verifica

```bash
npm run typecheck
# pasó sin errores

npm test
# pasó; no hay archivos de test unitario configurados

npm run build
# pasó; warning preexistente por un chunk mayor a 500 kB

npm run test:e2e
# 26 passed, 2 skipped, 0 unexpected failures; cuatro viewports; 1.2 min

npx playwright test tests/e2e/smoke-admin.spec.ts --project=chromium --reporter=json
# error esperado del teardown:
# requests E2E sin fixture:
# - GET /api/v1/e2e/sin-fixture
# - GET /api/v1/e2e/sin-fixture
```

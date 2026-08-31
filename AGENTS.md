# AGENTS.md — cómo se trabaja en este repo

Esto es `Coste-AR/CosteAR-admin`: el panel interno de CosteAR.

**Leelo entero antes de tocar nada.** Es el contrato de trabajo del repo, y está acá porque un
agente arranca frío: si no está escrito, lo inventa.

Las convenciones de fondo están en [`CLAUDE.md`](CLAUDE.md) y [`CONTRIBUTING.md`](CONTRIBUTING.md),
y la [`DEFINITION-OF-DONE.md`](DEFINITION-OF-DONE.md) dice cuándo algo está terminado. Aplican
igual. Este archivo es lo mínimo que no podés no saber.

## Leé esto antes que nada

**Este repo es privado y en plan free de GitHub no tiene protección de rama.** Traducido: el CI
acá **no te va a frenar**. Se puede mergear con todo en rojo y GitHub no dice nada. En los otros
dos repos hay una barrera técnica; acá no.

Que el CI esté en verde depende de vos. No es una formalidad: es lo único que hay.

## Lo primero, antes de leer el issue

```bash
npm run briefing
```

Te imprime en qué estado está el proyecto **ahora**: en qué rama estás, si tu copia quedó atrás
de `origin/dev`, qué PRs tuyos hay abiertos, qué issues tenés asignados, y el `ESTADO.md` con lo
que está pasando esta semana — incluidos los tests flaky conocidos, para que no pierdas media hora
re-corriendo una suite que ya sabemos que falla.

Existe porque la trazabilidad escrita en documentos depende de que alguien se acuerde de leerlos,
y además envejece: un documento dice qué pasaba el 22 de agosto, no qué pasa hoy. Esto sale de
git y de `gh` en el momento.

## El ciclo

1. **Ramificá desde `dev`.** Nunca desde `main`. Nombre: `feat/…`, `fix/…`, `test/…`, `chore/…`.
2. **Commits convencionales** (`feat:`, `fix:`, `test:`, `chore:`). Hay commitlint. Escribí el
   **por qué** en el cuerpo, no sólo el qué.
3. **Abrí PR contra `dev`.**
4. **Antes de marcar el PR listo, poné tu rama al día con `dev`:**

   ```bash
   gh pr update-branch <numero-de-tu-pr>
   ```

   No es un trámite. El verde que tenías se calculó contra la versión de `dev` de cuando abriste
   la rama; si `dev` avanzó, ese verde ya no dice nada sobre cómo queda tu cambio integrado con lo
   que hay ahora. Dos PR verdes contra el mismo `dev` viejo entran los dos, y el segundo puede
   romperlo.

   Si no lo hacés, el auto-merge te lo va a pedir por comentario y el PR se queda esperando.

5. **Cuando esté listo y en verde, ponele vos la etiqueta `auto-merge`:**

   ```bash
   gh pr ready <numero>
   gh pr edit <numero> --add-label auto-merge
   ```

   **No mergeás con el botón.** Mergea `.github/workflows/auto-merge.yml`, y sólo si todos los
   checks están en verde, la rama al día y sin conflictos. Vos decís "esto está listo"; la máquina
   verifica que sea cierto.

   Antes de etiquetar, mirá tu propio PR una vez más contra el issue: ¿hace lo que pedía?
   ¿te fuiste de alcance? ¿declarás cobertura que no tenés? Ese es el review que estás
   reemplazando, y lo hacés vos.

   **Esperar no ayuda a nadie.** Un PR que se queda abierto se desactualiza contra `dev` y empieza
   a generar conflictos con el trabajo de los demás. Si está listo, que entre.

## Con qué se verifica

```bash
npm run typecheck   # tsc --noEmit
npm run test        # vitest
npm run test:e2e    # Playwright — la verificación de pantalla
```

`npm run lint` **todavía no hace nada** en este repo (regla CMD-02 en `CLAUDE.md`). No lo tomes
como que pasó. La primera vez: `npx playwright install --with-deps`.

## Sobre la verificación de pantalla

Desde el 30-08-2026 la Definition of Done **ya no pide** que una persona abra el navegador. La
suite E2E es lo que la reemplaza, así que tiene que dejar evidencia mirable: cada test adjunta
captura de página completa con `testInfo.attach()`.

**El antecedente que no se repite:** hasta esa fecha este repo tenía `tests/e2e.spec.ts` con tres
tests — dos con el cuerpo entero comentado, que pasaban sin ejecutar una sola aserción, y uno que
sólo miraba el `<title>`. El `<title>` lo pone el `index.html`, no React: ese test daba verde con
la pantalla en blanco. Era cobertura declarada, no cobertura real, y estuvo así durante meses.

Si algo no se puede cubrir todavía, **se dice en el PR y se abre issue**. No se deja un test que
finge cubrirlo.

## Lo que te va a morder si no lo sabés

- **El dev server corre en el puerto 5176**, no 5173.
- **La suite E2E no depende de que haya backend levantado.** `tests/e2e/fixtures.ts` intercepta
  `/auth/refresh` con `page.route()` y devuelve 401. Reusá ese patrón, y reusá `laAppPinto()` y el
  detector de errores de consola que ya están ahí.
- **El test `el panel /admin no se abre sin sesion` no se toca.** Es un chequeo de autorización:
  si empieza a fallar, hay un agujero. No es un test de pantalla.
- **Vitest corre sólo `src/**/*.test.{ts,tsx}`.** Los specs de Playwright viven en `tests/e2e/`.
  No amplíes ese `include`: si Vitest levanta un spec de Playwright, falla.
- **Nada de colores en hex crudo ni spacing arbitrario** donde hay token de Tailwind. La identidad
  es el granate de "Identidad Visual v1.0".

## Tu bitácora de sesión — obligatoria, va en el mismo PR

Escribí `docs/sesiones/AAAA-MM-DD-<issue>-<slug>.md`. No lo escribe otro después: lo que se anota
a mano al final es una promesa que se incumple sola.

- **Recursos:** tiempo, tokens, intentos hasta el verde, comandos corridos. Si la herramienta no
  te informa los tokens, poné **"no informado"** — no estimes. Un número inventado es peor que un
  hueco, porque alguien lo va a sumar.
- **Decisiones que tomaste sobre la marcha:** qué decidiste, qué otra opción había, por qué esa.
- **Dónde el issue no alcanzaba:** lo que tuviste que suponer porque no estaba escrito, **aunque
  hayas acertado**. No es una queja: es con lo que mejoramos cómo pedimos el trabajo.
- **Qué quedó afuera.**

Formato completo: `CosteAR-os/plantillas/bitacora-sesion-agente.md`.

## Lo que no hacés nunca

- **No mergeás.**
- **No borrás ni saltás tests para poner el CI en verde.**
- **No amplías el alcance del issue.** Lo de paso va a un issue nuevo, y lo decís en el PR.

## Qué tiene que decir tu PR

Qué hiciste, por qué, cómo probarlo, y **qué quedó afuera**. Pegá la salida de
`npm run test:e2e`.

---

El protocolo completo del equipo está en [`Coste-AR/CosteAR-os`](https://github.com/Coste-AR/CosteAR-os).

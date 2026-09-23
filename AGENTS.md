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

Antes de leer el issue, leé la [Constitución de CosteAR](https://github.com/Coste-AR/CosteAR-os/blob/dev/CONSTITUCION.md)
del repo `Coste-AR/CosteAR-os`: es una página con diez principios. Si el issue contradice la
Constitución, el issue está mal: decilo en el issue y no lo hagas. Cuando tomes una decisión sobre
la marcha, citá en la bitácora el principio aplicado (`Constitución §N`).

Te imprime en qué estado está el proyecto **ahora**: en qué rama estás, si tu copia quedó atrás
de `origin/dev`, qué PRs tuyos hay abiertos, qué issues tenés asignados, y el `ESTADO.md` con lo
que está pasando esta semana — incluidos los tests flaky conocidos, para que no pierdas media hora
re-corriendo una suite que ya sabemos que falla.

También trae el modo de trabajo y los mensajes `/agente` de la orquestación. Si hay uno en el
issue que vas a tomar, **leelo antes de tocar código**.

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

5. **Cuando esté listo y en verde, marcá el PR como listo y avisá. Ahí termina tu parte:**

   ```bash
   gh pr ready <numero>
   ```

   **Vos no ponés la etiqueta `auto-merge` y no mergeás.** Ni tu propio PR. La etiqueta la pone
   Santiago, y es el punto donde entra el juicio humano: **reemplaza al review, no es un trámite.**
   No hay reviews requeridos en este repo, así que sin ese freno cualquier PR entraría a `dev` en
   cuanto el CI se pusiera verde.

   El merge lo hace `.github/workflows/auto-merge.yml`, y sólo si todos los checks están en verde,
   la rama al día y sin conflictos. La persona dice "esto está listo"; la máquina verifica que sea
   cierto.

   Antes de avisar, mirá tu propio PR una vez más contra el issue: ¿hace lo que pedía? ¿te fuiste
   de alcance? ¿declarás cobertura que no tenés? Decilo en el mensaje con el que entregás, junto
   con lo que el issue no definía y tuviste que decidir vos.

   **Esperar no ayuda a nadie.** Un PR que se queda abierto se desactualiza contra `dev` y empieza
   a generar conflictos con el trabajo de los demás. Si está listo, decilo.

   El reparto completo de quién hace qué está en `CosteAR-os/ORQUESTACION.md`. **Ante cualquier
   contradicción entre este archivo y ese, manda ese.**

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

Formato completo: `CosteAR-os/software/templates/bitacora-sesion-agente.md`.

## Antes de decir que algo ya está resuelto

Vale para cualquier trabajo de investigación: un triage, cerrar un issue viejo, contestar "eso ya
está hecho". **Que el código exista no significa que esté en `dev`.**

```bash
git merge-base --is-ancestor <commit> origin/dev && echo "SI llegó" || echo "NO llegó"
git branch -r --contains <commit>          # ¿en qué ramas vive?
git grep -n "<el símbolo que agregó>" origin/dev
```

**Los tres, no uno.** Que el archivo exista en `dev` no alcanza: puede existir por otro trabajo
distinto y parecido.

> **Pasó el 04-09-2026.** Un triage recomendó cerrar el issue #98 del backend —el control de
> variaciones presupuesto/volumen— afirmando que el commit "ya está en `origin/dev`". Estaba
> únicamente en una rama del 20-08 **sin ningún PR, ni abierto ni cerrado**. Lo que confundió es
> que en `dev` sí hay trabajo sobre variaciones, y el archivo de test existe y menciona la misma
> tolerancia: 12 coincidencias en `dev` contra 36 en la rama. **Se parecía lo suficiente como para
> dar por cerrado algo que no estaba.** Si se cerraba, se perdían 125 líneas y un ADR.

Tirando de ese hilo aparecieron **seis ramas remotas con commits fuera de `dev` y sin ningún PR**,
tres de ellas la implementación de issues que siguen abiertos. `PR-06` cubre *"se mergeó pero no
llegó"*; esto es el hueco de al lado: **trabajo que nunca se propuso**, así que no hay merge que
verificar y ninguna alarma que suene.

**Si encontrás una rama así, no la mergees ni la des por perdida: decilo en el issue con el commit
y la rama.** Que exista trabajo escrito cambia la recomendación, no la ejecuta.

## Lo que no hacés nunca

- **No mergeás.**
- **No borrás ni saltás tests para poner el CI en verde.**
- **No amplías el alcance del issue.** Lo de paso va a un issue nuevo, y lo decís en el PR.

## Qué tiene que decir tu PR

Qué hiciste, por qué, cómo probarlo, y **qué quedó afuera**. Pegá la salida de
`npm run test:e2e`.

---

El protocolo completo del equipo está en [`Coste-AR/CosteAR-os`](https://github.com/Coste-AR/CosteAR-os).

---

## Registro de cambios de este archivo

Este archivo es **normativo**: cambia lo que hace todo el mundo después. Por eso cada cambio deja
su fila acá, y por eso el auto-etiquetado no lo deja entrar sin ella — un PR que toca este archivo
y no declara qué cambió queda esperando a una persona.

|Fecha|Qué cambió|Fuente|
|---|---|---|
|2026-09-22|Se exige leer la Constitución antes del issue, rechazar contradicciones y citar en la bitácora el principio aplicado a cada decisión tomada durante el trabajo.|CosteAR-admin#102|
|2026-09-13|El briefing incorpora el modo de trabajo y los mensajes `/agente`; se explicita que el mensaje del issue elegido se lee antes de tocar código.|CosteAR-admin#98|
|2026-09-04|**Se agrega "Antes de decir que algo ya está resuelto".** Un triage recomendó cerrar un issue afirmando que el commit ya estaba en `dev`; estaba sólo en una rama sin PR, y cerrarlo habría perdido 125 líneas y un ADR. Se agregan los tres comandos que lo comprueban y qué hacer al encontrar una rama huérfana. **Y se inaugura esta tabla**, que no existía: sin ella ningún cambio a este archivo se podía auto-etiquetar.|Santiago|

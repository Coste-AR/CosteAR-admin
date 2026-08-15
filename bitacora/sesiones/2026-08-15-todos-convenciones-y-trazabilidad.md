# 2026-08-15 — Convenciones del equipo y sistema de trazabilidad

- **Repo(s):** backend, frontend, admin
- **Rama:** `chore/convenciones-y-trazabilidad` (la misma en los tres)
- **PRs:** [backend #55](https://github.com/Coste-AR/CosteAR-backend/pull/55) · [frontend #35](https://github.com/Coste-AR/CosteAR-frontend/pull/35) · [admin #9](https://github.com/Coste-AR/CosteAR-admin/pull/9)
- **ADRs:** —
- **Estado:** ✅ mergeado a `dev` en los tres repos el 15-08-2026 (ver *Actualización* al pie)

## Qué se hizo

Se armó el sistema de trabajo del equipo: las reglas quedaron escritas, y donde se podía,
**forzadas por la herramienta** en vez de depender de que uno se acuerde.

- **Se cerró el agujero más grave: se podía mergear a `main` con los tests en rojo.** Ahora las
  seis ramas principales (`main`, `staging` y `dev` de backend y frontend) exigen que el CI esté
  en verde. `main` y `staging` además piden la aprobación de otro socio.
- **Cada repo tiene ahora un `CLAUDE.md`**, que es el archivo que Claude Code lee solo al
  arrancar cualquier sesión. Ahí están las reglas duras, los comandos reales de ese repo y los
  errores que ya cometimos, para no repetirlos.
- **Cada repo tiene un `CONTRIBUTING.md`**: lo mismo, pero explicado para una persona que se suma.
- **Plantillas automáticas** de Pull Request y de issues: GitHub las precarga solas, así todos
  describimos el trabajo igual.
- **Validación automática de los mensajes de commit** (*commitlint*) y **chequeo de tipos antes
  de cada commit**: si el código no compila, el commit no entra.
- **Registro de decisiones (ADR)** en `docs/adr/` de cada repo: una decisión técnica por archivo,
  con el contexto y las alternativas que se descartaron. Los dos `DECISIONES.md` viejos (uno de
  casi 3.000 líneas) quedan como registro histórico, intactos pero cerrados.
- **Esta bitácora**, más la **Definition of Done** del equipo (cuándo algo está realmente
  terminado, incluido el nivel "entrega al cliente").
- **Cinco skills para Claude Code** — `/costear-commit`, `/costear-pr`, `/costear-review`,
  `/costear-adr` y `/costear-bitacora` — que automatizan todo lo anterior. Se distribuyen por
  git: con un `git pull` le aparecen a todo el equipo, sin instalar nada.
- **El repo admin pasó a tener CI**, que antes no tenía nada.

## Por qué

Entramos con el **primer cliente real** (la avícola). Eso cambia el estándar de todo: un número
mal calculado deja de ser un bug y pasa a ser una decisión de negocio equivocada que toma el
cliente con nuestros datos.

Hasta ahora las convenciones existían de hecho —las ramas ya se venían nombrando bien, el
backend ya tenía CI y hooks— pero no estaban escritas en ningún lado ni forzadas. Y no había
forma de responder *"¿por qué el código hace esto?"* sin depender de que alguien se acordara.

El material salió de relevar el repo `asomelab/de-wall` (el proyecto de ASOME donde trabaja
Santiago, que tiene el proceso armado) y adaptarlo a un equipo de tres, sacando todo lo que no
protege directamente al cliente o al código.

## Decisiones que se tomaron sobre la marcha

- **Los repos backend y frontend quedan públicos por ahora.** La protección de ramas de GitHub
  solo funciona en repos públicos con el plan Free de la organización. Pasarlos a privados
  costaría perderla, salvo pagando GitHub Team (~US$12/mes los tres). Queda para revisar.
- **`CosteAR-admin` y `costear-knowledge-base` son privados y por eso no se les puede forzar la
  protección de ramas.** Ahí las mismas reglas valen como acuerdo del equipo, escrito en sus
  `CLAUDE.md`.
- **La bitácora vive en el repo admin y no en la base de conocimiento**, para no meterle ruido de
  desarrollo al corpus de costeo que alimenta el RAG del producto.
- **El `commitlint.config.js` tuvo que escribirse en formato ESM.** Los tres repos son
  `"type": "module"` y con el formato clásico de CommonJS explota. Lo detectó el propio hook en
  el primer commit — o sea que el sistema se validó a sí mismo antes de estar terminado.
- **El repo admin no tiene ESLint ni tests**, así que su CI corre solo `typecheck` y `build`.
  Poner ahí `npm run lint` o `npm test` haría fallar el pipeline por algo que no existe, y un CI
  que falla siempre es un CI que el equipo aprende a ignorar.

## Qué quedó pendiente

- **Configurar ESLint y los primeros tests en `CosteAR-admin`.** Hoy `npm run lint` solo imprime
  un aviso. Es la única deuda que este trabajo deja explícita.
- **Decidir si los repos pasan a privados** y si se paga GitHub Team.
- **Evaluar mover el tablero de Trello a GitHub Projects**, para que issues, PRs y tarjetas sean
  la misma cosa.
- Bajarle las reglas a Alan y a Juli. El resumen de una página está en
  [`bitacora/README.md`](../README.md).

## Cómo verificarlo

1. **Que la protección funciona:** intentar `git push origin dev` directo desde cualquiera de
   los dos repos públicos → GitHub lo rechaza.
2. **Que el hook de commits funciona:** `git commit -m "cambios"` → lo rechaza commitlint.
   Con `git commit -m "fix(costeo): corregir el prorrateo"` → pasa.
3. **Que el typecheck corre antes del commit:** meter un error de tipos a propósito e intentar
   commitear → se cancela.
4. **Que las plantillas cargan:** abrir un PR nuevo y ver que el cuerpo viene precargado.
5. **Que las skills están:** abrir Claude Code en cualquiera de los tres repos y tipear
   `/costear-` — tienen que aparecer las cinco.
6. **Que el CI del admin anda:** ver el check en verde en el PR #9 (es su primera corrida).

## Riesgos abiertos

- **`main` y `staging` tienen `enforce_admins` activo**: ni siquiera un administrador puede
  saltear la regla. Es lo que hace que sea real, pero significa que **si hace falta un hotfix
  urgente y Alan y Juli no están disponibles para aprobar, Santiago queda bloqueado.** La salida
  de emergencia es desactivarlo un momento desde Settings → Branches, y **volver a activarlo
  inmediatamente después**. Si eso pasa, se registra acá.
- **El hook de `pre-commit` corre el typecheck completo del repo**, no solo de los archivos
  tocados. Si el proyecto ya venía con un error de tipos previo, el commit se bloquea aunque tu
  cambio esté bien. Hoy los tres repos están limpios, así que no molesta.
- **Las skills están duplicadas en los tres repos** (es la única forma de que Claude Code las
  encuentre). La copia canónica es la del admin y se propagan con `npm run skills:sync`. Si
  alguien edita una copia a mano, el próximo sync se la pisa.

---

## Actualización — 15-08-2026

Santiago mergeó los tres PRs a `dev`:

| Repo | PR | Merge commit |
| --- | --- | --- |
| backend | [#55](https://github.com/Coste-AR/CosteAR-backend/pull/55) | `58ae04b1` |
| frontend | [#35](https://github.com/Coste-AR/CosteAR-frontend/pull/35) | `2f16d8d5` |
| admin | [#9](https://github.com/Coste-AR/CosteAR-admin/pull/9) | `880004ec` |

Verificado en `dev` de los tres repos: están el `CLAUDE.md`, el `CONTRIBUTING.md`, el
`commitlint.config.js`, el hook `commit-msg` y las 5 skills.

**Lo que falta para que llegue a producción:** promover `dev → staging` y después
`staging → main`. Esas dos promociones ahora necesitan la aprobación de otro socio, así que
son la primera prueba real de la regla nueva.

> Esta sección se agregó en vez de reescribir el texto de arriba, siguiendo la regla BIT-04:
> una entrada no se edita para corregir la historia, se le agrega lo que pasó después.

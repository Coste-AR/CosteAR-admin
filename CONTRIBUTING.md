# Guía de contribución — CosteAR Admin

Punto de partida para cualquiera que trabaje en este repo.

> Las reglas duras y resumidas están en [`CLAUDE.md`](./CLAUDE.md) — ese archivo lo lee la IA
> sola en cada sesión. Este documento es el mismo contenido explicado **para una persona**.

---

## Este repo tiene dos funciones

**(a) El panel de administración interno** de CosteAR — React + Vite, mismo stack que el frontend.

**(b) La bitácora del desarrollo de todo el proyecto** — [`bitacora/`](./bitacora/README.md).
Acá se registra qué se hizo, cuándo y por qué, cruzando los tres repos de código. Es la memoria
del equipo frente al cliente.

Ahí también viven la [Definition of Done](./DEFINITION-OF-DONE.md) y la **copia canónica de las
skills** del equipo (`.claude/skills/`).

> ⚠️ Este repo es **privado**, y el plan Free de GitHub no permite proteger ramas en repos
> privados. Acá las reglas de rama **no están forzadas por la herramienta: son un acuerdo.**
> Se cumplen igual.

---

## Setup

**Prerequisitos:** Node 22 · npm.

```bash
git clone https://github.com/Coste-AR/CosteAR-admin.git
cd CosteAR-admin

npm install              # instala dependencias y los git hooks (husky)
cp .env.example .env     # completar

npm run dev
```

### Comandos

```bash
npm run dev          # dev server con HMR
npm run typecheck    # tsc --noEmit
npm run build        # tsc -b && vite build
npm test             # vitest run (todavía no hay tests)
npm run skills:sync  # propaga las skills de este repo a backend y frontend
```

> ⚠️ **Este repo todavía no tiene ESLint instalado ni un solo test.** Por eso `npm run lint` solo
> imprime un aviso y el CI corre `typecheck` + `build`. Está pendiente configurarlo: cuando se
> haga, hay que actualizar el CI, el `package.json` y la regla CMD-02 de `CLAUDE.md`.

### Git hooks

Se instalan solos con `npm install`.

- **`pre-commit`** — `typecheck` del proyecto (sin lint-staged, porque no hay ESLint todavía)
- **`commit-msg`** — valida el mensaje con `commitlint`

**Nunca uses `--no-verify`.**

---

## El flujo de trabajo

```
issue → rama desde dev → commits atómicos → PR a dev → review → merge → bitácora
```

Igual que en los otros repos:

- Las ramas salen de **`dev`**, se llaman `<tipo>/<slug-corto>` (solo `a-z0-9-`, máx. 40 chars)
- Commits `<tipo>(<scope>): <descripción en imperativo>`, uno por cambio lógico.
  Scopes de este repo: `admin`, `bitacora`, `ui`, `router`, `ci`, `skills`
- El PR apunta a `dev` con la plantilla llena
- Promoción `feature → dev → staging → main`, sin saltear pasos

Atajos: `/costear-commit` · `/costear-pr` · `/costear-review` · `/costear-adr` · `/costear-bitacora`.

---

## Mantener la bitácora

**No se escribe a mano.** Al cerrar una sesión de trabajo en cualquier repo, se corre
`/costear-bitacora`: lee el `git log` y los PRs reales, redacta la entrada y actualiza el índice.

Las reglas completas están en [`bitacora/README.md`](./bitacora/README.md). Las tres que más
importan:

1. **Se escribe para quien no programa.** Alan y Lauti tienen que poder leerla.
2. **Toda entrada linkea a PRs y ADRs reales.** Sin links no sirve como trazabilidad.
3. **Nunca se edita una entrada vieja para corregir la historia.** Si algo cambió, es una
   entrada nueva que referencia a la anterior.

Y una que no se negocia: **nada de credenciales, tokens ni datos del cliente**, aunque el repo
sea privado.

---

## Mantener las skills

La **copia canónica** de las skills del equipo vive en `.claude/skills/` de este repo.

```bash
# Editar la skill acá, y después:
npm run skills:sync
```

Eso las copia a `CosteAR-backend` y `CosteAR-frontend`. Después hay que **commitear en cada
repo**: las skills se distribuyen por git, así le aparecen a todo el equipo con un `git pull`
sin instalar nada.

> **Nunca edites las copias de backend o frontend a mano** — el próximo sync las pisa.

Si el script no encuentra un repo, decile dónde está (se guarda por máquina, no se commitea):

```bash
git config costear.backendPath "<ruta absoluta>"
git config costear.frontendPath "<ruta absoluta>"
```

---

## Decisiones técnicas

Van a un **ADR** en [`docs/adr/`](./docs/adr/README.md), creado con `/costear-adr`.

Las decisiones **de proceso del equipo** (cómo trabajamos) van a
[`DEFINITION-OF-DONE.md`](./DEFINITION-OF-DONE.md) o a un ADR de este repo, y se acuerdan en retro.

> `DECISIONES.md` en la raíz es **registro histórico cerrado**. No se le agrega nada nuevo.

---

## Tu primer aporte

1. Cloná el repo y completá el setup.
2. **Leé [`CLAUDE.md`](./CLAUDE.md) y [`bitacora/README.md`](./bitacora/README.md).**
3. Tomá un issue del tablero.
4. Rama desde `dev` → commits atómicos → `/costear-pr`.
5. Post-merge: borrá la rama local y corré `/costear-bitacora`.

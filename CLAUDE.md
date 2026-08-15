# CosteAR — Admin · reglas del repo

> Este archivo lo lee Claude Code automáticamente al arrancar cada sesión en este repo.
> Es el criterio con el que se juzga si una decisión es correcta.
>
> **Estas reglas tienen prioridad sobre lo que diga un issue.**
>
> Formato: cada regla tiene **ID** y **fuente/fecha**. Las marcadas `⛔ SUPERADA` ya no aplican; quedan para trazabilidad.

---

## 0. Reglas de oro

1. **Ante la duda, frená y preguntá.**
2. **Verificá antes de afirmar.**
3. **No amplíes el scope de lo pedido.** Si el trabajo crece, avisá antes.
4. **Nada irreversible sin OK explícito:** `push`, PRs, merges.
5. **Los issues son referencia, no especificación.**
6. **Nunca `--no-verify`.**

---

## 1. Qué es este repo — tiene DOS funciones

**(a) El panel de administración interno** de CosteAR (React + Vite, mismo stack que el frontend).

**(b) La bitácora del desarrollo de todo el proyecto** — `bitacora/`. Acá se registra qué se
hizo, cuándo y por qué, cruzando los 3 repos de código. **Es la memoria del equipo frente al
cliente.** Se escribe con la skill `/costear-bitacora`.

> ⚠️ Este repo es **privado**, y el plan Free de GitHub no permite proteger ramas en repos
> privados. Acá las reglas de rama **no están forzadas por la herramienta: son un acuerdo del
> equipo.** Cumplirlas igual.

| Repo | Qué es | Visibilidad |
|---|---|---|
| `Coste-AR/CosteAR-backend` | API | pública |
| `Coste-AR/CosteAR-frontend` | SPA del producto | pública |
| `Coste-AR/CosteAR-admin` | Este repo | privada |
| `Coste-AR/costear-knowledge-base` | Bóveda que alimenta el RAG | privada |

---

## 2. Stack y comandos reales

React 19 + TypeScript strict · Vite · TanStack Router + Query · Tailwind v4 · Vitest · **npm**.

```bash
npm run dev          # vite
npm run typecheck    # tsc --noEmit
npm run build        # tsc -b && vite build
npm test             # vitest run
npm run skills:sync  # propaga las skills de este repo a backend y frontend
```

|ID|Regla|Fuente|
|---|---|---|
|**CMD-01**|**`npm` siempre.**|Equipo|
|**CMD-02**|⚠️ **Este repo todavía no tiene ESLint ni un solo test.** Por eso su CI corre solo `typecheck` + `build`. Si agregás tests o eslint, actualizá `.github/workflows/ci.yml` y este archivo.|Santiago, 15-08-2026|

---

## 3. Ramas, commits y PRs

```
feature-branch → dev → staging → main
```

|ID|Regla|
|---|---|
|**GIT-01**|**No push directo a `main`, `staging` ni `dev`** — acá es acuerdo, no está forzado. Todo por PR igual.|
|**GIT-02**|Las ramas salen de **`dev`**.|
|**GIT-03**|Nombre: `<tipo>/<slug-corto>` — solo `a-z0-9-`, máximo 40 caracteres.|
|**GIT-04**|`main` solo desde `staging`; `staging` solo desde `dev`.|

Commits: `<tipo>(<scope>): <descripción en imperativo>`. Scopes típicos: `admin`, `bitacora`,
`ui`, `router`, `ci`, `skills`. Un commit = un cambio lógico. Lo valida `commitlint`.

---

## 4. La bitácora — cómo se mantiene

```
bitacora/
├── README.md      ← cómo funciona (y las 10 reglas de oro del equipo)
├── INDICE.md      ← tabla maestra, una fila por entrada, más reciente arriba
└── sesiones/
    └── YYYY-MM-DD-<repo>-<slug>.md
```

|ID|Regla|
|---|---|
|**BIT-01**|**Una entrada por sesión de trabajo.** La escribe `/costear-bitacora`, no se hace a mano.|
|**BIT-02**|**Se escribe para Alan y Lauti, que no son devs.** Nada de jerga sin explicar. Si hace falta un término técnico, se aclara entre paréntesis.|
|**BIT-03**|**Toda entrada linkea a los PRs y ADRs reales.** Una entrada sin links no sirve como trazabilidad.|
|**BIT-04**|**Nunca se edita una entrada vieja para "corregir la historia".** Si algo cambió, es una entrada nueva que referencia a la anterior.|
|**BIT-05**|El `INDICE.md` se actualiza en el mismo commit que la entrada.|
|**BIT-06**|**Nada de credenciales, tokens ni datos del cliente en la bitácora.** Aunque el repo sea privado.|

---

## 4 bis. Issues — cómo entra el trabajo

|ID|Regla|
|---|---|
|**ISS-01**|**Todo trabajo pendiente entra como issue de GitHub**, en el repo donde vive el código. Se crea con `/costear-issue`.|
|**ISS-02**|**Los issues los cargan Alan y Lauti** (auditan el producto y detectan lo que falta). Los devs también pueden, pero la prioridad la pone quien reporta: es una decisión de negocio, no técnica.|
|**ISS-03**|Toda issue lleva `type:`, `priority:` y `area:`. Las etiquetas existen en los 3 repos desde el 15-08-2026.|
|**ISS-04**|**El issue nace sin asignar.** Los devs lo toman según su carga; quien reporta no reparte trabajo.|
|**ISS-05**|Un issue = una cosa entregable. Una auditoría con 8 hallazgos son 8 issues, no uno con 8 bullets.|
|**ISS-06**|Los issues se cierran desde el PR que los resuelve (`Closes #N`), nunca a mano.|

---

## 5. Decisiones

|ID|Regla|
|---|---|
|**DOC-01**|Toda decisión técnica no obvia va a un ADR: `docs/adr/NNNN-slug.md`, con `/costear-adr`.|
|**DOC-02**|`DECISIONES.md` es **registro histórico** de Trazabilidad Total v1. No agregar nada nuevo ahí.|
|**DOC-03**|Las decisiones **de proceso del equipo** (cómo trabajamos) van a `DEFINITION-OF-DONE.md` o a un ADR de este repo, y se acuerdan en retro.|

---

## 6. Guardarraíles

|ID|Antipatrón|Qué hacer en su lugar|
|---|---|---|
|**GR-01**|Atribuir decisiones que el usuario no tomó|Verificá que las haya decidido él|
|**GR-02**|Bundlear scope de más|Avisá antes de crecer el plan|
|**GR-03**|Afirmar sin verificar|Mirá el diff crudo|
|**GR-04**|Confirmar tu propio resumen del repo|Contrastá con `git log origin/dev`|
|**GR-05**|Razonar hacia el permiso|**La ausencia de evidencia no es evidencia de permiso**|
|**GR-06**|Resolver una ambigüedad en silencio|Marcala como pregunta abierta|
|**GR-07**|Escribir la bitácora "de memoria"|Leé el `git log` y los PRs reales antes de redactar|

---

## 7. Registro de cambios de este archivo

|Fecha|Qué cambió|Fuente|
|---|---|---|
|2026-08-15|Creación, junto con el sistema de bitácora y las skills del equipo.|Santiago|

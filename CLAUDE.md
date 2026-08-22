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

## 0.bis La filosofía: diagnosticar, planificar, recién ahí implementar

> **Esta es la forma de trabajar, no una recomendación.** Vale para código, para infraestructura,
> para procesos y para cualquier problema que aparezca. Se escribió el 22-08-2026, después de que
> aplicarla encontrara en una tarde la causa de tres días de re-trabajo.

**Los tres pasos, en orden, siempre:**

| Paso | Qué significa | Qué NO es |
|---|---|---|
| **1. Diagnosticar** | Medir qué está pasando, con números y comandos reproducibles. Descartar primero lo que **no** es el problema. | No es opinar, ni suponer, ni empezar a arreglar lo primero que se ve |
| **2. Planificar** | Escribir el plan **antes** de ejecutarlo: fases independientes, con su costo y lo que cierra cada una. Y las **alternativas descartadas, con el motivo**. | No es una lista de tareas: si no dice por qué se eligió eso y no otra cosa, no es un plan |
| **3. Implementar** | Recién acá se toca algo. Y se verifica **en el entorno donde el trabajo va a vivir**, no donde uno está parado. | No es "empiezo y veo" |

**Por qué importa, con el caso que lo probó:** el 20 y 21-08 se arreglaron cinco defectos del motor
de costeo, y en el medio se perdieron horas en re-trabajo. La reacción natural era escribir otra
regla. En vez de eso se midió: **de 24 PRs en tres días, 4 no agregaron nada** — existían solo para
recuperar trabajo ya hecho. Con ese número, la causa apareció sola, y resultó ser **cuatro casillas
de configuración apagadas**, no una falta de disciplina.

**Sin el diagnóstico, se habría arreglado el problema equivocado.**

### Las tres trampas que este orden evita

1. **Arreglar el síntoma.** Los tres primeros incidentes parecían culpa de los PRs apilados. El
   cuarto fue un PR simple: el apilamiento agravaba, no causaba. Prohibir los apilados habría
   costado trabajo y no habría arreglado nada.
2. **Escribir una regla en vez de un control.** REV-08 se escribió el 18-08 por un accidente
   concreto y volvió a pasar tres veces en tres días. **Una regla que hay que recordar en el momento
   exacto no es un control: es una intención.** Si algo tiene que pasar siempre, se automatiza o se
   configura; escribirlo es el último recurso, no el primero.
3. **Verificar donde uno está parado.** Un test que pasaba en la máquina del dev no cargaba en el
   CI. Un instructivo escrito en sintaxis de bash para alguien que usa PowerShell. **Verificar es
   verificar allá, no acá.**

### Cómo se aplica en el día a día

- **Antes de escribir código para un problema nuevo:** medir primero. Un comando que devuelva un
  número vale más que un párrafo de análisis.
- **Todo diagnóstico y todo plan quedan escritos** en el documento consolidado de `CosteAR-admin`
  (`docs/`), no en un `.md` nuevo. Con las alternativas descartadas.
- **Lo que salió mal se escribe igual**, y con el mismo detalle que lo que salió bien: es de donde
  sale el diagnóstico siguiente.
- **Al terminar, se anota en la bitácora** (`/costear-bitacora`), en castellano llano.

> Si el trabajo empieza por el paso 3, en algún momento se vuelve al 1 — pero habiendo gastado el
> tiempo dos veces.

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
|**PR-04**|**Todo PR nace en DRAFT.** GitHub **impide mergear un borrador**: mientras el trabajo crece, nadie lo mergea por error. Se marca `gh pr ready` cuando está listo de verdad — y se dice **«terminé de pushear»**. Entre el 20 y el 22-08 se perdieron 4 PRs de trabajo por mergear PRs que todavía estaban creciendo; en un caso, 12 minutos antes del commit que faltaba.|
|**PR-05**|⚠️ **Este repo no soporta auto-merge**: es privado y el plan Free no lo incluye — la misma limitación que impide protegerle las ramas. En backend y frontend se usa `gh pr merge --auto --squash`; acá el merge es a mano, **con el CI ya en verde**.|
|**PR-06**|**Después de mergear, verificar que el trabajo LLEGÓ** (`git log origin/dev`), no que el PR figura en verde. Un PR apilado mergeado contra su rama de abajo aparece como `MERGED` y el trabajo no llega. Pasó 3 veces entre el 20 y el 21-08.|

Commits: `<tipo>(<scope>): <descripción en imperativo>`. Scopes típicos: `admin`, `bitacora`,
`ui`, `router`, `ci`, `skills`. Un commit = un cambio lógico. Lo valida `commitlint`.

---

## 4. La bitácora — cómo se mantiene

**BIT-01 a BIT-06** — una entrada por sesión, escrita para no-devs, siempre linkeada a PRs/ADRs
reales, nunca editada para "corregir la historia", el índice actualizado en el mismo commit, y
nada de credenciales ni datos del cliente ahí. **Viven en `.claude/rules/bitacora.md`**: cargan
solo al tocar `bitacora/`.

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

---

## 6.bis Cómo trabajamos juntos — el protocolo de revisión

> Esta sección va dirigida a **los dos lados**: a quien implementa y a quien revisa.
> La mitad de las reglas son obligaciones de quien escribe el código; la otra mitad, de quien lo aprueba.
>
> **Existe porque el 18-08-2026 pasaron todas las cosas que están abajo, el mismo día.**

### Lo que tiene que hacer quien implementa

|ID|Regla|Por qué|
|---|---|---|
|**REV-01**|**"Verificado" no se dice solo: se dice CÓMO.** Toda afirmación de que algo funciona viene con el comando que se corrió y su resultado.|Se dijo "verificado contra base limpia" sin haberlo hecho. El bug de orden de las migraciones lo encontró el CI, no una persona.|
|**REV-02**|**No afirmar sobre el estado del repo sin mirarlo.** Ni "está mergeado", ni "eso ya existe", ni "no hace falta tocarlo".|`anomaly-detection.ts` figuraba como huérfano, y además había una versión peor corriendo en su lugar. Nadie lo había mirado.|
|**REV-03**|**Separar lo que se decidió de lo que se sabe.** Un valor elegido para poder avanzar se marca como tal y **nunca** se presenta como dato del cliente.|La vida útil del lote son 2 años porque lo decidimos nosotros, no porque nos lo haya dicho el productor.|
|**REV-04**|**Avisarle a quien le cambió el terreno.** Si un cambio afecta la tarea de otro, se le dice: en el PR, en el issue o por fuera.|Giuli no sabía que su G-01 ya estaba en `dev`. Se descubrió de casualidad.|

### Lo que tiene que hacer quien revisa

|ID|Regla|Por qué|
|---|---|---|
|**REV-05**|**Leer los ADR, no el código.** `docs/adr/` es el lugar pensado para revisar sin ser programador: ahí está la decisión, las alternativas descartadas y el costo de cada una. **Discutirlos es la forma de revisar.**|Un PR de 800 líneas no se revisa. Un ADR de una página, sí.|
|**REV-06**|**Cuando alguien diga "verificado", preguntar cómo.** Es una pregunta de diez segundos y caza la mayoría de los errores.|Esa pregunta habría encontrado el bug de las migraciones antes que el CI.|
|**REV-07**|**No mergear el mismo día que se abre el PR.** Mínimo 24 horas, salvo que haya algo roto en producción.|La mitad de los problemas del 18-08 salieron de mergear rápido y en cadena.|
|**REV-08**|**Los PRs apilados se mergean en orden, de abajo hacia arriba.** Y después se verifica que el trabajo llegó a `dev`, no solo que el PR figura como *merged*.|Dos PRs se mergearon contra su rama base. GitHub los marcó en verde y el trabajo quedó en ramas que ya nadie miraba.|

### Sobre el conocimiento

**El conocimiento no se va con quien lo escribió: se queda escrito.** Los ADR, la bitácora de `CosteAR-admin`, los tests con nombres en castellano y las reglas de este archivo existen exactamente para eso: para que no dependan de una persona ni de su memoria.

Pero escribirlo no alcanza.

> **Lo que falta siempre es que alguien más lo lea.**

Por eso `/costear-bitacora` al cerrar una sesión (DOC-03) y el ADR en el mismo PR que lo implementa (DOC-01) no son burocracia: son el único mecanismo que tenemos para que el equipo sepa lo que el equipo ya sabe.

## 7. Registro de cambios de este archivo

|Fecha|Qué cambió|Fuente|
|---|---|---|
|2026-08-22|**Pieza 1 — BIT-01..06 se mudan a `.claude/rules/bitacora.md`**, scoped a `bitacora/**`. Antes cargaban en todas las sesiones; ahora solo al tocar la bitácora.|Santiago|
|2026-08-22|**PR-04/05/06**: el PR nace en draft, se mergea con `--auto`, y después se verifica que el trabajo llegó. Reemplazan por mecanismo lo que REV-08 pedía recordar. La skill `/costear-pr` ya crea los PRs en borrador.|Santiago|
|2026-08-22|**Sección 0.bis — la filosofía: diagnosticar, planificar, recién ahí implementar.** Se escribió después de que aplicarla encontrara, en una tarde, la causa de tres días de re-trabajo: cuatro casillas de configuración apagadas, no falta de disciplina. Incluye las tres trampas que el orden evita.|Santiago|
|2026-08-18|Secciones **5.bis** (datos de clientes en repos públicos, CLI-01 a CLI-04) y **6.bis** (protocolo de revisión, REV-01 a REV-08). Las dos salen de cosas que pasaron ese día: se publicó la estructura de costos de un betatester en un repo público, y ocho PRs se mergearon el mismo día que se abrieron.|Santiago|
|2026-08-15|Creación, junto con el sistema de bitácora y las skills del equipo.|Santiago|

---

## 5.bis Datos de clientes en repositorios públicos

`CosteAR-backend` y `CosteAR-frontend` son **públicos**. `CosteAR-admin` es privado.

|ID|Regla|
|---|---|
|**CLI-01**|**Los datos de un cliente no entran a un repositorio público.** Ni su nombre, ni su localidad, ni sus números reales — no en tests, no en seeds, no en comentarios, no en ejemplos, no en cuerpos de PR ni en mensajes de commit.|
|**CLI-02**|Un fixture que necesita números realistas usa **datos ficticios** que ejerciten la misma matemática. El caso real, si hace falta conservarlo, va a `CosteAR-admin` (privado).|
|**CLI-03**|Antes de abrir un PR que toque un vertical de un cliente: `git grep -in "<nombre del cliente>"`. Si devuelve algo, no se abre.|
|**CLI-04**|Esto incluye la estructura económica: costo unitario, punto de equilibrio, precio de venta, márgenes y escala. **Que un competidor pueda leer el margen de un productor es un problema para él, no para nosotros.**|

> **Ya pasó** (18-08-2026): se subió la estructura de costos completa de un cliente, con su nombre
> al lado, a un repositorio público. Se anonimizó, pero **el historial de git es permanente**.
> Lo barato es no escribirlo; una vez publicado, ya no hay vuelta atrás completa.

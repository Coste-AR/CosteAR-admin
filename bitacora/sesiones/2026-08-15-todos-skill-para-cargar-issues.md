# 2026-08-15 — Alan y Lauti ya pueden cargar el trabajo pendiente como issues

- **Repo(s):** los 3
- **Rama:** `feat/skill-crear-issues` (admin) · `chore/skill-crear-issues` (backend y frontend)
- **PRs:** pendientes de abrir
- **ADRs:** —
- **Estado:** en progreso

## Qué se hizo

- Se armó **`/costear-issue`**, una herramienta para que Alan y Lauti conviertan lo que
  encuentran auditando el producto en un **issue de GitHub** (una tarjeta de trabajo pendiente,
  numerada, que los devs toman y cierran). No hace falta saber programar: la herramienta hace las
  preguntas que faltan, elige sola en qué repositorio va, revisa que no esté cargado ya, y recién
  ahí lo crea.
- Antes de crear cualquier issue, **muestra el borrador y espera el visto bueno.** Nunca inventa
  un dato que no le dieron: lo que no se sabe queda escrito como "no sé", que también le sirve al
  dev.
- Se crearon las **etiquetas** que faltaban en los tres repositorios: tipo (bug, funcionalidad,
  investigación), prioridad (alta, media, baja) y área (costeo, trazabilidad, interfaz, etc.).
  Las plantillas de issue ya las nombraban desde agosto, **pero no existían**: GitHub las
  ignoraba en silencio y ningún issue quedaba clasificado.
- Se escribió en las reglas del equipo cómo entra el trabajo de ahora en adelante: todo pendiente
  es un issue, **la prioridad la pone quien reporta** (es una decisión de negocio, no técnica), y
  el issue **nace sin dueño** para que cada dev tome según su carga.

## Por qué

Hasta hoy lo pendiente circulaba por WhatsApp y por charlas: se perdía, se repetía, y nadie sabía
qué había quedado sin hacer. Alan y Lauti son los que auditan el producto y detectan lo que falta,
pero cargar un issue bien escrito exige un formato que no tienen por qué conocer. Esta herramienta
pone ese formato del lado nuestro y deja del lado de ellos lo único que solo ellos saben: qué está
mal, a quién le pasa y cuánto urge.

## Decisiones que se tomaron sobre la marcha

- **El issue se crea sin asignar.** Quien reporta no reparte trabajo: no tiene forma de saber la
  carga de cada dev. Si algo es urgente de verdad, va con prioridad alta **y** se avisa por fuera
  — una etiqueta no despierta a nadie.
- **La prioridad la pone quien reporta, no el dev.** Si un dev cree que está mal calibrada, se
  discute escrito en el issue; no se cambia en silencio.
- **Ante la duda de en qué repositorio va, se elige el backend** y se aclara en el issue. Es más
  barato mover un issue que abrir dos por lo mismo.
- **Un hallazgo = un issue.** Una auditoría con ocho puntos son ocho issues chicos, no uno con
  ocho ítems: ese nunca se termina de cerrar.

## Qué quedó pendiente

- **Abrir los tres PRs** (uno por repositorio) y mergearlos. Hasta que eso pase, la herramienta
  no le aparece a nadie más que a quien la escribió.
- **Alan y Lauti tienen que tener `gh` instalado y con su propia cuenta iniciada** en sus
  máquinas. El issue queda a nombre de quien lo crea, y eso importa: es a quien el dev le va a
  volver a preguntar.
- Los issues viejos que ya estén cargados **no tienen las etiquetas nuevas.** Hoy no hay ninguno
  abierto en backend ni en frontend, así que no hay nada que migrar.

## Cómo verificarlo

1. Bajar la rama y abrir Claude Code en cualquiera de los tres repositorios.
2. Escribir `/costear-issue` y contar un problema cualquiera. Tiene que hacer preguntas antes de
   escribir nada, y mostrar un borrador antes de crear.
3. En GitHub, entrar a cualquiera de los tres repositorios → pestaña **Issues** → **Labels**:
   tienen que estar las etiquetas `type:`, `priority:` y `area:`.

## Riesgos abiertos

- **Los repositorios de backend y frontend son públicos.** Todo lo que se escriba en un issue lo
  puede leer cualquiera. La herramienta avisa de no pegar datos del cliente ni contraseñas, pero
  el aviso no es un candado: depende de quien escribe.
- Una lista de issues llena de ruido termina ignorada. Si empiezan a entrar issues gigantes o
  repetidos, conviene revisar el criterio entre todos antes de que la lista pierda valor.

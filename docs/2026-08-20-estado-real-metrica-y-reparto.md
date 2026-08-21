# CosteAR — Estado real, métrica y reparto de trabajo

> **Documento único.** Consolida la auditoría de Julie (19-08), los hallazgos de job-order costing de Lautaro (20-08), el plan de implementación de la bóveda de conocimiento, las decisiones tomadas en las reuniones del equipo, y la verificación de todo eso contra el código real de los cuatro repos.
>
> Fecha: 20-08-2026. **A partir de acá, este es el lugar. Lo que aparezca se agrega acá o se convierte en issue — no se abre otro .md.**
>
> **Destino:** repo privado `CosteAR-admin`, `docs/`. Nombra al cliente y contiene números del negocio: no va a los repos públicos (ver §6.1).

---

## Índice

1. [Veredicto](#1-veredicto)
2. [Métrica — dónde estamos parados](#2-métrica--dónde-estamos-parados)
3. [Lo que dicen las reuniones y la bóveda](#3-lo-que-dicen-las-reuniones-y-la-bóveda)
4. [Auditoría de Julie — hallazgo por hallazgo](#4-auditoría-de-julie--hallazgo-por-hallazgo)
5. [Hallazgos de Lautaro — job-order costing](#5-hallazgos-de-lautaro--job-order-costing)
6. [Lo que ninguna auditoría vio](#6-lo-que-ninguna-auditoría-vio)
7. [Reparto de trabajo](#7-reparto-de-trabajo)
8. [Qué hay que cerrar antes de repartir](#8-qué-hay-que-cerrar-antes-de-repartir)
9. [Bitácora de ejecución](#9-bitácora-de-ejecución)

---

## 1. Veredicto

Tres fuentes, tres alcances, tres calidades distintas:

| Fuente | Alcance | Hallazgos | Acierto verificado |
|---|---|---|---|
| **Julie** (19-08) | Estructura, robustez, UX, deuda técnica | 37 | **~57 %** — auditó `staging` congelado sin cruzar issues, PRs ni ramas |
| **Lautaro** (20-08) | Motor de job-order costing, 3 ejemplos numéricos | 4 | **100 %** — 4 de 4, con archivo, línea y magnitud |
| **Este documento** | Las dos anteriores + bóveda + reuniones + repos | — | 1 error propio, corregido en §4.5 |

**La lección de método está en el contraste.** Lautaro auditó menos superficie y acertó todo porque midió cada cosa que afirmó. Julie afirmó sin medir en cinco lugares, y en uno de ellos —un hallazgo de seguridad— escribió literalmente "verificar" y no verificó.

**Lo que esto significa en plata:** con el roadmap de Julie tal cual, el Sprint 1 arranca reimplementando algo que ya está hecho (B-01, esfuerzo XL) y el Sprint 2 arranca integrando Sentry, que ya está integrado. Dos semanas de trabajo duplicado.

**Y en el otro sentido:** hoy hay **siete defectos abiertos que mueven números de plata**, ninguno de los cuales estaba en la auditoría de Julie.

---

## 2. Métrica — dónde estamos parados

### 2.1 Por qué no hay un solo número

Un número compuesto único (tipo "estamos al 73 %") es una mentira cómoda: mezcla capacidad construida con defectos abiertos y con trabajo promovido, que son tres cosas que se mueven en direcciones distintas. Lo que sigue es **un indicador principal y cinco de apoyo**, cada uno con su comando para recalcularlo. Se recalculan al cierre de cada sprint y se pegan acá con fecha.

El principal mide **la promesa del producto**. Los de apoyo miden si el equipo está en condiciones de sostenerla.

---

### 2.2 🎯 Indicador principal — Cobertura de Doctrina (CD)

> De los casos numéricos de la cátedra que el plan declara obligatorios, **¿cuántos tienen un fixture que los reproduce al centavo y que se puede identificar como tal?**

Esta es la métrica principal porque es la única promesa que hace CosteAR: *replicar la metodología de la cátedra al 100 %, con cero tolerancia a error de cálculo*. Todo lo demás —UX, infra, tests de componentes— es medio, no fin.

**Denominador** (plan de la bóveda, §9): 9 casos nominales de cátedra — FX-P1..P6 (Procesos) y FX-J1..J3 (conjuntos) — más los 6 de regresión de Órdenes (FX-O1..O6).

**Estado al 20-08-2026:**

| Caso | Fuente | Fixture nombrado en tests |
|---|---|---|
| FX-P1 · Azur Alcoholes, abril | Clases 21-22 | ✅ `process-costing.test.ts:142, 322, 473` — caso ancla explícito |
| FX-P2 · Azur, mayo (arrastre) | Clase 22 | 🟡 `process-wip-carry.test.ts` existe, sin nombrar el caso |
| FX-P3 · CCEDA SA, 3 deptos | Clase 23 | ❌ cero apariciones |
| FX-P4 · ARSA, pérdidas + aumento | Clase 27 | ❌ cero apariciones |
| FX-P5 · Embotellado de vino | Clase 28 | 🟡 aparece nombrado, sin anclar valores de la clase |
| FX-P6 · Mermelada, Nina SSL | Clase 30 | 🟡 aparece nombrado, sin anclar valores de la clase |
| FX-J1 · 4 métodos, mismo dataset | Clase 24 | ✅ `joint-costs.test.ts:17,36,56,82,105` — los 4 métodos anclados con valores exactos |
| FX-J2 · Cacao (un método da pérdida) | Clase 27 | ❌ cero apariciones |
| FX-J3 · Betton y Toner (VNR) | Clase 30 | ❌ cero apariciones |
| FX-O1..O6 · Órdenes (Premoldeado, Pilcha, Piedras, Chapuzón, Yosemite) | Clases 19,20,26,29,30 | ❌ los fixtures **existen** (`fx3-dorado`, `r5-fixtures`, `allocation-*`) pero **ninguno nombra su caso de cátedra** |

```
CD verificable = 2 anclados / 9 casos de Procesos y conjuntos = 22 %
CD optimista   = 5 con algo / 9                                = 56 %
```

**El hallazgo no es el 22 %. Es que no podemos dar el número.** Hay **158 casos de test de Procesos y conjuntos en verde** — el motor está mucho mejor de lo que dice el 22 %. Pero como los tests no citan la clase que anclan, **nadie puede afirmar cuánta cátedra está cubierta sin releer los 158 a mano.**

Y eso viola una regla dura que el equipo ya escribió (plan §11.8: *"documentar cada decisión citando la sección de este plan o la clase de la cátedra que la respalda"*).

**Arreglo, y es barato:** que cada test que ancle un caso de cátedra lleve el ID en el `describe` — `FX-P3 · CCEDA SA (Clase 23)`. Un rato de trabajo, y a partir de ahí **la métrica se calcula sola**:

```bash
git grep -ohE "FX-(P[1-6]|J[1-3]|O[1-6])" origin/staging -- tests | sort -u | wc -l
```

Esa es **la primera tarea de la próxima tanda**: sin ella, todas las métricas que siguen son de actividad, no de producto.

---

### 2.3 Indicadores de apoyo

#### 📊 A1 — Índice de Trabajo Neto (ITN)

> De todo lo que commiteamos, ¿cuánto **agrega capacidad** y cuánto **repara lo que rompimos nosotros**?

**Estado al 20-08 (últimas 8 semanas en `staging`):**

| Tipo | Commits |
|---|---|
| `feat` | **143** |
| `fix` | **108** |
| `docs` | 32 |
| `chore` | 22 |
| `test` | 11 |
| `refactor` + `style` | 2 |

```
ITN = feat / (feat + fix) = 143 / 251 = 57 %
```

**Traducción: de cada 10 unidades de trabajo, 5,7 agregan producto y 4,3 reparan lo propio.**

| Rango | Lectura |
|---|---|
| **> 75 %** | Sano: el equipo construye |
| **60-75 %** | Normal en producto joven |
| **< 60 %** | Modo reparación: se paga deuda más rápido de lo que se crea valor ← **estamos acá** |

Y hay una señal peor adentro: **11 commits de `test` contra 251 de `feat`+`fix`**. Se escribe 23 veces más código que verificación. El ITN de 57 % es consecuencia directa de eso, no una casualidad.

#### 📊 A2 — Tasa de Defecto en Números (TDN)

> ¿Cuántos defectos abiertos **cambian un número de plata** que el cliente ve o usa para poner precio?

Para un producto de costeo el único objetivo aceptable es **cero**. No es un ideal: es la promesa comercial.

**Estado al 20-08: 7 defectos abiertos.**

| ID | Qué mueve | Prioridad |
|---|---|---|
| **#89** | El costo unitario de producción ignora la producción en proceso — *el número con el que se pone precio* | alta |
| **L1** | El costo entero de un centro de servicio desaparece en la pasada directa (−1,46 % en D01, escala con el tamaño del centro) | alta |
| **#88** | CPV unitario dividido por producidas en vez de vendidas | media |
| **#90** | El estado de costos omite trabajos de terceros y variación presupuesto | media |
| **L3** | El motor no puede contabilizar desperdicio (regla R5, Clase 4) | media |
| **L2** | `allocationMode: "direct"` reescribe importes declarados | baja |
| **L4** | El control de variaciones ppto/volumen no corre | baja |

**Ninguno de los siete estaba en la auditoría de Julie.**

#### 📊 A3 — Latencia de Promoción (LP)

> ¿Cuánto tarda el trabajo terminado en llegar a producción?

**Estado al 20-08 — el número más grave del documento:**

| Repo | `main` está atrás de `staging` por | Último commit en `main` |
|---|---|---|
| CosteAR-backend | **397 commits** | `26635b2` — **12 de julio** |
| CosteAR-frontend | **175 commits** | `1d042b9` — **10 de julio** |

**`main` no recibe nada hace 39 días.** Todo lo construido desde entonces —el motor de procesos entero, los costos conjuntos, la trazabilidad en pantalla, las reglas de alerta— está en `staging` y no llegó a producción.

Esto explica por qué los issues #88/#89/#90 dicen textualmente *"falta confirmar qué SHA corre cada ambiente"*: con 397 commits de distancia y sin runbook (P-01), **nadie del equipo puede afirmar qué código está sirviendo hoy al cliente.**

Y hay una capa más: el PR #86 (`dev → staging`) también está abierto. **Tres niveles de trabajo estancado en fila.**

#### 📊 A4 — Deuda de Verificación (DV)

> De los hallazgos que tenemos, ¿cuántos verificó alguien que no fue quien los escribió?

- 4 issues en `status:needs-verification` (#78, #79, #44, #45) — arreglados en staging, **cero reverificados**
- 7 defectos de números abiertos (A2) — **cero verificados de forma independiente**
- 5 hallazgos de Julie que resultaron falsos — **detectados recién ahora, 1 día después**

```
DV = hallazgos abiertos sin verificación independiente = 11 / 11 = 100 %
```

La deuda de verificación es lo que produjo los 5 falsos de Julie y el error mío de §4.5. **Es la causa raíz compartida de los tres documentos de auditoría.**

#### 📊 A5 — Ritmo (contexto, no objetivo)

| Semana | W26 | W27 | W28 | W29 | **W30** | **W31** | W32 | W33 | W34 |
|---|---|---|---|---|---|---|---|---|---|
| Commits | 9 | 17 | 52 | 46 | **106** | **101** | 44 | 43 | 29 |

**Caída del 73 % desde el pico.** No es necesariamente malo —el pico coincide con la construcción del motor de procesos— pero junto al ITN la lectura cambia: **menos volumen y peor mezcla al mismo tiempo** es la firma de un equipo que empieza a ahogarse en su propia deuda.

---

### 2.4 Tablero — copiar y pegar al cierre de cada sprint

| Indicador | Hoy (20-08-2026) | Objetivo próximo sprint | Umbral rojo |
|---|---|---|---|
| 🎯 **CD** — Cobertura de Doctrina | **22 % verificable** (real: indeterminado) | **Medible**: todo test de cátedra citando su clase | No poder calcularlo |
| **A1** — ITN (feat / feat+fix) | **57 %** | ≥ 65 % | < 60 % |
| **A2** — TDN (defectos en números) | **7** | **≤ 2** (cerrar #89 y L1 sí o sí) | > 0 con cliente activo |
| **A3** — LP (main atrás de staging) | **397 / 175 commits · 39 días** | Una promoción a `main` con runbook | > 30 días |
| **A4** — DV (sin verificar) | **100 %** (11 de 11) | ≤ 30 % | > 50 % |
| **A5** — Ritmo | 29 comm/sem (−73 % del pico) | contexto, sin objetivo | — |

**El tablero de hoy en una frase:** *construimos mucho y bien, no lo verificamos, no lo promovemos, y empezamos a gastar casi la mitad del esfuerzo arreglando lo propio.*

---

## 3. Lo que dicen las reuniones y la bóveda

### 3.1 El plan de la bóveda está prácticamente ejecutado, y nadie lo declaró cerrado

El `Plan-Implementacion-Costeo-Ordenes-y-Procesos.md` (v1.0, 18-07) definía **8 fases** para construir Costeo por Procesos, que al escribirlo estaba en **0 %** — *"solo un selector de UI inerte"*.

Medí las 8 fases contra `origin/staging`:

| Fase | Qué pedía | Estado real |
|---|---|---|
| **1** — `costingSystem` + interfaz `CostingEngine` | Persistir el campo, extraer motores | ✅ **Hecho.** `cost-structure-service.ts:216` persiste; `:238-273` permite cambiarlo con auditoría |
| **2** — Modelo de datos | 4 tablas nuevas | ✅ **Hecho.** `ProcessDepartment:1552`, `UnitMovementSchedule:1622`, `JointCostAllocation:1784`, `ByProductLine:1815` |
| **3** — Motor de dominio | `process-costing.ts` + `joint-costs.ts` | ✅ **Hecho.** Los dos existen. Los **4 métodos** de conjuntos implementados y anclados con valores exactos |
| **4** — Orquestación y endpoints | Servicios + rutas + arrastre | ✅ **Hecho.** 6 servicios en `process-costing/`, 5 rutas, `process-wip-carry.test.ts` |
| **5** — Selector en el frontend | `NewStructureForm` + bifurcación | ✅ **Hecho.** `CompanyStructuresList.tsx:114-213`, `CostStructurePage.tsx:137-169` |
| **6** — Pantallas de Procesos | 5 tabs nuevas | ✅ **Hecho.** `DepartmentsTab`, `UnitMovementTab`, `EquivalentProductionTab`, `JointCostsTab`, `ProductionCostReportView`, más `ProcessSetupWizard` |
| **7** — Fixes de Órdenes + backups/staging | 4 ítems | 🟡 **Parcial.** `costingSystem` ✅ · bug 500 ✅ · **backups automáticos sin confirmar** · imputación doble período aún solo MP |
| **8** — Verificación final y regresión cero | Suite completa + demo end-to-end | ❌ **No hecha.** Y es la que cierra el DoD |

**Costeo por Procesos pasó de 0 % a ~85 % en un mes, y el equipo no lo sabe con precisión porque nunca corrió la Fase 8.** Es el mismo agujero que mide el indicador CD.

Del Definition of Done (§12 del plan, 13 ítems): **8 verdes, 3 indeterminados** (dependen de correr los fixtures nombrados), **2 rojos** (backups automáticos confirmados; demo end-to-end revisada por alguien que conozca la cátedra).

### 3.2 Lo que las reuniones ya decidieron y no está ejecutado

De las dailies y la weekly (15, 17 y 18 de agosto):

| Decisión tomada | Estado | Choca con |
|---|---|---|
| **Pasar los repos a privados** (Railway + Vercel) — *"inversión necesaria"* | ❌ Sin ejecutar | 🚨 **Es la mitigación de #18.** Los datos de Augusto siguen públicos porque una decisión ya tomada no se ejecutó |
| **Comprar el dominio** — marcado como urgente | ❌ Sin ejecutar | — |
| **Rediseño del lenguaje de la UI** — *"frases técnicas que no le sirven al dueño del negocio"* | ❌ Sin ejecutar | Es **F-02 + P-03**, con más urgencia de la que Julie le dio |
| **Confirmar con Augusto vida útil del lote y tamaños de huevo** (provisorio: 2 años) | ❌ Sin ejecutar | Es el issue **#19** y arrastra el costo unitario entero |
| **Llamada con el ingeniero por el VPS** | ❌ Sin ejecutar | — |
| **Objetivos concretos para el 2-3 de septiembre** | ⏳ Este documento es el insumo | — |

**Patrón:** seis decisiones tomadas en tres reuniones, cero ejecutadas. No es falta de criterio —las decisiones son buenas— es que **no hay un lugar donde una decisión de reunión se convierta en trabajo asignado**. Es exactamente el problema que este documento intenta resolver.

### 3.3 Una corrección de prioridad que sale de las reuniones

Julie escribió F-02 así: *"Un contador que usa CosteAR por primera vez no sabe qué significa ninguno de estos términos"*.

Pero la decisión de producto del equipo (17-08) es explícita: **el cliente objetivo es el dueño de la empresa, nunca el contador.** Frase ancla: *"costo más control"*. Producto central: *"un segundo vos para el empresario"*.

Si el usuario es el dueño y no el contador, entonces `CIP`, `MOD`, `ITCS` y `Producción equivalente` sin explicación no son un detalle de UX: **son una barrera contra el usuario para el que se está construyendo el producto.** F-02 y P-03 suben de prioridad, y la sección 7 de Julie (vocabulario y copy) deja de ser cosmética.

Con un matiz que la doctrina impone: el plan de la bóveda (§4.1, regla dura §11.9) obliga a usar **la terminología exacta de la cátedra en código, UI y mensajes, sin traducir ni inventar sinónimos**. Las dos cosas conviven de una sola forma: **el término técnico se muestra, y al lado va la explicación en criollo.** No se reemplaza. Hay que dejarlo escrito antes de que alguien "simplifique" la UI y rompa la fidelidad a la cátedra.

---

## 4. Auditoría de Julie — hallazgo por hallazgo

### 4.1 Por qué falló el alcance

Julie declara su base: *"código en `staging` al 19-08-2026. No incluye ramas en desarrollo de otros miembros del equipo."* Ese recorte invalida un tercio del ejercicio:

- `origin/dev` está **5 adelante / 6 atrás** de staging.
- El **PR #86 está abierto** (`dev → staging`), titulado *"WhatsApp sin descartes silenciosos, reglas de alerta y protocolo de revisión"* — contiene el arreglo de **B-06** y de **F-06**, que ella reporta como pendientes.
- Hay **4 issues con `status:needs-verification`** (#78, #79, #44, #45). La etiqueta significa *"el fix ya está en staging, falta reverificación"*. Ella los reporta como abiertos.

No es error de criterio técnico: es error de método. **Una auditoría que no lee el tablero de issues no está auditando el proyecto, está auditando un tarball.**

### 4.2 ❌ Los falsos — no hacer este trabajo

**B-10 — "Entidades de proceso sin tests de RLS".** Las tres tienen política explícita en `prisma/rls.sql`: `process_departments` (145-151), `unit_movement_schedules` (155-170, con el predicado subiendo por la cadena de FK), `joint_cost_allocations` (178-186). Y `rls-coverage.test.ts` no es una lista manual: extrae las tablas de los `@@map()` de `schema.prisma` y las cruza contra `rls.sql`, con un diccionario `EXENTAS` donde cada exención lleva su motivo escrito.

**P-02 — "Sin observabilidad de errores en producción".** Sentry está integrado: `@sentry/node ^10.68.0` y `@sentry/profiling-node`; `Sentry.init()` en `app.ts:49-56`; `setupFastifyErrorHandler` en `:71-73`; webhook en `system-alert-service.ts`; pantalla en el admin (`SystemAlertsPage.tsx`); y una rama abierta para mejorarlo. Sobrevive media línea: **no hay alertas de jobs fallidos de BullMQ**.

**P-04 — "Sin rate limiting en endpoints públicos".** `@fastify/rate-limit ^10.2.2` registrado en `app.ts:133-140`. `/auth/login` a `5 / 15 min` en prod (`auth.routes.ts:50`), forgot-password `20 / 1 h` (`:53`), advisor `30 / 5 min`. Y su propia salvedad —*"verificar el header `X-Hub-Signature-256` (puede que ya esté; verificar)"*— se contesta sola: **está**, en `whatsapp.routes.ts:10-12`.

> Escribir "verificar" y no verificar, en un hallazgo de seguridad, es la falla de método de toda la auditoría en miniatura.

**F-12 — "0 tests de componente".** 18 archivos de test en el frontend, 6 de componente React (`ProductionCostReportView`, `adjuntar-comprobante`, `idle-capacity-view`, `itcs-breakdown-view`, `procedencia-ia`, `trazabilidad-resaltado`). Queda en pie que **los formularios críticos no están cubiertos** — hallazgo válido y mucho más chico.

**P-05 — "#78 no está caracterizado".** El issue tiene título preciso, repro en 3 pasos, causa raíz identificada (`email-service.ts` capturaba el error y terminaba normal, así que el `try/catch` de `empresa-portal-service.ts` no lo veía), fix mergeado (`3d9ca6c`, PRs #60/#62) y label `needs-verification`. No hay que triagearlo: hay que **reverificarlo**.

### 4.3 🕐 Los desactualizados

**B-01 — Transacciones + RLS (#79) — YA ARREGLADO.** Su "solución propuesta" es `runAsTransaction(tenantId, fn)`. Ya existe con otro nombre en `prisma.ts`: `withTenant<T>(userId, fn)` (línea 156) abre `$transaction` y setea el contexto una sola vez; `enterExplicitTransaction()` / `inExplicitTransaction()` impiden que la extensión de `$allModels` abra su propia transacción paralela; y hay un wrap sobre `$transaction` (120-124) comentado como *"H19"*, la auditoría que originó el bug.

> Julie propuso, como ítem #1 del Sprint 1 y con esfuerzo XL, reimplementar algo que ya está hecho.

**B-06 — WhatsApp (#73).** Resuelto en `dev`, dentro del PR #86. El trabajo es mergear, no implementar.
**F-06 — Alertas (#74).** `feat/reglas-de-alerta` ya en `dev` (`83ec4fe`), también en el PR #86. Falta solo la pantalla del contador.
**F-03 (#44) y F-04 (#45).** Los dos con `status:needs-verification`.

### 4.4 ⚠️ Los imprecisos

**B-03 — Workers BullMQ.** Confirmado que no hay `lockDuration` ni `maxStalledCount`. Pero los workers no son *"clasificación, cálculo, RAG"*: son `daily-run`, `macro-sync` y `nightly-learning`, y dos ya tienen `concurrency: 1`.

**F-01 — "NewCompanyForm".** El archivo no existe; el real es `CompanyInfoForm.tsx`. Y el problema de fondo es mayor: **no existe sistema de toasts en toda la app**, escrito en `ConfirmDialog.tsx:22` — *"No hay sistema de toasts: la confirmación vive en este modal."* F-01 y A-01 no son dos S: son **una M** más dos S.

**A-02 — "Admin sin tests".** Correcto para unitarios, pero hay red E2E: `tests/e2e.spec.ts` con Playwright y workflow propio.

### 4.5 📏 Los mal dimensionados

**F-09 — Tabs: dice "3+ lugares", son 7.** `CompanyDetailPage`, `CostStructurePage`, `ScenarioSimulator`, `EmpresaPortalPage`, `SidebarDock`, `ProfilePage`, `ValidacionesPage`.

**F-08 — Fuentes chicas: dice "varios badges", son 20+ archivos**, con 8-9 ocurrencias en `AlertsPage`, `AutomatizacionPage`, `CompaniesPage` y `AppShell`. Es una decisión de design system, no un fix S.

**B-04 — Endpoints faltantes: correcto, y el substrato ya está mergeado.** Los 4 modelos están en el schema de staging y no hay rutas REST para ellos.

> ⚠️ **Corrección a la primera versión de este documento.** Escribí que había una cadena de 4 ramas apiladas (`feat/parametro-costeo`, `feat/amortizacion-y-desperdicio`, `feat/tenant-pico-de-oro`, `feat/seed-tenant-avicola`) con ~880 líneas de trabajo pendiente. **Es falso, y me pasó lo mismo que a Julie: leí un diff de tres puntos contra la merge-base en vez del estado real.**
>
> El contenido de esas ramas **ya está en staging**. Un `git diff origin/staging..rama` muestra que las ramas están **atrasadas**: `feat/parametro-costeo`, si se mergeara hoy, **borraría** `seed-tenant-avicola.ts` (180 líneas) y revertiría 257 líneas de `avicola-fixture.test.ts`.
>
> **Son ramas muertas. El trabajo no es consolidar: es borrarlas.**

### 4.6 ✅ Los que están bien — trabajo real

| ID | Verificación |
|---|---|
| **B-02** | `cost-structure-deletion-service.ts`, 100 líneas. `purge()` hace `SET LOCAL app.purge_mode = 'on'` y borra en cascada manual `dataPoint → dataPointVersion → evidence`. **Cero tests.** El 🔴 está bien puesto |
| **B-07** | Ni `cursor`, ni `take`, ni `skip` en las rutas de alto volumen |
| **B-08** | Textual: `calculation-run-persistence.ts:41` y `:44`, con `eslint-disable` |
| **B-09** | Al número: `data-point-service.ts` **946**, `validaciones-service.ts` **824**, `cost-structure-service.ts` **777**. El mejor hallazgo del documento |
| **B-11** | `advisor-service.ts`, `deviation-service.ts`, `proposal-service.ts` sin tests |
| **F-02 / P-03** | Confirmados, y **suben de prioridad** por §3.3 |
| **F-05 / F-07 / F-10 / F-11** | Confirmados. No hay `Textarea.tsx`; `aria-label` en solo 10 archivos |
| **A-01 / A-03 / A-04** | `AdminUsers.tsx`, `VaultProposals.tsx`, `IndustryProfiles.tsx` — los tres confirmados |
| **P-01** | No hay un solo documento de deploy ni runbook. **Y §2.3 (A3) lo vuelve urgente** |
| **P-06 / P-07 (#75)** | Confirmados |
| **B-05 (#72)** | **Verificar antes de estimar**: `scripts/migrate-deploy.mjs` y `apply-rls.mjs` ya existen. El gancho está; falta saber si recrea los índices vectoriales |

---

## 5. Hallazgos de Lautaro — job-order costing

> **Base declarada:** revisión de código y de cálculos con tres ejemplos, **sin Docker ni API**. Por eso no los cargó como issues. La declaración es correcta y suficiente: los cuatro son verificables leyendo el código, y los verifiqué.

### ✅ L1 — El costo entero de un centro de servicio desaparece en silencio · **alta**

> 🟢 **RESUELTO el 20-08** — issue #91, PR [#103](https://github.com/Coste-AR/CosteAR-backend/pull/103), ADR backend#0005. En review, sin mergear. Ver §9.

**Confirmado.** En la pasada directa (`closureOrder` vacío o ausente), un centro de servicio sin reparto secundario se saltea: su costo primario completo se evapora del presupuesto, la cuota, el CIP aplicado y el costo unitario. Sin error, sin warning, `pendingClosing` en `false`, y el chequeo de consistencia de MP verde.

```
D01 sin el reparto de Mantenimiento:
conceptos 1.440.000,00 | productivos 1.291.000,00 | PERDIDO 149.000,00
CIP aplicado      1.203.950,00  (correcto 1.342.520,00)
costo producción  9.186.902,91  (correcto 9.325.472,91)
CPV unitario          3.112,30  (correcto     3.158,49)  → −1,46 %
```

Verificado en `src/domain/calculations/indirect-costs.ts`:
- **La pasada escalonada sí valida**: líneas 333 y 338 tiran un 422 accionable por reparto vacío. El defecto está confinado a la directa, que valida el auto-reparto (162) y los destinos inexistentes (167) pero **no el reparto vacío**.
- **La UI hoy está a salvo**: siempre manda `closureOrder`. A la pasada directa se llega por estructuras viejas, import de Excel, el populador de IA y cualquier llamador de la API.
- **El chequeo ya existe y nadie lo llama**: `GET /structures/:id/allocation-check` (`allocation-base.routes.ts:66`). Grep en los tres repos: **cero llamadores**.

### ✅ L2 — `allocationMode: "direct"` se trata como `"percent"` · **baja**

**Confirmado.** El schema documenta `direct` como *"importe ya asignado por centro"*, pero `primaryProration` (`indirect-costs.ts:68`) ignora `allocationMode` por completo y renormaliza por el total:

```
Alquiler $600.000, importes cargados 250.000 / 200.000 / 50.000 (suman 500.000)
  → Corte recibe 300.000, no los 250.000 declarados. Sin aviso de la diferencia de 100.000.
```

El control de cátedra para asignación directa (*"la suma de los departamentos debe dar el total de la cuenta"*) nunca corre. **Ningún llamador manda `direct` hoy** — el frontend fuerza `base`/`percent`. Es un modo documentado y no implementado, no un error activo.

> Que Lautaro haya separado *"error de cálculo activo"* de *"modo documentado y no implementado"* es exactamente el rigor que le faltó a la otra auditoría.

### ✅ L3 — El costeo por órdenes no puede contabilizar desperdicio · **media**

> 🟡 **PARCIAL el 21-08** — issue #92, PR [#107](https://github.com/Coste-AR/CosteAR-backend/pull/107), ADR backend#0008. El motor ya aplica R5; falta el CRUD y la pantalla para cargar el dato. Ver §9.

**Confirmado, y es el caso más claro del patrón de §5.5.** El andamiaje está entero y desconectado: la tabla `desperdicio_registros` con `naturaleza` y `valorRecupero`, `src/domain/calculations/desperdicio.ts` (114 líneas implementando R5), y `tests/domain/amortizacion-y-desperdicio.test.ts` (181 líneas) — **los tres en staging**.

Y el único `import` de `desperdicio.js` en todo el repo es **su propio archivo de test**. `runCalculation` nunca lo llama; `CalculationInput` no tiene dónde declararlo.

> Regla R5 (Clase 4): *el desperdicio normal neto de recupero lo absorben las unidades buenas; el extraordinario es pérdida del período, nunca costo.*

### ✅ L4 — El control de variaciones no cierra a la precisión de la API · centavo

**Confirmado, y la clave de bóveda de D02 lo predijo.** `Money` mantiene precisión completa (correcto), pero los tres números se redondean independientemente al serializar:

```
Terminación: var.ppto + var.volumen = 7.666,66   vs   −(sobre/sub) = 7.666,67
```

**Respondiendo el "your call":** el centavo es el síntoma. El hallazgo es que **el motor nunca corre este control**, aunque ya tiene un bloque de consistencia para el de MP. Se archiva como **baja**, y el trabajo es enchufar el control con tolerancia de un centavo — no perseguir el redondeo.

### 5.5 El patrón de fondo: validaciones construidas y nunca enchufadas

Esto no lo dice ninguna auditoría por separado; sale de cruzarlas.

| Caso | Estado |
|---|---|
| `GET /structures/:id/allocation-check` | Existe, mensaje correcto, **cero llamadores** (L1) |
| `desperdicio.ts` + tabla + 181 líneas de test | Existe, **único importador: su propio test** (L3) |
| Control de variaciones ppto/volumen | En la doctrina, **el motor no lo corre** (L4) |
| Control de suma en asignación directa | En la doctrina, **`primaryProration` lo ignora** (L2) |
| `checkRawMaterialConsistency` | **Ya fue un defecto real cuando se lo encontró apagado** — el precedente |

Cuatro de los cuatro hallazgos de Lautaro son el mismo patrón, con un precedente documentado de que ya produjo un defecto real.

La ironía: **B-10 de Julie es este patrón al revés** — creyó encontrar una validación apagada justo en el único lugar donde el equipo sí la dejó automatizada.

**Acción que sale de cruzar las auditorías, y que no estaba en ninguna:** un test que falle si existe un endpoint de validación sin llamadores, o un módulo de dominio cuyo único importador sea su test. Barato, y ataca la causa en vez de los cuatro síntomas.

---

## 6. Lo que ninguna auditoría vio

### 🚨 6.1 Datos comerciales de un cliente real, en repos PÚBLICOS (#18)

La sección 1 de Julie se llama **"Seguridad y datos del cliente"**. Esto no está adentro.

`CosteAR-backend` y `CosteAR-frontend` son **públicos**. Contienen, con el nombre del cliente del vertical avícola al lado: su estructura de costos completa (costo variable unitario, costo fijo mensual, precio promedio de venta), su punto de equilibrio, **el hecho de que hoy opera a pérdida**, y la escala de la explotación. En `tests/domain/avicola-fixture.test.ts`, `prisma/seed-vocabulario-avicola.ts`, `.claude/skills/costear-issue/SKILL.md`, y en los cuerpos y títulos de los PRs #67, #69, #70 y #71.

Es información comercial de una persona real a la que **nunca se le avisó ni se le pidió permiso**, y hay una parte irreversible: el historial de git es permanente.

> **Y el equipo ya decidió la mitigación y no la ejecutó.** Pasar los repos a privados está decidido desde la daily del 18-08 (§3.2). Dos días después siguen públicos.

Rama `chore/anonimizar-datos-cliente` (+9) sin mergear.

### 🚨 6.2 Siete defectos abiertos que mueven números

Detalle en el indicador **A2** (§2.3). Los tres del tablero:

- **#89 (alta)** 🟢 **RESUELTO el 20-08 (PR [#104](https://github.com/Coste-AR/CosteAR-backend/pull/104), ADR 0006) — pero NO como decía el issue.** `calculate.ts:599`: el costo unitario de producción divide el costo del período sin pasar por la producción en proceso. **Es el número con el que el cliente pone precio.** ⚠️ **La cátedra dice que esa fórmula es la correcta** (clase 2, práctica resuelta: `costo de producción ÷ unidades`, renglón anterior al ajuste por proceso). Lo que faltaba era el renglón siguiente. Ver §9.
- **#88 (media)** 🟢 **RESUELTO el 20-08 (PR [#105](https://github.com/Coste-AR/CosteAR-backend/pull/105)).** `calculate.ts:602`: el CPV unitario se divide por **producidas** en vez de **vendidas**. Regresión del 18-08 introducida por un arreglo correcto (`3b9e8ae` arregló un divisor; el otro heredó el error). Mismo defecto en `freeze-process-period.ts`, también corregido.
- **#90 (media)** 🟡 **PARCIAL el 20-08 (PR [#106](https://github.com/Coste-AR/CosteAR-backend/pull/106), ADR 0007).** `cost-statement.ts`: el estado de costos salta del costo **normal** directo a productos terminados, omitiendo *trabajos de terceros* y *variación presupuesto*. Bloquea el Estado de Resultados. **La variación presupuesto ya entra; los trabajos de terceros no, porque no existen en el modelo.** Ver §9.

Los tres se reproducen en `dev` (`0e4c021`) **y en `staging` (`04f21f9`)** — la misma rama que auditó Julie.

### 🚨 6.3 `main` congelado hace 39 días

Ver el indicador **A3**. 397 commits de distancia en backend, 175 en frontend, último commit del 12 de julio. Con un cliente activo y sin runbook, **nadie puede decir qué código está sirviendo**.

### 6.4 Credenciales fijas en las herramientas demo (#87)

Área `auth`, abierto el 19-08 —el día de la auditoría de Julie—. Rama `chore/remove-demo-credentials` (+29 / -1). No aparece.

### 6.5 El tenant del vertical avícola nunca se dio de alta (#19)

B-04 dice *"los datos del cliente avícola no pueden cargarse porque no hay UI ni API"*. La causa está más arriba: **la empresa no existe en el sistema**. Todo el vertical se validó contra fixtures.

Y hay 4 parámetros que son **estimaciones sin confirmar**, incluido el conflicto sobre la vida útil del lote (18 meses en una reunión, ~24 en otra) que **divide la amortización de todo el plantel**. Un parámetro mal ahí arrastra el costo unitario entero — que es exactamente el número del #89. La confirmación con Augusto está decidida desde el 18-08 y sin ejecutar (§3.2).

### 6.6 El cementerio de ramas

60+ ramas remotas en el backend, la mayoría cientos de commits por delante de staging y **ninguna por detrás**:

```
+439  fix/costeo-por-ordenes-correcciones     +414  feature/gmail
+431  feat/portal-y-estructuras-mejoras       +410  debug/email-health
+428  feat/autopoblado-centro-productivo            9 ramas merge/dev-a-staging-N
+425  feat/perfil-foto-y-fuente                     2 ramas sync/staging-a-dev-N
+422  feat/landing-access-gate
```

Otras 40 en el frontend, 15 en el admin. **Y ya nos costó caro:** las 4 ramas muertas del vertical avícola me hicieron escribir un hallazgo falso (§4.5).

### 6.7 El PR #86 abierto bloquea la promoción

`dev → staging`, con WhatsApp y las reglas de alerta adentro. Mientras siga abierto, **cualquier auditoría sobre staging va a seguir dando falsos positivos** — que es exactamente lo que pasó.

---

## 7. Reparto de trabajo

### 7.1 El criterio

No es por mitades ni por área: es por **quién puede terminar sin esperar a nadie**.

Hay información que no existe en ningún repo y que define el reparto: la relación con el cliente (Augusto, Pico de Oro), la doctrina de cátedra de la bóveda de Mirta, y los permisos de admin de los repos.

**Regla:** todo lo que toque *el cliente*, *el motor de costeo* o *el historial de los repos* es de Santiago. Todo lo que sea *verificar*, *cubrir con tests* o *construir componentes* es de Julie.

### 7.2 Santiago — 5 bloques

| # | Bloque | Qué incluye | Por qué no se delega |
|---|---|---|---|
| **A** | 🚨 **Higiene de datos del cliente** (#18) | **Ejecutar la decisión ya tomada de pasar los repos a privados**; decidir qué se hace con el historial de git; anonimizar los 4 archivos y los cuerpos de los PRs #67/#69/#70/#71; mergear `chore/anonimizar-datos-cliente`; regla escrita en los 3 `CLAUDE.md`; decidir si se le avisa a Augusto | Decisión sobre un cliente y sobre reescritura de historial |
| **C** | 🚨 **El motor de costeo** — 5 defectos | **#89** producción en proceso · **L1** centro de servicio que desaparece · **#88** divisores CPV · **#90** trabajos de terceros y variación presupuesto · **L3** conectar `desperdicio.ts` a `runCalculation` (regla R5) | Dependen de la doctrina de cátedra. **L1 se resuelve copiando el 422 que la pasada escalonada ya tira** (`indirect-costs.ts:333/338`): el más barato de los cinco y el de mayor prioridad. **Este bloque es el indicador A2** |
| **D** | **Alta del tenant Pico de Oro** (#19) | Dar de alta por el flujo normal (no por SQL), correr el seed, cerrar los 4 parámetros con Augusto empezando por la vida útil del lote, cerrar un período contra su planilla | Relación con cliente, pura. Ya decidido el 18-08 |
| **E** | **Desatascar el pipeline** | Mergear el PR #86; **promover a `main` con runbook y dejar registrado el SHA de cada ambiente**; podar el cementerio, empezando por las 4 ramas muertas (§4.5) | Permisos de admin. **Es el indicador A3 y es el peor del tablero** |
| **B'** | **Decisiones cortas que destraban a Julie** | **L2**: ¿se implementa `allocationMode: "direct"` con su control de suma, o se saca del schema? · **F-02/P-03**: qué copy para los tooltips, respetando la regla dura de terminología (§3.3) · **Fase 8** del plan: ¿se corre la verificación final ahora o después de C? | Decisiones de producto de 20 minutos que bloquean trabajo de Julie |

**Orden:** A y E primero. Después C, empezando por L1 y #89. B' cuanto antes. D al final.

### 7.3 Julie — 8 bloques

| # | Bloque | Qué incluye | Independencia |
|---|---|---|---|
| **F'** | 🎯 **Trazar los fixtures a la cátedra** | Poner el ID (`FX-P3 · CCEDA SA, Clase 23`) en el `describe` de cada test que ancle un caso; completar los que falten (CCEDA, ARSA, cacao, Betton) | ✅ Total. **Es lo que hace calculable el indicador principal CD.** Va primero |
| **F** | **Reverificación** (#78, #79, #44, #45) | Reproducir los 4 contra el fix que ya está en staging; cerrarlos o reabrirlos con evidencia | ✅ Total. Cierra 5 de sus propios hallazgos desactualizados. **Es lo que hace bien, y corrige su propio error de método.** Mueve el indicador A4 |
| **G** | **Tests de lo destructivo** (B-02, B-11) | `cost-structure-deletion-service` (`softDelete` y `purge`, incluido el `purge_mode`), `advisor-service`, `deviation-service`, `proposal-service` | ✅ Total |
| **G'** | **Enchufar las validaciones huérfanas** (§5.5) | Llamar `allocation-check`; **L4**: correr el control de variaciones con tolerancia de un centavo; y el test que falle si aparece otro endpoint de validación sin llamadores o un módulo cuyo único importador sea su test | ✅ Total una vez que Santiago cierre L1. Complemento defensivo del Bloque C |
| **H** | **Sistema de notificaciones** (F-01 + A-01) | Montar el sistema de toasts que hoy no existe; aplicarlo en `CompanyInfoForm` y `AdminUsers` | ✅ Total |
| **I** | **Design system frontend** (F-09, F-10, F-08, F-11, F-07) | `<Tabs>` extraído y aplicado en los 7 lugares; `<Textarea>`; tamaño mínimo de fuente en los 20+ archivos; `aria-label`; `max-h` + `overflow-y-auto` en modales mobile | ✅ Total |
| **J** | **Endurecimiento backend** (B-03, B-08, B-07, BullMQ en Sentry, B-05) | `lockDuration` y `maxStalledCount` en los 3 workers; tipar `inputsSnapshot` y `results`; paginación por cursor; alertas de jobs fallidos; **verificación de media hora de si `migrate-deploy.mjs` recrea los índices vectoriales (#72)** | ✅ Total |
| **K** | **Runbook de deploy** (P-01) ⚠️ | Pasos técnicos verificables: `migrate-deploy.mjs`, `apply-rls.mjs`, verificación post-deploy, rollback | ⚠️ **Única dependencia cruzada.** Necesita del Bloque E qué SHA corre dónde. **Cómo se rompe:** ella escribe el esqueleto verificable desde el repo; Santiago completa infra al final |

**Orden:** F' y F primero (F' destraba la métrica, F la calibra). G y J en paralelo con H. G' cuando Santiago cierre L1. I al final.

### 7.4 Lautaro

Sus cuatro hallazgos están repartidos (L1 y L3 → Bloque C; L2 → decisión B'; L4 → Bloque G'). Lo que corresponde devolverle:

1. **Los cuatro se confirman.** Separar *"error de cálculo activo"* de *"modo documentado y no implementado"* (L2) es el rigor que le faltó a la otra auditoría.
2. **Sí, archivá L4** — como baja, con el foco en que el control no corre, no en el centavo.
3. **El testeo con Docker y API que no corrió es justo el que cierra L1.** Su propia salvedad marca el hueco: la UI siempre manda `closureOrder`, así que el defecto solo se alcanza por Excel, el populador de IA o la API cruda. Que sea su próximo paso, o el criterio de cierre del issue de L1.
4. **Hay un bloque con su nombre que sale de la métrica: la Fase 8** del plan de la bóveda (verificación final y regresión cero) nunca se corrió, y es exactamente lo que él ya sabe hacer. Sería el cierre natural de los 158 casos de test de Procesos que hoy nadie declaró verificados, y es el otro camino —junto con F'— para desbloquear el indicador CD.

### 7.5 Lo que queda fuera, y por qué

| Ítem | Motivo |
|---|---|
| **B-01 — implementar `runAsTransaction`** | ❌ **No hacer.** Ya existe como `withTenant()` |
| **P-02 — integrar Sentry** | ❌ **No hacer.** Ya está. Sobrevive solo BullMQ → Bloque J |
| **P-04 — rate limiting** | ❌ **No hacer.** Ya está, login y firma de Meta incluidas |
| **B-10 — RLS de entidades de proceso** | ❌ **No hacer.** Cubierto y automatizado |
| **B-04 — "consolidar las 4 ramas del vertical"** | ❌ **No hacer.** Eran ramas muertas (§4.5). Falta solo la capa REST, después del Bloque D |
| **B-09 — refactorizar los 3 servicios gigantes** | ⏸️ **Bloqueado a propósito** hasta tener los tests del Bloque G. En esto Julie tiene razón |
| **P-07 (#75) — subproductos** | ⏸️ Research de cátedra → Santiago, cuando haya aire |
| **A-02 — tests unitarios del admin** | ⏸️ Prioridad baja real: ya hay red E2E con Playwright |

---

## 8. Qué hay que cerrar antes de repartir

1. **La conversación con Julie es sobre método, no sobre resultado.** Su criterio técnico es bueno; lo que falló fue auditar una rama sin mirar issues, PRs ni ramas. Conviene decirlo con el contraejemplo al lado: **Lautaro auditó menos superficie y acertó 4 de 4** porque midió cada cosa que afirmó.

2. **Yo cometí el mismo error y está corregido en §4.5.** El cementerio de ramas es tan denso que induce el error, y es una razón más para el Bloque E.

3. **Cómo se materializa.** Recomendación: **issues por bloque en cada repo, con el label `source:audit` que ya existe.** El tablero ya es la fuente de verdad; abrir un canal paralelo de .md es lo que produjo este desfasaje. Este documento queda como el mapa; los issues, como el trabajo.

4. **El Bloque A no espera**, y ahora menos: la mitigación (repos privados) está decidida desde el 18-08 y sin ejecutar. Cada día es historial adicional que reescribir.

5. **Las seis decisiones de reunión sin ejecutar (§3.2) entran al reparto o se descartan explícitamente.** No pueden quedar en el limbo por tercera semana.

6. **El tablero de §2.4 se recalcula el 2-3 de septiembre**, que es la fecha que el equipo ya se puso para tener objetivos concretos. Ahí se ve si el reparto funcionó: **A3 tiene que bajar de 39 días, A2 de 7 defectos, y CD tiene que pasar de "no calculable" a un número.**

---

## Apéndice — Cómo recalcular el tablero

```bash
# A1 · Índice de Trabajo Neto
git log origin/staging --since="8 weeks ago" --pretty=format:"%s" \
  | grep -oE "^(feat|fix|chore|docs|test|refactor)" | sort | uniq -c | sort -rn

# A3 · Latencia de Promoción
git rev-list --left-right --count origin/main...origin/staging
git log origin/main -1 --pretty=format:"%h %ad %s" --date=short

# A5 · Ritmo
git log origin/staging --since="8 weeks ago" --pretty=format:"%ad" \
  --date=format:"%Y-W%V" | sort | uniq -c

# CD · Cobertura de Doctrina (funciona recién después del Bloque F')
git grep -ohE "FX-(P[1-6]|J[1-3]|O[1-6])" origin/staging -- tests | sort -u | wc -l

# A2 · Tasa de Defecto en Números
gh issue list --state open --label "area:costeo" --json number,title
```

---

## 9. Bitácora de ejecución

> Se actualiza **a medida que avanza cada bloque**, no al final. Una fila por hito real, con el
> link que lo prueba. Si algo se decidió distinto de como estaba planeado, se escribe acá **por
> qué**: el registro de por qué se cambió de opinión vale más que el estado actual.

### 9.1 Bloque C — El motor de costeo (Santiago)

| # | Qué | Issue | Estado | PR | ADR |
|---|---|---|---|---|---|
| C1 | Centro de servicio que desaparece (L1) | [#91](https://github.com/Coste-AR/CosteAR-backend/issues/91) | 🟢 En review | [#103](https://github.com/Coste-AR/CosteAR-backend/pull/103) → `dev` | backend#0005 |
| C2 | El costo unitario ignora la producción en proceso | [#89](https://github.com/Coste-AR/CosteAR-backend/issues/89) | 🟢 En review | [#104](https://github.com/Coste-AR/CosteAR-backend/pull/104) → `dev` | backend#0006 |
| C3 | CPV unitario dividido por producidas | [#88](https://github.com/Coste-AR/CosteAR-backend/issues/88) | 🟢 En review | [#105](https://github.com/Coste-AR/CosteAR-backend/pull/105) → **#104** | — |
| C4 | Variación presupuesto en el estado de costos | [#90](https://github.com/Coste-AR/CosteAR-backend/issues/90) | 🟡 En review, **parcial** | [#106](https://github.com/Coste-AR/CosteAR-backend/pull/106) → **#105** | backend#0007 |
| C4b | Trabajos de terceros | [#90](https://github.com/Coste-AR/CosteAR-backend/issues/90) | ⚪ Sin empezar — **entrada nueva, no existe en el modelo** | — | — |
| C5 | Conectar `desperdicio.ts` a `runCalculation` (L3) | [#92](https://github.com/Coste-AR/CosteAR-backend/issues/92) | 🟡 En review, **parcial** | [#107](https://github.com/Coste-AR/CosteAR-backend/pull/107) → **#106** | backend#0008 |
| C5b | CRUD y pantalla para cargar desperdicios | [#92](https://github.com/Coste-AR/CosteAR-backend/issues/92) | ⚪ Sin empezar — **cero rutas, cero servicios: la tabla no se lee ni se escribe** | — | — |

> 🚨 **21-08 — la cadena apilada se mergeó mal y tres arreglos NO llegaron a `dev`.** #103 y #104
> entraron bien; #105, #106 y #107 se mergearon **contra su rama de abajo**, así que quedaron en
> ramas muertas con el tilde verde puesto. Se recuperan en el PR
> [#110](https://github.com/Coste-AR/CosteAR-backend/pull/110), sin reescribir los commits.
> **Es la segunda vez que pasa lo mismo** (la primera fue el 18-08 y de ahí salió REV-08). Ver §9.3.

⚠️ **Cadena de PRs apilados**, porque tocan las mismas líneas del mismo archivo:

```
dev ← #103 (independiente)
dev ← #104 ← #105 ← #106 ← #107
```

**Se mergean de abajo hacia arriba: #104, #105, #106 y #107** (REV-08). Ninguno se
mergea el mismo día que se abre (REV-07).

### 9.2 Bitácora — 20-08-2026

| Hito | Qué pasó |
|---|---|
| C1 implementado | La guarda se puso en el **despacho** (`resolveProductiveCip`) y no adentro de cada pasada. Motivo: **la pasada escalonada tenía el mismo agujero por otra puerta** —un servicio que no figura en `closureOrder` nunca cierra y la salida solo copia los productivos—, cosa que la auditoría no vio. El despacho es el único punto que conoce a la vez el universo de centros, su costo primario y qué método se va a usar. |
| C1 — hallazgo no reportado | `secondaryProration` **mutaba** el objeto del prorrateo primario del llamador (guardaba la referencia y después le reasignaba los campos). No cambiaba ningún número porque nadie releía el primario, pero invalida cualquier control que compare las dos etapas. Se arregló en el mismo PR, como commit aparte. |
| C1 — criterio no cumplible | El criterio de cierre pedía un test *"exactamente sobre D01"*. **El dataset D01 no existe en ninguno de los cuatro repos**: solo están sus números en este documento. Se cubrió con el fixture *Dorado*, que sí vive en el repo y tiene el mismo centro de mantenimiento. Si D01 está en la máquina de Lautaro, que lo reproduzca ahí. |
| C2 — **el issue estaba equivocado** | El issue pedía cambiar el numerador de `unitProductionCost`. Se fue a la bóveda antes de tocar la fórmula y la **clase 2 de Mirta** define el costo unitario de producción como `costo de producción ÷ unidades`, renglón anterior al ajuste por producción en proceso ($2.306.000 ÷ 4.612 kg = $500/kg). O sea: **la fórmula que el código ya tenía es la de la cátedra, y que no se mueva es su definición**. Lo que faltaba era el renglón siguiente del estado de costos. Se agregó `unitFinishedGoodsCost` **al lado** del existente, sin tocarlo. Alternativas descartadas en el ADR 0006. |
| C2 — decisión de doctrina | Queda fijado que **`productionQuantity` son las unidades terminadas del período**. De eso depende el divisor del renglón nuevo. Si esa definición cambia, el ADR 0006 se revisa entero. |
| C3 — el test bendecía el bug | Existía un test llamado *"el COGS unitario usa el mismo divisor que el costo de producción unitario"*, que afirma lo contrario de lo que dice la cátedra. **La suite certificaba el defecto.** Su fixture además ponía las cuatro existencias en cero, lo que hace la diferencia invisible, mientras declaraba "producir 100 y vender 60" — un escenario imposible. Reescrito, y los tests nuevos usan existencias reales. |
| Verificación | Suite completa en **1331 tests, 0 fallidos**; `npm run typecheck` limpio; `npm run lint` con los 20 warnings preexistentes de `no-explicit-any` y 0 errores. Los fixtures de cátedra y los tres de ITCS dan exactamente lo mismo (DOM-05). |
| Pendiente que se abre | **`unitFinishedGoodsCost` no se muestra en ninguna pantalla** (`ResultTab.tsx:308` sigue pintando solo el viejo). Es cambio del repo de frontend, no se metió sin avisar. Mientras tanto es exactamente el patrón de §5.5 y del issue #98: algo calculado que nadie consume. |
| C4 — la doctrina, otra vez | La clase 28 define «normal = MP + MO + CIF aplicados; **real = normal + variación presupuesto**», y la clase 26 aclara que **la variación VOLUMEN va al estado de resultados, no al de costos**: es capacidad ociosa, pérdida de la empresa y no costo del producto. Se implementó la presupuesto y se dejó la volumen afuera **a propósito**. El dato ya lo calculaba el motor desde siempre y se usaba en anomalías y en el árbol: lo único que faltaba era traerlo al estado. |
| C4 — cambia números viejos | ⚠️ **El CPV de todo período con variación presupuesto distinta de cero cambia**, y el margen bruto con él. En el caso Dorado son **$21.500 más de costo**. Es el arreglo funcionando, pero un período recalculado no va a dar igual que antes. Ningún fixture lo detectó **porque ninguno assertea el CPV de Dorado contra un número fijo** — dato que también dice algo sobre la cobertura, y que alimenta el indicador CD. |
| C4 — gap declarado | **Los trabajos de terceros NO entraron.** No existen en el modelo: no hay campo, ni ruta, ni formulario. Es una entrada nueva de punta a punta, no una cuenta mal hecha. El PR es `part of #90` y **el issue queda abierto**. |
| C5 — la decisión que más podía salir mal | `imputarDesperdicios` devuelve un `alCosto`, y la pregunta era si se SUMA al costo de producción. **No.** Ese costo ya está adentro: la MP desperdiciada salió del almacén y la ficha de stock la registró como consumo. Sumarla otra vez es **doble conteo silencioso** — infla el costo unitario de todo el mes sin ningún error que lo delate. Se verificó contra tres fuentes independientes antes de escribir una línea: la clase 4 (trabaja por cantidad **bruta**), el motor de Procesos (`normalLossAbsorbedAutomatically`) y el issue #45 del frontend, que dice desde el otro lado que lo extraordinario **reduce** el costo. Eso resuelve además el criterio de cierre 5: los dos caminos coinciden. |
| C5 — gap declarado | **El dato no puede entrar por ningún lado.** `desperdicio_registros` tiene cero rutas y cero servicios: su única mención fuera del dominio es la lista de modelos con RLS. Conectar la lectura hoy devolvería siempre una lista vacía — otra pieza construida y nunca enchufada, que es lo que el propio issue denuncia. Falta el CRUD y la pantalla, y **el issue queda abierto**. |
| Riesgo que se abre | Una estructura ya cargada a la que le falte un reparto **deja de calcular**. Es deliberado —antes calculaba mal— pero se puede leer como "se rompió". No se puede dimensionar sin mirar los datos de producción, y eso depende del Bloque E. |

### 9.3 Bitácora — 21-08-2026

| Hito | Qué pasó |
|---|---|
| Merge de la cadena | Los cinco PRs se mergearon. **Tres no llegaron a `dev`**: #105, #106 y #107 entraron cada uno en la rama de abajo, que ya nadie mira. GitHub los marcó `MERGED` en verde. Verificado sobre `origin/dev`: faltaban los ADR 0007 y 0008 y tres archivos de test. |
| Recuperación | PR [#110](https://github.com/Coste-AR/CosteAR-backend/pull/110): los tres commits huérfanos tal cual, más el merge de `dev`, sin conflictos. **Sin `cherry-pick` ni `rebase`**: reescribir la identidad de los commits deja el mismo arreglo figurando dos veces y después nadie sabe cuál manda. |
| Lo que esto dice del método | **REV-08 ya existía, escrita, por este mismo accidente del 18-08 — y volvió a pasar.** Una regla que hay que recordar en el momento exacto del merge no alcanza. O se evitan los PRs apilados salvo necesidad real, o hace falta un chequeo automático que avise cuando un PR apunta a algo que no es `dev`. **Esto mueve el indicador A3 y es una decisión de proceso pendiente.** |
| Hallazgo lateral | `empresa-connection-whatsapp.test.ts` **falla por timeout de 5 s cuando la máquina está cargada** y pasa en 956 ms aislado. Preexistente y ajeno a estos cambios, pero un test flaky termina pintando el CI de rojo y erosionando la confianza en el semáforo. Sin issue todavía. |

---

*Documento consolidado — 20-08-2026. Fuentes: auditoría de Julie (19-08); hallazgos de job-order costing de Lautaro (20-08); `Plan-Implementacion-Costeo-Ordenes-y-Procesos.md` v1.0 y corpus de cátedra de `costear-knowledge-base`; reuniones del equipo del 15, 17 y 18 de agosto (Granola); y verificación directa contra `origin/staging`, `origin/dev`, `origin/main`, 115 ramas remotas y los 15 issues abiertos de los tres repos de código.*

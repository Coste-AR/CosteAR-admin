---
title: "Plan de Implementación v2 — Capa de análisis marginal sobre el motor auditado"
tags: [costear, producto, costeo-variable, analisis-marginal, plan, devs, auditoria]
fecha: 2026-09-07
destinatario: "Santi (orquestación) → Claude Code / Codex"
origen: "Auditoría de la v1 de Lautaro (`docs/planes/2026-09-07-analisis-marginal.md`), re-verificada contra `Coste-AR/CosteAR-backend` `origin/dev` = 07415de (07-09-2026 12:54 UTC) y `Coste-AR/CosteAR-frontend` `origin/dev` = bf70d3d (05-09-2026), más el Corpus Costos Curado AM0–AM18 y las reglas duras R1–R35"
estado: "v2 — la v1 se conserva íntegra; este documento no borra nada de ella: corrige 12 afirmaciones, agrega 17 brechas nuevas, 8 fixtures nuevos y 5 fases nuevas"
predecesor: "[[Plan-Implementacion-Interfaz-Dueno-Avicola-2026-08-28]] · [[Plan-Implementacion-Tenant-Avicola-Multirubro-2026-08-28]] · Plan 3 v1 (Lautaro, 07-09)"
hermano: "[[Plan-Implementacion-Motor-Costeo-Ordenes-y-Procesos-2026-09-07]] — el plan de Santi. §11 resuelve las colisiones entre los dos"
---
#costear #producto #costeo-variable #analisis-marginal #auditoria

# Plan 3 v2 — La capa de análisis marginal

> **Cómo se leen las marcas.** 🔴 regla dura, no negociable · 🟡 propuesta sin confirmar por el equipo · ✅ verificado contra el código con archivo y línea · ❌ afirmación de la v1 que la re-verificación contradice · ➕ agregado que no estaba en la v1.
>
> **Principio de este documento: se agrega, no se saca.** Todo lo que la v1 dijo sigue acá. Lo que cambia son las cosas que no resistieron la verificación contra `origin/dev` de hoy y contra el corpus de la bóveda, y están marcadas una por una en §2 y en el anexo §14, con la evidencia al lado.

---

## 0. Lo más importante de todo el documento

La v1 abre diciendo que el problema central es que **la contribución marginal del tablero no incluye la amortización del plantel, y que por eso la contribución marginal sale inflada**. La primera mitad de esa frase es correcta y está verificada. **La segunda mitad está al revés, y repite el error que el propio corpus de la bóveda llama "el error más caro del proyecto".**

> ❌ v1 §0: *"El plan 1 nombró la amortización del plantel como el segundo costo variable del negocio después del alimento… Un costo que en la avícola es variable y grande no está dentro del costo variable unitario, así que la contribución marginal sale inflada."*
>
> ✅ `AM17 — El Análisis Marginal aplicado a Pico de Oro`, conclusión 1: *"La amortización del plantel está mal clasificada, y es el error más caro del proyecto. El Plan 1 la trata como costo variable ($5.932/cajón). Amortizada en línea recta a 24 meses **no varía con el volumen: es fija** (regla R6, y R8 lo prohíbe explícitamente). Corregirlo… cambia la contribución marginal en un 24,9 %, de $23.811 a $29.743 por cajón."*
>
> 🔴 **R6.** La amortización de un bien de uso es **fija si la causa es el tiempo** y variable si la causa es la intensidad de uso. La del plantel se amortiza a 24 meses calendario: es fija.
> 🔴 **R8.** Ningún costo fijo puede entrar en el costo variable unitario por vía de una cuota de aplicación. Variabilizar un fijo corrompe el punto de equilibrio.

**Qué cambia, en concreto, con la corrección:**

| | Diagnóstico de la v1 | Diagnóstico corregido |
|---|---|---|
| Contribución marginal del tablero | Inflada (le falta un costo variable adentro) | **Correcta en su magnitud**: la amortización no debía estar adentro. Lo que está mal es otra cosa (G20: usa CIP *aplicado*, no real) |
| Punto de equilibrio | Bajo | **Bajo, sí — pero por otro motivo**: la amortización es un costo **fijo** que no llega al `CF` del denominador de la fórmula. El PE sale bajo porque falta plata en el numerador, no porque sobre `cm` |
| Dirección del arreglo | Meter la amortización en el costo variable | 🔴 **Meterla en los costos fijos, clasificada, con su rango de validez.** Meterla en el variable sería exactamente lo que R8 prohíbe |

**Y hay una inconsistencia interna en la propia v1 que confirma la corrección:** su fixture `AM-01` clasifica *"Amortización de activos 40.000 — **FIJO**, no erogable"*. El fixture está bien; el §0 que lo justifica, no. Este documento se queda con el fixture.

### Lo que la v1 no vio y es peor

**Hay un número mal calculado, ya en producción, en la pantalla que mira el dueño.** El conversor de pesos a cajones (`CosteAR-frontend#93`, PR #119, mergeado el 04-09) calcula `importe ÷ precioPorCajón`. Un costo fijo no se paga con facturación: se paga con **contribución marginal**. Con los números de la avícola, la pantalla dice **20,8 cajones** para tapar $1.000.000 cuando la respuesta es **33,6**. Vender esos 20,8 cajones deja $619.646 de contribución: **le faltan $380.354 y la pantalla le dijo que estaba cubierto.** Es la conclusión 6 de `AM17`, y ningún módulo de este plan lo tocaba. Ver **G15** y la tarea **MX-01**.

**Conclusión operativa (ampliada, no cambiada).** La v1 tiene razón en que no se puede construir encima de una base rota, y su fase M0 sigue siendo obligatoria. Lo que este documento agrega es que **antes de M0 hay una ola más corta y más urgente: los números que el dueño ya está viendo y ya están mal.** Esa es la Ola A (`MX-01` a `MX-05`), son cinco PRs chicos, y ninguno depende de un modelo de datos nuevo.

---

## 1. Contra qué se verificó esto

| Qué | La v1 dice | Verificado el 07-09-2026 |
|---|---|---|
| Backend | `origin/dev` = `985c70c` | ❌ **`985c70c` no existe en el repo** (`git cat-file -t` → *Not a valid object name*). `origin/dev` es **`07415de`** (07-09 12:54 UTC, *"docs: registrar bloqueo de contrato de unidad (#273)"*) |
| Frontend | `origin/dev`, "del 07-09-2026" | ❌ `origin/dev` del frontend es **`bf70d3d`, del 05-09**. No hay nada del 07-09 en esa rama |
| Destino del documento | `docs/planes/…` del backend | ❌ **`docs/planes/` no existe en ninguno de los dos repos.** El patch de la v1 no aplica sobre `CosteAR-backend`: crea un archivo en una carpeta ausente y edita un `README.md` que ahí no está |
| Doctrina | 14 notas del MOC Yardín + clases de Alfred | ✅ Confirmado, y **ampliado**: el corpus curado tiene **AM0–AM18 + P1–P4** y **35 reglas duras (R1–R35)**, de las cuales la v1 usa unas 6 |

🔴 **Consecuencia práctica para Santi:** antes de abrir el primer issue hay que decidir dónde vive este plan. Propuesta 🟡: `docs/planes/` en `CosteAR-backend`, creada en el mismo PR que lo trae, y el `README.md` de esa carpeta escrito de cero — no editado, porque no existe.

---

## 2. Auditoría de la auditoría — las 12 correcciones

Cada una lleva la evidencia que la sostiene. Ninguna borra contenido de la v1: la afirmación original queda registrada arriba y la corrección abajo.

| # | Afirmación de la v1 | Qué encontró la re-verificación | Impacto |
|---|---|---|---|
| **C1** | §0: la amortización del plantel es "el segundo costo variable del negocio" y por eso la CM sale inflada | ❌ Es **fija** (R6, R8, `AM17` §0.1). La CM no está inflada; el PE está bajo porque el fijo no llega al numerador | **Alto.** Cambia la fase M0 entera: la amortización entra al balde FIJO, no al VARIABLE |
| **C2** | G7: *"ya existe el campo que la reemplaza: `Company.unidadGestion` desde el PR #275 (05-09)"*, `schema.prisma:215` | ❌ **No existe.** `git grep -n "unidadGestion" origin/dev` devuelve **una sola línea**, y es la bitácora `docs/sesiones/2026-09-07-252-contrato-unidad-bloqueado.md`, que dice textual: *"no existe un selector de unidad de gestión por empresa en `origin/dev`… Falta un contrato persistido que identifique la unidad de gestión de `Company`"*. El issue **#252 quedó sin implementar por eso** | **Alto.** El entregable de M0 *"el tablero deja de hardcodear `'cajon'`"* **no es implementable como está escrito**. Se convierte en `M0-04`, que primero define el contrato |
| **C3** | Auditado contra backend `985c70c` y frontend del 07-09 | ❌ Ver §1 | **Medio.** Las citas de código siguen siendo válidas (las re-verifiqué una por una contra `07415de` / `bf70d3d`), pero la trazabilidad del documento estaba rota |
| **C4** | El plan se entrega como patch sobre `docs/planes/` | ❌ Esa carpeta no existe en ningún repo | **Medio.** Decisión de ubicación pendiente |
| **C5** | G14: *"la variación volumen existe en el motor y nunca corre… hoy no hay ningún número vivo de capacidad ociosa"* | ❌ **Sí hay uno vivo, y es de mano de obra.** `calculate.ts:224-254` expone `detail.directLabor.idleCapacity` con `paidHours`, `productiveHours`, `idleHours`, `idleCost`, `applicableMod`, `breakdown` por tipo de improductividad, `alert` con nivel y texto redactado, y `destination: 'absorbido-en-el-producto' \| 'perdida-del-periodo'`. Es la capacidad ociosa de la **clase 10**. Lo que falta es la de **CIP** | **Alto.** M7 deja de ser "construir capacidad ociosa" y pasa a ser "unir la de MOD que ya existe con la de CIP que no, y elegir la métrica" |
| **C6** | `AM-01`, control de suma: *"214.000 + 192.000 = 406.000"* | ❌ **Falta el costo variable de comercialización.** El propio fixture declara $30 por unidad vendida × 800 = **24.000**. El control correcto es **214.000 + 24.000 + 192.000 = 430.000** | **Alto.** Es el número que M0 usa como criterio de aceptación: si se implementa contra 406.000, el test pasa con la descomposición mal |
| **C7** | §8.8, 🔴 *"uso de capacidad + eficiencia = `volumeVariance` del motor"* | ❌ **No cierra.** El motor calcula `volumeVariance = cuotaFija × (capacidadNormal − actividadReal)` sobre **la base de aplicación**, que hoy son horas: `960 × (100 − 95) = 4.800`, no 9.600. Los 9.600 del fixture salen de usar **unidades** como base. La descomposición en tres vías exige aplicar el CIF sobre **horas estándar de la producción real**, concepto que el motor no tiene (`appliedOn: 'actualActivity' \| 'normalCapacity'`, nunca estándar) — y agregarlo **es tocar el motor auditado**, o sea la regla dura 1 del propio plan | **Muy alto.** `AM-05` no es implementable como está. Ver `M7-01` |
| **C8** | §8.1, 🔴 control de suma contra el motor | 🟡 **Incompleto en dos puntos.** (a) El total contra el que compara el tablero es `unitCost.unitFinishedGoodsCost`, que es el renglón **10** del Estado de Costos: `costo neto + EI producción en proceso − EF producción en proceso`. Con producción en proceso, `variable + fijo` **no puede** dar ese total ni con la descomposición perfecta. El control tiene que anclarse al renglón **7f** (`netProductionCost`) y el puente por inventarios de proceso tiene que ser explícito. (b) No dice qué hace la **variación presupuesto** en el split variable/fijo, y está adentro de `realProductionCost` | **Alto.** Sin esto el test de M0 no puede pasar nunca en un período con producción en proceso |
| **C9** | Anexo, pregunta **A** (bloqueante de M7): ¿qué métrica de capacidad ociosa por default? | 🟡 **No está abierta: el corpus ya la contestó.** 🔴 **R22:** *"La capacidad ociosa se reporta como **contribución marginal no obtenida**, en pesos que el empresario recuperaría."* La recomendación de la v1 coincide con la regla; lo que hacía falta era citarla, no elevarla | **Medio.** Desbloquea M7 |
| **C10** | Anexo, pregunta **C**: ¿cuál es el recurso escaso real de la avícola? | 🟡 **Contestada en la bóveda.** `AM17` conclusión 4: *"La única palanca disponible en el tramo actual es la planta de alimento… está **87 % ociosa**"*, y conclusión 5: por peso de capital el alimento rinde **13,3 % mensual** contra **1,71 %** de la gallina con galpón nuevo. Los recursos escasos son **capacidad de galpón** (que ya está topeada) y **capital de trabajo**; el que **no** está escaso es la planta de alimento | **Alto.** `M8-01` tiene caso real para validarse |
| **C11** | Decisión 2: prorrateo de fijos indirectos configurable, `sin_prorrateo` por default | 🟡 Correcta como decisión de producto, pero **suaviza una regla dura**: 🔴 **R17** dice *"los costos fijos indirectos **no se prorratean nunca**. Se anclan al nivel más bajo en que se comportan como directos y el reporte se arma en **cascada por niveles de contribución marginal**"* | **Medio.** Se conserva la decisión, y se agrega la obligación de etiquetar la vista prorrateada como no doctrinaria (§5, regla dura 8) |
| **C12** | §8.4: estado de resultados por costeo variable, un solo nivel de contribución marginal | 🟡 Es el caso de monoproducto. El doctrinal es en **cascada de niveles** (`AM9` §7.4, R17 y R19): CM nivel 1 → menos costos fijos **directos** del segmento → CM nivel 2 → menos fijos indirectos **evitables en fila propia** → CM nivel 3 → menos inevitables → resultado. Y **R19 no se puede cumplir** porque `ConceptoCosteo` de la v1 no tiene el atributo `evitable` (distinto de `erogable`) | **Alto.** Cambia el modelo de datos de M1 y la forma de M3-04 |

---

## 3. Las brechas

### 3.1 Las 14 de la v1 — revalidadas contra `07415de` / `bf70d3d`

Todas se conservan con su numeración original. La columna de la derecha dice qué encontró la re-verificación.

| # | Brecha (v1) | Estado |
|---|---|---|
| **G1** | La clasificación tiene tres baldes (`comportamiento_materia_prima`, `_mano_obra_directa`, `_costos_indirectos`) | ✅ **Confirmada.** `contribucion-marginal.ts`, `CLAVES_COMPORTAMIENTO_CONTRIBUCION` |
| **G2** | La CM se calcula sobre el costo **normal**: excluye amortización, terceros, variación presupuesto y desperdicio | ✅ **Confirmada al pie de la letra.** `calculation-result-enrichment.ts` pasa exactamente tres importes: `rawMaterialConsumed`, `directLaborTotal`, `indirectCostsApplied` |
| **G3** | En el tablero `variable + fijo ≠ total` | ✅ **Confirmada, y hay una segunda causa que la v1 no vio** → ver G17 |
| **G4** | `costoVariableUnitario` divide por unidades **vendidas** | ✅ **Confirmada.** `contribucion-marginal.ts`: `costoVariableTotal.divide(input.unidadesVendidas)`, alimentado con `args.input.sales.quantity` |
| **G5** | Un rubro `SEMIFIJO` deja **toda** la CM en `incompleta` | ✅ **Confirmada.** Y hay una salida doctrinaria mejor que la v1 no usó → ver §5, R13, y `M1-03` |
| **G6** | `resultadoPeriodo` es `grossMargin` (absorción) | ✅ **Confirmada.** `owner-dashboard-service.ts`: `resultadoPeriodo: … completo(resultado.grossMargin, …)` |
| **G7** | `OwnerDashboardService` hardcodea `codigo: 'cajon'` | ✅ **Confirmada** (`tx.unidadMedida.findFirst({ where: { …, codigo: 'cajon' } })`). ❌ **Falso el remedio**: `Company.unidadGestion` no existe → C2 |
| **G8** | `ScenarioSimulator.tsx` calcula su propio PE con supuestos en código | ✅ **Confirmada**, y es peor de lo descripto → ver G21 y G22 |
| **G9** | Falta **erogable / no erogable** | ✅ Confirmada. No existe en `schema.prisma` |
| **G10** | Los gastos de no fabricación (`CostElement.VENTA`) nunca llegan a `calcularContribucionMarginal` | ✅ Confirmada. `CostElement` tiene `MP / MOD / CIP / VENTA` (`schema.prisma:1200`) y el enrichment sólo pasa los tres primeros |
| **G11** | Faltan **costos fijos directos por nivel de segmentación** | ✅ Confirmada |
| **G12** | Falta la familia de fórmulas de PE | ✅ Confirmada. `punto-equilibrio.ts` devuelve sólo `unidadesEquilibrio`. Y le falta más de lo que la v1 lista → ver §8.2 |
| **G13** | Falta consumo de recurso escaso por unidad y CM por línea | ✅ Confirmada |
| **G14** | La variación volumen existe en el motor y nunca corre | 🟡 **Parcialmente falsa.** El motor **sí** emite `volumeVariance` por centro (`detail.indirectCosts.perDepartment[*].volumeVariance`) y **sí** tiene una capacidad ociosa viva, la de MOD → C5. Lo que no existe es la vista de ociosidad de CIP y la métrica del tablero |

**Lo que la v1 acertó y hay que dejar quieto** (se conserva íntegra su tabla §2.1, y la re-verificación la confirma): el `enum ComportamientoCosto` con su comentario doctrinario en `schema.prisma:1208-1217`; `clasificadoPorUserId` / `clasificadoEn` separados de `userId`; la cascada `período → estructura → empresa` en `resolverComportamiento`; la pureza de `contribucion-marginal.ts` y `punto-equilibrio.ts`; el `null` con `motivoSinEquilibrio` cuando `cm ≤ 0`, con su test; el arreglo `motivos`; `VentaProducto.canal` / `.variante` indexados (`schema.prisma:2443-2456`); y `calcVarianceAnalysis` lanzando `MissingInputError` con capacidad normal en cero, con el comentario que explica por qué. Todo eso es bueno y este plan lo usa como cimiento.

### 3.2 ➕ Las 17 brechas nuevas (G15–G31)

| # | Brecha | Evidencia | Regla / doctrina | Fase |
|---|---|---|---|---|
| **G15** | 🔴 **El conversor de pesos a cajones divide por el precio de venta, no por la contribución marginal.** Es un número mal calculado ya en producción | `CosteAR-frontend`, `OwnerDashboardPage.tsx` alimentado con `precioPromedioVenta`; bitácora `docs/sesiones/2026-09-04-93-conversor-pesos-cajones.md`: *"el único cálculo de la herramienta es `importe / precioPorCajon`"* | `AM17` §0.6; `AM5` §5.3 (`CM = CF` es la condición de equilibrio, no `V = CF`) | **MX-01** |
| **G16** | 🔴 **El tablero muestra un costo fijo unitario** (`costoPorCajon.fijo`) | `owner-dashboard-service.ts`: `componentes.filter(FIJO).reduce(…) / baseUnidades * factor` | `AM4` es literalmente *"La falacia del costo fijo unitario"*: *"el 'costo fijo unitario' es una entidad inexistente… establece una comparación entre dos magnitudes absolutamente independientes"*. 🔴 **R10**: los fijos se controlan en **totales** | **MX-02** |
| **G17** | **Segunda causa de G3, independiente:** `.variable` divide por unidades **vendidas** y `.fijo` divide por `period.productionQuantity`. Son dos denominadores distintos en la misma fila | `owner-dashboard-service.ts`, mismo bloque | — | **MX-02 / M0-02** |
| **G18** | **`costoPorCajon.fijo` se devuelve como `completo()` aunque la contribución sea incompleta.** Con un rubro sin clasificar, `.variable` sale `incompleto` y `.fijo` sale con un número seguro que suma sólo los rubros que sí se clasificaron | `owner-dashboard-service.ts`: la rama `fijo:` llama `completo(...)` sin mirar `contribucion.incompleta` | 🔴 **R13**: con costos sin clasificar se informa una **zona**, nunca un punto | **MX-03** |
| **G19** | **La cascada de clasificación resuelve contra el período ABIERTO, no contra el período que se está calculando.** Recalcular un período cerrado usa la clasificación de otro mes | `calculation-result-enrichment.ts`: `db.costPeriod.findFirst({ where: { structureId, status: 'OPEN' } })` y ese `periodId` va al `contexto` de `resolverComportamiento` | Mismo modo de falla que **E1-03** de la auditoría del 06-09 (el formulario que lee el config vivo) | **MX-04** |
| **G20** | **La CM se arma con `indirectCostsApplied` (CIP *aplicado*), no con el real.** Ni la variación presupuesto ni la volumen entran a ninguna vista de costeo variable | `calculation-result-enrichment.ts`, tercer componente; `calculate.ts:128` *"Costo NORMAL: … sin la variación presupuesto"* | 🔴 **R21**: toda comparación reescala el presupuesto al volumen real antes de restar | **M0-01** |
| **G21** | 🔴 **`ScenarioSimulator.tsx` devuelve `Infinity`** cuando el margen no es positivo | `ScenarioSimulator.tsx:90`: `const peEnCajones = margenPorCajon > 0 ? costosFijos / margenPorCajon : Infinity` | Viola la **regla dura 4 de la propia v1** ("nunca un infinito") | **MX-05** |
| **G22** | **El simulador tiene dos bloques con clasificación hardcodeada, no uno.** Además del escenario (`directLabor // fijo`), hay un segundo bloque de plena capacidad: `costoFijoTotal = directLaborTotal + indirectCostsApplied` | `ScenarioSimulator.tsx:73`, `:87-88` y `:137`, `:148` | — | **MX-05** |
| **G23** | ➕ **No existe rango de validez ni tramos.** Un costo fijo sin rango declarado, y un `cm` tratado como escalar | No existe en `schema.prisma` ni en el dominio | 🔴 **R5** (todo fijo declara su rango) · 🔴 **R29** (`cm` es una **tabla de tramos**; todo PE se verifica contra el tramo que lo generó) · 🔴 **R30** (tramo que reemplaza vs. tramo que se acumula) · 🔴 **R31** | **M10-01** |
| **G24** | ➕ **No existe `evitable`**, y no es lo mismo que `erogable` | — | 🔴 **R19** (los fijos indirectos evitables van en fila propia, antes de los inevitables) · 🔴 **R25** (en fabricar-vs-comprar el numerador es el fijo **evitable**) | **M1-01** |
| **G25** | ➕ **`erogable` sin horizonte.** La v1 lo modela como `Boolean?` | — | 🔴 **R7**: *"`erogable/no erogable`… **depende del horizonte del análisis**"* | **M1-01** |
| **G26** | ➕ **No hay precio de transferencia interna**, y la avícola ya tiene una: maíz a $180 de mercado contra $130 de costo | — | 🔴 **R9** / 🔴 **R24**. `AM17` §0.7: *"El precio de transferencia del maíz le agrega **29,9 cajones** a su punto de equilibrio"* | **M13-01** |
| **G27** | ➕ **No hay moneda homogénea ni tasa real.** El PPP de `raw-material.ts` promedia pesos nominales de meses distintos | `raw-material.ts` (PPP) | 🔴 **R33** `tr = (1+tn)/(1+ti) − 1`, nunca `tn − ti` · 🔴 **R34** series en moneda homogénea con momento cero fijo · 🔴 **R35** FIFO/promedio **después** de convertir | **M11-01** |
| **G28** | ➕ **Producción conjunta sin barrera.** `joint-costs.ts` distribuye costos conjuntos por cuatro métodos (absorción). Nada impide que la capa marginal consuma esa distribución | `joint-costs.ts` | 🔴 **R15**: *"en producción conjunta **no se asigna costo a cada coproducto**"* · 🔴 **R16** (desecho = coproducto de precio negativo). Y es el caso de la avícola: `AM17` §0.8, los huevos por tamaño son producción múltiple **condicionada** | **M4-01** |
| **G29** | ➕ **La base de aplicación del CIP es tiempo trabajado** (horas por departamento) | `indirect-costs.ts`, `calcVarianceAnalysis(quota, cipBudget, normalCapacity, actualActivity, …)`; `detail.directLabor.departments[*].budgetedHours` | 🔴 **R11** y 🔴 **R23**: *"la base de aplicación debe medir **eficiencia** (unidades, producto representativo, facturación), **nunca tiempo trabajado**"* | **M7-01** (+ colisión con `O1-02` de Santi, §11) |
| **G30** | ➕ **No hay rotación.** La propia tabla de brechas de la v1 nombra el caso "un comercio con cientos de artículos" y lo manda al PE monetario, que es sólo la mitad | — | 🔴 **R32**: el ranking en un comercio se hace por **`cm/S = Vel × m`**, no por margen | **M14-01** |
| **G31** | **Los seis fixtures de la v1 no tienen dueño en el repo.** No dice en qué archivo viven, con qué runner corren, ni quién los mantiene | — | — | **§9**, resuelto acá |

---

## 4. ➕ Matriz de reglas duras → módulo → test

Esta tabla no estaba en la v1 y es el pedazo que la hace auditable: 🔴 **ningún PR de este plan se mergea sin que la regla que le toca tenga un test con nombre.**

| Regla | Enunciado (abreviado) | Módulo | Test |
|---|---|---|---|
| R1 | El sistema guarda el hecho, no el costo | `ConceptoCosteo` | `M1-01` |
| R2 | `directo/indirecto` y `variable/fijo` son ortogonales | `ConceptoCosteo` | `M1-01` |
| R3 | Todo costo directo/indirecto/evitable declara su objeto de costo | `ConceptoCosteo.nivelSegmentacion` | `M1-01` |
| R4 | Fijo/variable se define por **causalidad**, no por variabilidad observada | UI de clasificación | `M1-02` |
| R5 | Todo fijo declara su **rango de actividad** | `ConceptoCosteo.rangoDesde/Hasta` | `M10-01` |
| **R6** | Amortización: fija si la causa es el tiempo | Clasificación del plantel | **`M0-01` · `AM-01`** |
| R7 | `erogable` depende del **horizonte** | `ConceptoCosteo.erogable` + `horizonteMeses` | `M1-01` · `M3-03` |
| **R8** | Ningún fijo entra al `cv` por cuota de aplicación | `contribucion-marginal.ts` | **`M0-01`** |
| R9 | Transferencias internas a costo variable o precio en bloque | `M13` | `AM-11` |
| R10 | Fijos en totales; variables en unitarios | Tablero | **`MX-02`** |
| R11 | La base de aplicación mide eficiencia, nunca tiempo | CIP | `M7-01` |
| R12 | El beneficio se planifica en absolutos o % sobre capital. **Nunca % sobre ventas** | `M3-02` | `M3-02` |
| **R13** | Con costos sin clasificar: **zona** de equilibrio, no punto | `punto-equilibrio.ts` | **`M1-03` · `AM-07`** |
| R14 | Absorción es vista de salida; el motor razona en variable | Arquitectura, §6 | — |
| R15 | En conjunta no se asigna costo a cada coproducto | `M4` | `M4-01` |
| R16 | Desecho con costo de eliminación = coproducto de precio negativo | `M4` | `M4-01` |
| R17 | Los fijos indirectos **no se prorratean nunca** | `M3-04` cascada | `AM-12` |
| R18 | Cada línea expone su PE específico contra su cuota | `M4-01` | `AM-02` |
| R19 | Fijos indirectos **evitables** en fila propia, antes de los inevitables | `M3-04` | `AM-12` |
| R20 | No cerrar línea con CM bruta positiva mientras el CFD sea inevitable | `M4-01` (texto de pantalla) | `M4-01` |
| R21 | Reescalar el presupuesto al volumen real antes de restar | `indirect-costs.ts` ✅ ya cumple | regresión |
| **R22** | Capacidad ociosa = **contribución marginal no obtenida** | `M7-01` | **`AM-05`** |
| R23 | (= R11) | | |
| R24 | Transferencias a precio de mercado de la etapa | `M13-01` | `AM-11` |
| R25 | Dejar de fabricar: fijo **evitable** y materiales a precio de **liquidación** | `M6-01` | `M6-01` |
| R26 | El ranking por rentabilidad es **dinámico** | `M8-01` | `AM-06` |
| R27 | Cada producto declara su consumo de cada recurso escaso | `M8-01` | `AM-06` |
| R28 | Con >1 restricción activa: programación lineal | `M8-01` / `M9-01` | `M8-01` |
| **R29** | El `cm` es una **tabla de tramos**; todo PE se verifica contra su tramo | `M10-01` | **`AM-09`** |
| R30 | Tramo que **reemplaza** vs. tramo que **se acumula** | `M10-01` | `AM-09` |
| R31 | Antes de ampliar: el punto de resultado indiferente no puede quedar pegado al techo | `M10-01` | `AM-09` |
| R32 | Ranking de comercio por `cm/S = Vel × m` | `M14-01` | `AM-13` |
| R33 | `tr = (1+tn)/(1+ti) − 1` | `M11-01` | `AM-10` |
| R34 | Series en moneda homogénea, momento cero fijo | `M11-01` | `AM-10` |
| R35 | FIFO/promedio **después** de convertir | `M11-01` | `AM-10` |

---

## 5. Qué entra, qué no, y las reglas duras de la fase

### Entra (se conserva lo de la v1 y se agrega)

- **Ola A (`MX`)** ➕ — los números que ya se muestran mal. No existía en la v1.
- **M0 a M3** — cerrar las brechas de B1, el modelo de conceptos, los gastos de no fabricación, y la familia de PE + punto de cierre + estado de resultados variable. *(v1, corregido)*
- **M4 y M5** — motor genérico de segmentación y relaciones de reemplazo. *(v1)*
- **M6 a M9** — punto de indiferencia, capacidad ociosa, mezcla óptima, programación lineal. *(v1)*
- **M10 a M14** ➕ — tramos y fractura de fijos, moneda homogénea, producción a pedido, transferencias internas, rotación. No existían en la v1 y salen del corpus que la v1 declara como doctrina.

### No entra, y por qué (se conserva la tabla de la v1, con una corrección)

| Qué queda afuera | Criterio |
|---|---|
| Presupuesto de producción y presupuesto base cero (resto del bloque 8) | Igual que la v1: necesita política de stock y presupuesto de ventas. Entra sólo la rebanada de gastos de no fabricación (M2) |
| Costos estándar | 🟡 **Matizado.** La v1 lo descarta porque "cambiar eso toca el motor auditado". Correcto — **pero** `M7-01` (tres desvíos) necesita horas estándar, así que la exclusión hay que leerla junto con C7: o M7 se limita a dos vías, o el estándar entra y deja de ser una exclusión |
| Reescribir `ScenarioSimulator.tsx` entero | Igual que la v1: tiene issue propio (`CosteAR-frontend#94`). **Pero** `MX-05` sí toca dos cosas puntuales de ese archivo (el `Infinity` y los dos bloques hardcodeados), porque son bugs, no rediseño |
| Programación lineal para 2+ recursos | Igual que la v1: M9, después de medir con M8 |

### 🔴 Reglas duras de toda la fase

Las siete de la v1 se conservan **textualmente**:

1. **No se toca el motor auditado.** `calculate.ts`, `cost-statement.ts`, `indirect-costs.ts`, `joint-costs.ts` y `raw-material.ts` se leen. La capa nueva consume su salida.
2. **Nada hardcodeado.** Todo umbral, margen, método o unidad se resuelve por catálogo con cascada `período → estructura → empresa → default del rubro`. Un default del catálogo nunca cuenta como confirmado.
3. **Ninguna migración cambia el comportamiento de una fila existente.** `NULL` conserva el comportamiento histórico.
4. **Si el denominador de cualquier fórmula es cero o negativo, el equilibrio no existe.** Se devuelve `null` con motivo, nunca un número forzado ni un infinito.
5. **Un resultado contable negativo no implica cierre.** El cierre lo marca el punto de cierre (caja).
6. **Ninguna vista de Costeo Completo con prorrateo se muestra sola** cuando la conclusión posible es "eliminá esta línea".
7. **Cifras inventadas** en todos los fixtures.

Y se agregan cinco ➕:

8. 🔴 **Toda vista prorrateada se rotula como no doctrinaria.** R17 dice que los fijos indirectos no se prorratean nunca. La decisión 2 los permite como vista configurable; el precio de esa decisión es que la pantalla diga, en la propia vista, que el prorrateo es una convención de presentación y no una asignación económica.
9. 🔴 **Ningún costo fijo se muestra dividido por unidades.** R10 y `AM4`. Si una pantalla necesita "cuánto de fijo hay por cajón", lo que necesita en realidad es **cuántos cajones tapan ese fijo**, y eso se contesta con `CF / cm`, no con `CF / Q`.
10. 🔴 **Todo punto de equilibrio se devuelve junto con el tramo que lo generó y su techo.** Si el `Q` calculado cae fuera del rango de validez, el resultado es `null` con `motivoFueraDeTramo`, más el `Q` del tramo siguiente si existe. R29. **Sin esto, el sistema le va a mostrar a Augusto un equilibrio de 598,5 cajones en un galpón que da 475,7.**
11. 🔴 **Toda cifra que se compara entre períodos viaja en moneda homogénea.** R34. Mientras M11 no exista, cualquier serie de más de un período lleva un cartel de "pesos nominales".
12. 🔴 **Ningún objetivo de resultado se expresa como porcentaje de las ventas.** R12, con el ejemplo de Yardín en el que el empresario cumple su objetivo sobre ventas y su situación empeora a la mitad. La API lo rechaza con 422, no lo convierte en silencio.

---

## 6. Dónde entra esta capa

Se conserva el diagrama de la v1 y se le agrega la capa 0, que es donde vive la Ola A.

```
┌─────────────────────────────────────────────────────────────┐
│ CAPA 1 · NÚCLEO — no se toca                                │
│ calculate.ts · cost-statement.ts · indirect-costs.ts ·      │
│ joint-costs.ts · raw-material.ts · períodos · RLS ·         │
│ trazabilidad · validación                                   │
│                                                             │
│ Emite: CalculationOutput                                    │
│   · productionCost (NORMAL)                                 │
│   · budgetVariance? · thirdPartyWork? · assetDepreciation?  │
│   · realProductionCost? (7c) · desperdicio? · netProduction │
│   · detail.unitCost{unitProductionCost,                     │
│       unitFinishedGoodsCost, unitCostOfGoodsSold, basadoEn} │
│   · detail.directLabor.idleCapacity  ← ➕ YA EXISTE (C5)     │
│   · detail.indirectCosts.perDepartment[*]                   │
│       {quota, quotaFixed, quotaVariable, budgetVariance,    │
│        volumeVariance, appliedOn, pendingClosing}           │
└──────────────────────────┬──────────────────────────────────┘
                           │ (lee el resultado ya emitido)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ CAPA 2 · CLASIFICACIÓN — dato del tenant, no código         │
│ ConceptoCosteo (comportamiento · erogable+horizonte ·       │
│   evitable ·  directo de qué segmento · rango de validez)   │
│ TramoSemifijo · TramoCosto ➕ · SegmentoAnalisis ·           │
│ RecursoEscaso + ConsumoRecursoPorUnidad ·                   │
│ PrecioTransferencia ➕ · SerieMonedaHomogenea ➕             │
│                                                             │
│ Cascada de ParametroCosteo:                                 │
│ período → estructura → empresa → default del rubro          │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ CAPA 3 · ANÁLISIS — funciones puras, sin base de datos      │
│ contribucion-marginal.ts (ampliado) ·                       │
│ punto-equilibrio.ts (ampliado + zona R13 + tramos R29) ·    │
│ punto-de-cierre.ts · estado-resultados-variable.ts          │
│   (en cascada de niveles, R17/R19) ·                        │
│ equilibrio-sectorial.ts · relacion-de-reemplazo.ts ·        │
│ punto-de-indiferencia.ts · mezcla-optima.ts ·               │
│ capacidad-ociosa.ts · tramos.ts ➕ · moneda-homogenea.ts ➕  │
│ cotizacion-a-pedido.ts ➕ · rotacion.ts ➕                   │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ CAPA 0 · PRESENTACIÓN — donde hoy están los errores vivos   │
│ calculation-result-enrichment.ts · owner-dashboard-service  │
│ OwnerDashboardPage.tsx · ScenarioSimulator.tsx              │
│ 🔴 Ningún módulo nuevo calcula por su cuenta desde una ruta │
└─────────────────────────────────────────────────────────────┘
```

**Por qué `calculation-result-enrichment.ts` sigue siendo el único punto de costura.** Su propio comentario lo dice: corrida y simulación pasan por ahí *"para que no puedan resolver una clasificación, una incompletitud o un punto de equilibrio de forma distinta"*. ➕ **Y hoy no lo cumple**: `ScenarioSimulator.tsx` resuelve su propio PE (G8) y el conversor de pesos resuelve el suyo con el precio (G15). La Ola A es, en una frase, **hacer verdadera esa promesa antes de apoyarse en ella**.

---

## 7. Modelo de dominio

🔴 Todo parametrizable por tenant. Lo que vive en código son los **defaults del rubro**, con `confirmado = false`.

### 7.1 `ConceptoCosteo` — rompe G1, G9, G11, y ➕ G24, G25, G23

Se conserva la tabla de la v1 y se le agregan cuatro campos.

| Campo | Tipo | Para qué |
|---|---|---|
| `companyId`, `userId` | uuid | Tenant y RLS, denormalizado |
| `structureId`, `periodId` | uuid? | Cascada de `ParametroCosteo`; `NULL` = vale para todo lo de arriba |
| `clave` | string | Estable, snake_case: `cip_energia`, `amortizacion_plantel` |
| `elemento` | `CostElement` | `MP / MOD / CIP / VENTA`. Ancla el concepto al renglón del motor |
| `comportamientoVolumen` | `ComportamientoCosto?` | El enum que ya existe. `NULL` = sin clasificar |
| `erogable` | `Boolean?` | **G9.** `NULL` = sin declarar |
| ➕ `horizonteErogableMeses` | `Int?` | **G25 · R7.** Un costo es no erogable *dentro de un horizonte*. Sin el horizonte, `erogable` no significa nada: una indemnización es no erogable a 30 días y erogable a 12 meses |
| ➕ `evitable` | `Boolean?` | **G24 · R19 · R25.** Distinto de `erogable`: un alquiler con contrato es erogable e **in**evitable. Es la fila propia del estado de resultados en cascada y el numerador de fabricar-vs-comprar |
| `nivelSegmentacion` | string? | A qué nivel es **directo**: `empresa / division / canal / linea`. `NULL` = indirecto común |
| `segmentoId` | uuid? | Qué segmento concreto |
| ➕ `causaVariabilidad` | enum? | **R4 · R6.** `volumen / tiempo / intensidad_de_uso / precio / contrato / otra`. Es lo que impide volver a clasificar la amortización del plantel como variable: su causa es `tiempo` |
| ➕ `rangoActividadDesde`, `rangoActividadHasta` | Decimal? | **R5 · G23.** El rango dentro del cual la afirmación "esto es fijo" vale. Fuera de él, el concepto salta al tramo siguiente |
| `clasificadoPorUserId`, `clasificadoEn` | uuid?, timestamptz? | Mismo par que `ParametroCosteo` |
| `confirmado` | Boolean | Lo dijo el cliente |

🔴 **Compatibilidad hacia atrás, igual que en la v1.** Los tres baldes de B1 siguen siendo el caso degenerado: una empresa sin ningún `ConceptoCosteo` resuelve exactamente como hoy. La migración **no crea** conceptos.

➕ 🔴 **Regla nueva de validación:** un `ConceptoCosteo` con `comportamientoVolumen = VARIABLE` y `causaVariabilidad ≠ volumen` es un error de validación (422 accionable), no un dato. Es R4 y R8 convertidos en código, y es lo que hace imposible repetir C1.

### 7.2 `TramoSemifijo` — cierra G5 *(sin cambios respecto de la v1)*

| Campo | Para qué |
|---|---|
| `conceptoId` | El concepto `SEMIFIJO` que se parte |
| `porcionFija`, `porcionVariable` | Decimal(18,6). Deben sumar el importe; si no, error de validación |
| `metodo` | `PUNTOS_EXTREMOS / CORRELACION / DISPERSION_GRAFICA / DECLARADO` (`AM3`) |
| `observacionesBase` | Los pares (volumen, importe) que alimentaron el método |

### 7.3 ➕ `TramoCosto` — cierra G23 (nuevo)

El modelo que la v1 no tiene y sin el cual el primer cliente recibe un número imposible.

| Campo | Para qué |
|---|---|
| `conceptoId` o `segmentoId` | Qué se fractura |
| `desde`, `hasta` | Rango de actividad del tramo |
| `tipo` | 🔴 **R30.** `REEMPLAZA` (el valor nuevo rige para toda la actividad) o `ACUMULA` (escalón que se suma). Son fórmulas distintas y confundirlas cambia el resultado |
| `importeFijo`, `cmUnitaria` | Los parámetros vigentes en ese tramo |
| `techoFisico` | La capacidad física del tramo. Es lo que convierte "598,5 cajones" en "no existe en este tramo" |

### 7.4 `SegmentoAnalisis` — bloques 5, 6 y 7 *(v1, con una precisión)*

Jerárquico con `parentId`: empresa → división → canal → línea/variante. Se puebla desde `VentaProducto.canal` y `.variante`, que ✅ existen e ✅ están indexados (`schema.prisma:2456`).

➕ 🔴 **Barrera de producción conjunta (R15/R16, G28).** Un `SegmentoAnalisis` marcado `produccionConjunta = true` **no acepta un costo variable propio**: sus costos son del proceso, y los coproductos entran como ingresos ponderados por rendimiento. Es el caso de los huevos por tamaño (`AM17` §0.8: producción múltiple **condicionada** — no hay decisión que produzca un jumbo sin producir un n.º 3). Sin esta barrera, alguien va a consumir la distribución de `joint-costs.ts` desde la capa marginal y el número va a estar mal sin que se note.

### 7.5 `RecursoEscaso` y `ConsumoRecursoPorUnidad` — bloque 4 *(v1)*

- `RecursoEscaso`: `clave`, `unidadId`, `disponibleEnPeriodo`, `esCuelloDeBotellaActivo`.
- `ConsumoRecursoPorUnidad`: `recursoId`, `segmentoId`, `consumoPorUnidad`.
- El capital de trabajo entra como un recurso más, misma tabla, otra unidad.

🔴 **Advertencia de UX, obligatoria (v1, se conserva):** el ranking por CM por recurso escaso **no se muestra por default**. Sólo con `esCuelloDeBotellaActivo = true`. R26: el ranking es **dinámico**, se calcula contra el recurso que efectivamente restringe.

### 7.6 ➕ `PrecioTransferencia` — cierra G26 (nuevo)

`segmentoOrigenId`, `segmentoDestinoId`, `conceptoId`, `criterio` (`MERCADO / COSTO_VARIABLE / PRECIO_EN_BLOQUE`), `valor`, `periodId`. 🔴 R24: para el estado de resultados por sector se valúa a **precio de mercado de la etapa**; 🔴 R9: para la **decisión** marginal se usa el costo variable. Los dos números conviven y la pantalla muestra los dos, porque `AM17` §0.7 demuestra que la diferencia mueve el PE en 29,9 cajones.

### 7.7 Parámetros nuevos del catálogo

Se conservan los cinco de la v1 y se agregan seis.

| Clave | Default | Nota |
|---|---|---|
| `modo_prorrateo_fijos_indirectos` | `sin_prorrateo` | Decisión 2 |
| `margen_marcacion_default` | — | Por familia de productos |
| `metodo_capacidad_ociosa` | `contribucion_no_generada` | ✅ **Ya no es 🟡**: R22 lo decide (C9) |
| `tasa_costo_capital_mensual` | — | El `i` del planeamiento de resultados |
| `capital_fijo_invertido` | — | El `Kf` |
| ➕ `capital_por_peso_de_costo_variable` | — | El **`a`** de `AM5` §5.8.3. Sin él la fórmula de resultado relativo no se puede escribir, y la v1 lo omite |
| ➕ `horizonte_punto_de_cierre_meses` | `12` | R7 |
| ➕ `indice_precios_serie` | — | R34, momento cero fijo |
| ➕ `tasa_interes_nominal_mensual` | — | R33 |
| ➕ `techo_fisico_tramo_actual` | — | R29/R31. Para la avícola: la capacidad del galpón |
| ➕ `velocidad_rotacion_default` | — | R32 |

---

## 8. Fórmulas exactas

Notación de `AM7`: `pv` precio unitario · `cv` costo variable unitario · `cm = pv − cv` · `CF` fijos totales · `Q` cantidad · `V` ventas monetarias · `m` margen de marcación (tanto por uno) · `R` resultado pretendido · `i` tasa de beneficio sobre capital · `Kf` capital fijo · `a` capital por peso de costo variable.

### 8.1 Base corregida (M0) — cierra G2, G3, G4, ➕ G17, G20

```
CV_produccion_total = Σ conceptos VARIABLE de elemento MP/MOD/CIP
                    + porcionVariable de cada concepto SEMIFIJO
                    + trabajos de terceros clasificados VARIABLE
                    + la parte de la variación presupuesto clasificada VARIABLE   ← ➕ C8(b)

CF_produccion_total = Σ conceptos FIJO de elemento MP/MOD/CIP
                    + porcionFija de cada SEMIFIJO
                    + amortización de activos            ← 🔴 acá, no en el variable (C1, R6, R8)
                    + la parte de la variación presupuesto clasificada FIJA

cv_produccion       = CV_produccion_total / unidades PRODUCIDAS      ← nunca vendidas (G4)
cv_comercializacion = CV_venta_total      / unidades VENDIDAS
cv                  = cv_produccion + cv_comercializacion
```

🔴 **Control de suma, y es un test (corregido, C8):**

```
Σ importes de TODOS los conceptos de elemento MP/MOD/CIP
      = netProductionCost   (renglón 7f del Estado de Costos)
      = realProductionCost − wasteRecovery − extraordinaryLoss

Σ importes de TODOS los conceptos, incluidos los de elemento VENTA
      = netProductionCost + gastos de no fabricación del período
```

➕ **Y el puente por inventarios de proceso, que la v1 no tenía:**

```
unitCost.unitFinishedGoodsCost × unidades terminadas
      = netProductionCost + EI producción en proceso − EF producción en proceso
```

🔴 Por eso el tablero **no** puede cerrar `variable + fijo = total` contra `unitFinishedGoodsCost`: con producción en proceso son magnitudes distintas por definición. El control se ancla a **7f**, y el tablero muestra el puente como una fila, no lo esconde.

### 8.2 Familia de punto de equilibrio (M3, bloque 1)

Se conservan las siete fórmulas de la v1 y se agregan los despejes de `AM5` §5.6 y §5.8.2, que son features de producto y no adorno.

```
Físico:                    Q  = CF / cm
Monetario por razón:       V  = CF / RC          con RC = cm / pv
Monetario por marcación:   V  = CF · (1 + m) / m
Razón de contribución:     RC = cm / pv          y   RC = m / (1 + m)     ← ➕
Utilidad objetivo:         Qr = (CF + R) / cm
                           Vr = (CF + R) · (1 + m) / m
Multiproducto:             Q  = CF / (a·cm_a + b·cm_b + … + n·cm_n)
```

➕ **Los despejes** (`AM5` §5.6 y §5.10), cada uno con su pregunta de negocio:

```
Costo fijo máximo soportable:   CF = Q · cm            «¿cuánta estructura aguanto?»
Precio de venta necesario:      pv = CF/Q + cv         «¿a cuánto tengo que vender?»
Costo variable máximo:          cv = pv − CF/Q         «¿cuánto puedo pagar el alimento?»
Resultado del nivel actual:     R  = Q · cm − CF
Costo fijo con resultado:       CF = Qr · cm − R
Margen de marcación necesario:  m  = (CF + R) / (Vr − CF − R)
```

➕ **Planeamiento de resultados en % sobre capital invertido** (`AM5` §5.8.3 y §5.8.5) — la v1 lista los parámetros `Kf` e `i` pero **nunca escribe la fórmula**, y omite `a` por completo:

```
Físico:      Qr = (CF + i·Kf + i·CF) / (pv − cv − i·a·cv)
Monetario:   Vr = (i·Kf + i·CF + CF) · (1 + m) / (m − i·a)
```

donde `a` es el capital que requiere una unidad monetaria de costo variable. Verificación del libro, que es el test: `Kf=30.000, CF=8.000, cv=30, pv=100, a=0,25, i=0,10` → `Qr = 11.800 / 69,25 = 170,40`, y el resultado logrado da **3.927,80**, exactamente el pretendido.

🔴 **Si `cm ≤ 0`, o `m ≤ 0`, o `RC ≤ 0`, el equilibrio NO EXISTE.** `null` con `motivoSinEquilibrio`. Nunca infinito (G21).
➕ 🔴 **Si `Q` cae fuera del rango del tramo vigente, tampoco existe.** `null` con `motivoFueraDeTramo`, más el `Q` del tramo siguiente. Regla dura 10, R29.
➕ 🔴 **`R` expresado como % de ventas se rechaza con 422.** Regla dura 12, R12.

### 8.3 ➕ Zona de equilibrio con clasificación incompleta (M1, R13)

La v1 devuelve el tablero en blanco cuando falta clasificar (G5, G18). El corpus manda otra cosa:

```
Q_min = CF_min / cm_max     con los conceptos sin clasificar supuestos TODOS variables
Q_max = CF_max / cm_min     con los conceptos sin clasificar supuestos TODOS fijos
```

Se informa el intervalo `[Q_min , Q_max]` con la lista de conceptos que lo ensanchan y cuánto aporta cada uno. 🔴 Es una **zona**, no un punto: la pantalla no puede mostrar un solo número mientras el intervalo tenga ancho. Ver `AM-07`.

### 8.4 Punto de cierre (M3, bloque 2) *(v1, con el horizonte agregado)*

```
CFE = Σ costos fijos con erogable = true, dentro del horizonte declarado    ← ➕ R7
cve = Σ costos variables unitarios con erogable = true
cmf = pv − cve                                  ← contribución marginal financiera
Qf  = CFE / cmf
```

🔴 **El reemplazo es universal** (`AM5` §5.9): `CF → CFE` y `cv → cve` aplica a **todas** las fórmulas de §8.2, no sólo a la del equilibrio.

🔴 **Texto obligatorio en pantalla, con estas palabras:** *un resultado negativo no significa que haya que cerrar*. Entre `Qf` y `Q` la empresa pierde económicamente y sostiene la caja.

### 8.5 Estado de resultados variable — ➕ en cascada de niveles (M3, bloque 9, C12)

La v1 tiene el de un nivel. Se conserva como el caso de monoproducto, y se generaliza:

```
Ventas
− Costo variable de producción de lo VENDIDO
− Costo variable de comercialización
= CONTRIBUCIÓN MARGINAL — NIVEL 1                       (por línea y total)
− Costos fijos DIRECTOS de la línea
= CONTRIBUCIÓN MARGINAL — NIVEL 2                       ← la alarma de R18
− Costos fijos indirectos EVITABLES  (fila propia, R19) ← ➕ requiere ConceptoCosteo.evitable
= CONTRIBUCIÓN MARGINAL — NIVEL 3
− Costos fijos indirectos INEVITABLES
= RESULTADO
```

🔴 **Valuación de la existencia final: únicamente costo variable de PRODUCCIÓN.** Nunca el gasto variable de venta. Es el error frecuente y `AM-01` lo prueba con el número equivocado nombrado.
🔴 **La carga fabril fija no se prorratea por lo vendido:** el 100 % del período va al estado de resultados.
🔴 **Los fijos indirectos no bajan a las líneas** (R17). La columna "total" es la única que los ve.
Absorción y costeo variable coinciden **sólo** si se vende todo lo producido; cuando no, se muestran las dos cifras y la diferencia explicada por la variación de inventarios.

### 8.6 Equilibrio sectorial y específico (M4, bloque 5) *(v1, íntegro)*

```
PE específico de un segmento:   Q_esp = CFD_segmento / cm_segmento
PE general con fijos directos:  Q_gen = (CFI + Σ CFD_i) / (a·cm_a + … + n·cm_n)
Diagnóstico del segmento i:     cuota_i     = participación_i · Q_gen
                                excedente_i = cuota_i − Q_esp_i
```

`excedente_i < 0` = la línea no cubre ni sus propios fijos directos dentro del equilibrio general.

🔴 **Dos advertencias que van en la pantalla:** (1) un déficit calculado sobre una vista **con** prorrateo puede ser artefacto del prorrateo — por eso la vista sin prorrateo va siempre al lado; (2) **mientras la CM bruta siga siendo positiva y el fijo directo sea inevitable, la línea se mantiene** (R20).

Versión monetaria: `V_esp = CFD · (1 + m) / m`, con `m` promedio ponderado por participación **en costos variables**. Si el dato es participación en **ventas**, se convierte dividiendo cada una por `(1 + m)` de su línea y normalizando.

### 8.7 Relaciones de reemplazo (M5, bloque 6) *(v1, íntegro)*

```
RR_a/b = cm_a / cm_b            unidades de b por cada unidad de a que se pierde
Compensación = ΔQ_a · RR_a/b

Corto plazo (la línea que cae MANTIENE su estructura):
  Q_b = (CFD_a + CFD_b + CFI + R) / cm_b
Largo plazo (la línea que cae se DESMANTELA):
  Q_b = (CFD_b + CFI + R) / cm_b
```

🔴 Nunca conviene sostener una línea por debajo de su PE específico. 🔴 La API devuelve **las dos** cifras; una sola no cumple.

### 8.8 Punto de indiferencia (M6, bloque 7) *(v1, con R25 agregado)*

```
Q_indiferencia = (CF_a − CF_b) / (cv_b − cv_a)
```

Un solo módulo parametrizable: fabricar vs. comprar, mayorista vs. detalle, vender en bruto vs. seguir procesando, alta vs. baja tecnología.

🔴 Si `cv_b = cv_a` no hay punto de indiferencia: una estructura domina a la otra en todo el rango. Se dice eso, no se devuelve infinito.
➕ 🔴 **R25, en la decisión inversa** (dejar de fabricar para comprar): el numerador es el **costo fijo evitable** —no el fijo total— y los materiales en existencia se valúan a **precio de liquidación**, no de reposición. La v1 nombra los "costos remanentes" pero no dice cómo se valúan.

### 8.9 Capacidad ociosa (M7, bloque 3) — corregido (C5, C7, C9)

**Métrica por default, decidida:** 🔴 **R22** — contribución marginal no obtenida.

```
Ociosidad (Costeo Variable) = (capacidad normal − actividad real) × cm
```

**Vista secundaria, bajo Costeo Completo — y acá está la corrección de C7:**

```
Dos vías (lo que el motor YA calcula, base = actividad real):
  Variación presupuesto = CIP real − presupuesto ajustado al nivel real     ✅ existe
  Variación volumen     = cuota fija × (capacidad normal − actividad real)  ✅ existe
  🔴 Control: presupuesto + volumen = −(aplicado − real)                    ✅ ya testeado

Tres vías (uso de capacidad + eficiencia) — 🔴 NO ES IMPLEMENTABLE HOY:
  Uso de capacidad = (base presupuestada − base real)     × cuota fija
  Eficiencia       = (base real − base ESTÁNDAR para la producción real) × cuota fija
  Uso + eficiencia = cuota fija × (base presupuestada − base estándar)
```

🔴 **La descomposición en tres vías exige una base estándar que el motor no tiene** (`appliedOn` sólo admite `'actualActivity' | 'normalCapacity'`), y agregarla cambia el CIF aplicado, o sea el motor auditado. Además 🔴 **R11/R23** dicen que la base debería medir **eficiencia (unidades)** y no tiempo, que es lo que hoy usa. Por eso `M7-01` entrega las **dos vías** más la métrica de R22, y las tres vías quedan como dependencia declarada de la tarea `O1-02` de Santi (§11).

➕ **Y hay una fuente que ya está viva y hay que enchufar, no construir (C5):** `detail.directLabor.idleCapacity` da `idleHours`, `idleCost`, `applicableMod`, el desglose por tipo de improductividad y una alerta ya redactada. La capacidad ociosa de **mano de obra** ya existe; la de **CIP** no. El tablero tiene que mostrar las dos y no sumarlas sin decirlo.

### 8.10 Mezcla óptima (M8, bloque 4) *(v1, íntegro)*

```
cme_i = cm_i / consumo_de_recurso_por_unidad_i
```

Un recurso escaso: ordenar por `cme` descendente, asignar hasta agotar recurso o demanda, recortar y eliminar en cascada. 🔴 Con dos o más recursos activos el atajo deja de valer (R28): el sistema **detecta** y **dice que no puede**, no aplica la heurística igual.

### 8.11 ➕ Tramos y fractura de costos fijos (M10, `AM14`) — nuevo

```
PE por tramo:                  Q_t = CF_t / cm_t     ,  válido sólo si  desde_t ≤ Q_t ≤ hasta_t
Punto de resultado indiferente: Qn = (Ra + CFn) / cm
```

`Ra` = resultado máximo alcanzable con la estructura **actual** (= `techo_t · cm_t − CF_t`). 🔴 **R31:** para que convenga abordar el tramo siguiente hay que **superar** `Qn`, y `Qn` no puede quedar pegado al techo del tramo nuevo.
🔴 **R30:** distinguir el tramo que **reemplaza** el valor para toda la actividad del que **se acumula** por escalones. Son fórmulas distintas.
🔴 **R29:** el resultado de cualquier PE viaja con el tramo que lo generó. **Puede haber varios puntos de equilibrio, tramos enteros inoperables, y ningún punto de equilibrio.** Es exactamente el caso del primer cliente.

### 8.12 ➕ Moneda homogénea y costos financieros (M11, `AM16`) — nuevo

```
Tasa real:   tr = (1 + tn) / (1 + ti) − 1        🔴 NUNCA  tn − ti          (R33)
Serie:       valor_homogéneo = valor_nominal × (índice_0 / índice_t)        (R34)
Valuación:   FIFO / LIFO / PPP se aplican DESPUÉS de convertir              (R35)
```

### 8.13 ➕ Cotización de producción a pedido (M12, `AM18`) — nuevo

```
🔴 B = (cm_1 + cm_2 + … + cm_n) − CF        el beneficio existe a nivel EMPRESA
🔴 No existe "la ganancia de esta obra"
```

La mano de obra asignada a un pedido es **fija y directa**: se imputa a la obra pero no varía con ella. Es la celda que rompe el método tradicional de "costo + prorrateo + %".

### 8.14 ➕ Rotación y ranking de comercio (M14, `AM15`/R32) — nuevo

```
cm/S = Vel × m        Vel = rotación del stock en el período
```

🔴 El ranking de artículos de un comercio se hace por `cm/S`, **nunca por margen**. Un artículo de margen 20 % que rota 12 veces le gana a uno de 60 % que rota 2.

---

## 9. Criterios de aceptación — un caso numérico por módulo

🔴 **Números inventados, con clave de respuesta.** Un módulo sin su fixture verde no está entregado.

➕ **Dónde viven, que la v1 no decía (G31):** `tests/fixtures/analisis-marginal/AM-XX.json` en `CosteAR-backend`, con el runner de `tests/domain/`. Cada JSON trae `input`, `expected` y `porQue` (la cita de doctrina). 🔴 Un fixture no se edita para que el test pase: si el número cambia, cambia con un ADR que diga por qué.

### 9.1 `AM-01` — producción simple *(v1, con el control de suma corregido)*

| Dato | Valor |
|---|---|
| Unidades producidas | 1.000 |
| Unidades vendidas | 800 |
| Precio de venta unitario | 500 |
| MP consumida | 150.000 — VARIABLE, erogable |
| MOD | 60.000 — FIJO, erogable |
| CIP aplicados | 90.000 — SEMIFIJO: 54.000 variable / 36.000 fijo, erogables |
| Amortización de activos | 40.000 — **FIJO** (causa: tiempo), **no erogable** |
| Trabajos de terceros | 10.000 — VARIABLE, erogable |
| Gasto variable de comercialización | 30 por unidad **vendida**, erogable |
| Gastos fijos de administración | 56.000 — FIJO, erogable |

**Clave de respuesta:**

| Magnitud | Valor | Cómo se obtiene |
|---|---|---|
| Costo variable de producción total | **214.000** | 150.000 + 54.000 + 10.000 |
| `cv_produccion` | **214** | 214.000 ÷ **1.000 producidas**. Si sale 267,50 dividió por las vendidas: es G4 |
| `cv` total unitario | **244** | 214 + 30 |
| `cm` unitaria | **256** | 500 − 244 |
| `CF` totales | **192.000** | 60.000 + 36.000 + 40.000 + 56.000 |
| **PE físico** | **750 unidades** | 192.000 ÷ 256 |
| **PE monetario** | **375.000** | 192.000 ÷ 0,512, y 750 × 500 da lo mismo |
| Razón de contribución | **0,512** | 256 ÷ 500 |
| **Punto de cierre** | **593,75 unidades** | (192.000 − 40.000) ÷ 256 |
| Resultado por costeo variable | **12.800** | 400.000 − 171.200 − 24.000 − 192.000; también (800 − 750) × 256 |
| **Existencia final de terminados** | **42.800** | 200 × 214. 🔴 Si sale **48.800** incluyó el gasto variable de venta |
| Utilidad objetivo de 64.000 | **1.000 unidades** | (192.000 + 64.000) ÷ 256 |
| ➕ Costo fijo máximo soportable a 800 u | **204.800** | 800 × 256. «¿cuánta estructura aguanto?» |
| ➕ `pv` necesario para equilibrar a 600 u | **564** | 192.000/600 + 244 |
| ➕ `cv` máximo para equilibrar a 600 u | **180** | 500 − 192.000/600 |

🔴 **Control de suma (M0) — CORREGIDO (C6):**

```
Σ conceptos MP/MOD/CIP        = 150.000 + 60.000 + 90.000 + 10.000 + 40.000 = 350.000
                              = netProductionCost (sin desperdicio en este fixture)
Σ TODOS los conceptos         = 350.000 + 24.000 (comerc. variable) + 56.000 (admin) = 430.000
                              = 214.000 (CV prod) + 24.000 (CV comerc) + 192.000 (CF)
```

❌ La v1 decía **406.000**. Le falta el costo variable de comercialización de **24.000**, que su propio fixture declara. 🔴 Si el test se escribe contra 406.000, pasa con la descomposición mal.

➕ **Sub-fixture `AM-01b` — margen de marcación.** Con `CF = 192.000` y `m = 0,60`: `V = 192.000 × 1,6 ÷ 0,6 = ` **512.000**. Verificación: `CV = 512.000/1,6 = 320.000`, `CM = 192.000 = CF` ✓. *(Va aparte porque el `m` de `AM-01` es `256/244 = 1,0492`, no 0,60: en la v1 los dos números convivían en la misma tabla como si fueran el mismo caso.)*

### 9.2 `AM-02` — equilibrio sectorial y específico *(v1, íntegro y verificado)*

Tres líneas, 12.000 de indirectos comunes.

| Línea | `pv` | `cv` | `cm` | Participación | CFD |
|---|---|---|---|---|---|
| A | 100 | 60 | 40 | 0,20 | 20.000 |
| B | 60 | 40 | 20 | 0,30 | 6.000 |
| C | 40 | 28 | 12 | 0,50 | 2.000 |

| Magnitud | Valor |
|---|---|
| `cm` ponderada | **20,00** |
| `CF` totales | **40.000** |
| **PE general** | **2.000 unidades** → 400 / 600 / 1.000 |
| **PE específicos** | A **500** · B **300** · C **166,67** |
| Diagnóstico | **A deficitaria en 100 unidades**; B con excedente 300; C con 833,33 |

🔴 **Control:** en el PE general las contribuciones netas dan A = −4.000, B = +6.000, C = +10.000, y suman **12.000** = los indirectos → resultado cero. Recalculado y correcto.

### 9.3 `AM-03` — relaciones de reemplazo *(v1, íntegro y verificado)*

| Magnitud | Valor |
|---|---|
| `RR_A/B` | **2,00** |
| A cae 50 u → hay que vender de B | **100 unidades** |
| PE extremo de B, **corto plazo** | **1.900** — (20.000 + 6.000 + 12.000) ÷ 20 |
| PE extremo de B, **largo plazo** | **900** — (6.000 + 12.000) ÷ 20 |

🔴 La API devuelve **las dos**. Una sola no cumple.

### 9.4 `AM-04` — punto de indiferencia *(v1, íntegro y verificado)*

| Estructura | `CF` | `cv` |
|---|---|---|
| a — alta tecnología | 300.000 | 100 |
| b — baja tecnología | 100.000 | 150 |

`Q = 200.000 ÷ 50 = ` **4.000 unidades**; en el punto las dos cuestan **700.000**. Arriba conviene `a`, abajo `b`.

➕ **Sub-fixture `AM-04b` — R25, decisión inversa.** Dejar de fabricar `a` para comprar: de los 300.000 de fijo, sólo **180.000** son **evitables** (el resto es contrato). El numerador pasa a ser `180.000 − 100.000 = 80.000` y `Q = 80.000 ÷ 50 = ` **1.600**, no 4.000. 🔴 Usar el fijo total en la decisión inversa cambia la respuesta en un factor de 2,5.

### 9.5 `AM-05` — capacidad ociosa *(corregido, C7)*

Capacidad normal declarada: 1.000 unidades en 100 horas. Fijos de producción a absorber: 96.000. Real: 900 unidades en 95 horas.

| Métrica | Valor | Vale hoy |
|---|---|---|
| Cuota fija por hora | **960** | ✅ |
| Cuota fija por unidad | **96** | ✅ |
| **Variación volumen del motor, base = HORAS** | **4.800** | ✅ `960 × (100 − 95)` — es lo que `calcVarianceAnalysis` devuelve hoy |
| Variación volumen, base = UNIDADES | **9.600** | `96 × (1.000 − 900)` |
| Uso de capacidad | **4.800** | `(100 − 95) × 960` |
| Eficiencia | **4.800** | `(95 − 90) × 960`, con 90 h estándar para 900 u |
| Uso + eficiencia | **9.600** | 🔴 **≠ la variación volumen del motor con base horas (4.800)** |
| **Ociosidad por Costeo Variable (R22), `cm = 256`** | **25.600** | `(1.000 − 900) × 256` ← **es la métrica por default** |

❌ La v1 afirma 🔴 *"uso + eficiencia = `volumeVariance` del motor"*. **No cierra**: son 9.600 contra 4.800. El control sólo vale si la base de aplicación son unidades, y hoy son horas.

🔴 **Lo que `M7-01` sí entrega y se puede testear hoy:**
1. `presupuesto + volumen = −(aplicado − real)` contra `calcVarianceAnalysis` — el control que **sí** cierra.
2. La ociosidad de R22 (25.600) como número del tablero.
3. La ociosidad de **mano de obra** que ya emite el motor (`idleCapacity.idleCost`), mostrada aparte y **nunca sumada** a la de CIP sin decirlo.
4. Las tres vías quedan bloqueadas por `O1-02` de Santi (base estándar) y por R11/R23 (base que mida eficiencia).

### 9.6 `AM-06` — mezcla óptima con un recurso escaso *(v1, íntegro y verificado)*

1.000 horas máquina.

| Producto | `cm` | Horas/u | `cme` | Demanda máx. |
|---|---|---|---|---|
| X | 300 | 3 | 100 | 200 |
| Y | 200 | 1 | 200 | 400 |
| Z | 400 | 8 | 50 | 100 |

| Criterio | Mezcla | CM total |
|---|---|---|
| **Correcto** — `cme` descendente (Y, X, Z) | 400 Y + 200 X + 0 Z = 1.000 h | **140.000** |
| **Equivocado** — `cm` por unidad (Z, X, Y) | 100 Z + 66 X + 2 Y = 1.000 h | **60.200** |

Diferencia **79.800**. 🟡 Exagerada a propósito; en un catálogo real la diferencia es chica y por eso es invisible sin calcularla. Eso va en el texto de pantalla, no en el test.

### 9.7 ➕ `AM-07` — zona de equilibrio con clasificación incompleta (R13) — **nuevo**

Sobre `AM-01`, con los **CIP (90.000) sin clasificar**.

| Extremo | Supuesto | `CV prod` | `cv` | `cm` | `CF` | `Q` |
|---|---|---|---|---|---|---|
| Inferior | CIP todo **VARIABLE** | 250.000 | 280 | 220 | 156.000 | **709,09** |
| Superior | CIP todo **FIJO** | 160.000 | 190 | 310 | 246.000 | **793,55** |

🔴 **La respuesta es la zona `[709,09 ; 793,55]`**, con "Costos indirectos de producción (90.000)" nombrado como el concepto que la ensancha. **No es un tablero en blanco** (G5) ni un número seguro parcial (G18). El valor verdadero de `AM-01` (750) cae adentro, y ése es el test.

### 9.8 ➕ `AM-08` — conversor de pesos a cajones (G15) — **nuevo**

`pv = 50.000` por cajón · `cm = 30.000` por cajón · costo fijo nuevo a cubrir: **1.000.000**.

| Método | Resultado | Contribución que junta | Faltante |
|---|---|---|---|
| ❌ Como está hoy: `importe ÷ pv` | **20,00 cajones** | 20 × 30.000 = **600.000** | **−400.000** |
| ✅ Correcto: `importe ÷ cm` | **33,33 cajones** | 33,33 × 30.000 = **1.000.000** | **0** |

🔴 El test verifica que la pantalla devuelva **33,33** y que el texto diga *"cajones que hay que vender para cubrir ese costo con contribución marginal"*, no "que equivalen a ese importe". Con los números reales de la avícola la diferencia es **20,8 contra 33,6** (`AM17` §0.6).

### 9.9 ➕ `AM-09` — tramos, PE inexistente y ampliación (R29/R30/R31) — **nuevo**

`cm = 2.974` por cajón. Dos tramos de estructura.

| Tramo | `CF` | Techo físico |
|---|---|---|
| 1 — galpón actual | 1.780.000 | 475,7 cajones |
| 2 — con galpón nuevo | 2.600.000 | 950,9 cajones |

| Magnitud | Valor | Qué tiene que hacer el sistema |
|---|---|---|
| `Q` aritmético del tramo 1 | 598,52 | 🔴 **Devolver `null` con `motivoFueraDeTramo`**, no el número. 598,52 > 475,7 |
| Resultado máximo del tramo 1 (`Ra`) | **−365.268,20** | 475,7 × 2.974 − 1.780.000. El mejor mes posible **pierde** |
| PE del tramo 2 | **874,24** | 2.600.000 ÷ 2.974. Cae dentro de 475,7–950,9 ✓ |
| Punto de resultado indiferente `Qn` | **751,42** | (−365.268,20 + 2.600.000) ÷ 2.974 |
| Binding | **874,24** | `max(PE₂, Qn)`. Acá manda el PE, no la indiferencia |
| Margen contra el techo del tramo 2 | **76,66 cajones (8,1 %)** | 🔴 **R31: alerta de "pegado al techo"** |
| Resultado máximo del tramo 2 | **227.976,60** | 950,9 × 2.974 − 2.600.000 |

🔴 **Es el fixture más importante de todo el plan.** Sin él, el sistema le muestra al primer cliente un punto de equilibrio de 598,5 cajones para un galpón de 475,7: un número aritméticamente impecable y operativamente imposible, sin ninguna advertencia. Es `AM17` conclusión 2, textual: *"Pico de Oro no tiene punto de equilibrio. No está lejos: no existe en el tramo de capacidad actual."*

### 9.10 ➕ `AM-10` — moneda homogénea y tasa real (R33/R34/R35) — **nuevo**

| Caso | Dato | ❌ Mal | ✅ Bien |
|---|---|---|---|
| Tasa real mensual | `tn = 0,08`, `ti = 0,05` | `tn − ti = 3,0000 %` | `1,08/1,05 − 1 = ` **2,8571 %** |
| A 12 meses | | ×1,4258 | **×1,4034** |
| PPP de stock | 1.000 kg a $100 (índice 100) + 1.000 kg a $150 (índice 150) | `250.000/2.000 = $125/kg` | re-expresar el primer lote a $150 → `300.000/2.000 = ` **$150/kg** |

🔴 El PPP nominal **subvalúa el consumo un 16,7 %** y el error viaja entero al costo del producto. R35: la valuación se aplica después de convertir, nunca antes.

### 9.11 ➕ `AM-11` — precio de transferencia interna (R9/R24) — **nuevo**

Granja: 500 cajones/mes, `pv = 48.000`, otros costos variables 15.000/cajón, `CF = 15.000.000`. Consume 10.000 kg de maíz del sector granos. Costo del sector: $130/kg. Mercado: $180/kg.

| Criterio | Maíz por cajón | `cv` | `cm` | **PE** |
|---|---|---|---|---|
| A costo variable (R9 — para **decidir**) | 2.600 | 17.600 | 30.400 | **493,42** |
| A precio de mercado (R24 — para el **estado de resultados por sector**) | 3.600 | 18.600 | 29.400 | **510,20** |

🔴 Diferencia: **16,78 cajones de punto de equilibrio, sin que haya cambiado un solo costo real de la empresa.** La pantalla muestra los dos y dice cuál se usa para qué. Es `AM17` conclusión 7 (allá son 29,9 cajones con los números reales).

### 9.12 ➕ `AM-12` — estado de resultados en cascada de niveles (R17/R19) — **nuevo**

Sobre `AM-02`, en el PE general (2.000 u), partiendo los 12.000 de indirectos en **4.000 evitables** y **8.000 inevitables**.

| Renglón | A | B | C | Total |
|---|---|---|---|---|
| Contribución marginal **nivel 1** | 16.000 | 12.000 | 12.000 | **40.000** |
| − Costos fijos **directos** | (20.000) | (6.000) | (2.000) | (28.000) |
| Contribución marginal **nivel 2** | **(4.000)** | **6.000** | **10.000** | **12.000** |
| − Fijos indirectos **evitables** (fila propia, R19) | | | | (4.000) |
| Contribución marginal **nivel 3** | | | | **8.000** |
| − Fijos indirectos **inevitables** | | | | (8.000) |
| **Resultado** | | | | **0** |

🔴 **Los indirectos no bajan a las columnas de las líneas.** Si el test ve un número de indirecto en la columna de A, B o C, falla: eso es prorrateo y R17 lo prohíbe. 🔴 A tiene nivel 2 negativo y **no se cierra** mientras su fijo directo sea inevitable (R20).

### 9.13 ➕ `AM-13` — rotación y ranking de comercio (R32) — **nuevo**

Dos artículos, $100.000 de stock invertido en cada uno.

| Artículo | `m` | `Vel` (rotaciones/año) | `cm/S = Vel × m` | CM anual |
|---|---|---|---|---|
| A | 0,20 | 12 | **2,40** | **240.000** |
| B | 0,60 | 2 | **1,20** | **120.000** |

🔴 Por margen ganaría B; por `cm/S` gana A, **y le rinde el doble**. El test verifica que el ranking por default sea `cm/S` y que ordenar por margen esté detrás de una advertencia.

### 9.14 ➕ `AM-14` — cotización de producción a pedido (`AM18`) — **nuevo**

Tres pedidos. Materiales directos 200 / 300 / 500. Mano de obra **fija y directa** $4.000 del mes. Fijos indirectos $6.000. Beneficio deseado **1.100**.

```
ΣCM necesaria = CF + B = (4.000 + 6.000) + 1.100 = 11.100
Σ precios     = ΣCM + Σ materiales = 11.100 + 1.000 = 12.100
```

| Vector de precios | Σ | ¿Cumple? |
|---|---|---|
| 3.520 / 5.830 / 2.750 *(el que da el método tradicional con K = costo + 10 %)* | 12.100 | ✅ |
| 5.000 / 5.000 / 2.100 | 12.100 | ✅ |
| 3.000 / 5.000 / 3.000 | 11.000 | ❌ faltan 1.100 |

🔴 El test verifica dos cosas: (1) que el sistema acepte **cualquier** vector cuya suma dé 12.100 — hay infinitas combinaciones válidas; (2) que **se niegue a responder "cuánto gané en el pedido 2"**. `AM18`: *"el beneficio existe a nivel empresa, no por obra"*. Y que la mano de obra del pedido quede clasificada **fija y directa**, que es la celda que rompe el método del coeficiente K.

---

## 10. El mapa de tareas

**Una tarea = un PR.** Ciclo de siempre: `/costear-commit` → `/costear-pr` → `/costear-review` → merge. Las marcadas **ADR** llevan `/costear-adr` en el mismo PR. Formato igual al del plan de Órdenes/Procesos de Santi, para que las dos colas se orquesten con el mismo criterio.

🔴 **Regla que atraviesa todo (igual que en el plan de Santi):** migraciones aditivas, bitácora en la misma transacción, ningún 500 crudo, cero regresión en los fixtures existentes.

### Ola A ➕ — los números que ya se muestran mal *(no existía en la v1)*

| ID | Tarea | Severidad | Esfuerzo | Repo | Depende de |
|---|---|---|---|---|---|
| **MX-01** | Conversor de pesos a cajones sobre contribución marginal, no sobre precio | **CRÍTICO** | S | front (+back) | — |
| **MX-02** | El tablero deja de mostrar un costo fijo unitario | **CRÍTICO** | S | back + front | — |
| **MX-03** | `costoPorCajon.fijo` deja de reportarse completo sobre una clasificación incompleta | ALTO | S | back | — |
| **MX-04** | La clasificación se resuelve contra el período calculado, no contra el abierto | ALTO | S | back | — |
| **MX-05** | `ScenarioSimulator`: fuera el `Infinity` y fuera los dos bloques de clasificación hardcodeada | ALTO | M | front | MX-03 |

### Ola B — la base *(M0–M2 de la v1, corregidas)*

| ID | Tarea | Severidad | Esfuerzo | Repo | Depende de |
|---|---|---|---|---|---|
| **M0-01** | CM sobre el costo REAL neto + control de suma contra el renglón 7f | **CRÍTICO** | L | back | Ola A |
| **M0-02** | `cv` de producción sobre unidades PRODUCIDAS | **CRÍTICO** | S | back | M0-01 |
| **M0-03** | `resultadoPeriodo` = resultado por costeo variable, con las dos cifras | ALTO | M | back + front | M0-01 |
| **M0-04** | Contrato de unidad de gestión — desbloquea #252 | ALTO | M | back + front · **ADR** | — |
| **M1-01** | `ConceptoCosteo` completo (comportamiento · erogable+horizonte · evitable · causa · rango · segmento) | **CRÍTICO** | XL | back · **ADR** | M0-01 |
| **M1-02** | `TramoSemifijo` + pantalla de desagregación | ALTO | L | back + front | M1-01 |
| **M1-03** | Zona de equilibrio con clasificación incompleta (R13) | ALTO | M | back + front | M1-01 |
| **M2-01** | Gastos de no fabricación dentro de la CM y del PE | **CRÍTICO** | L | back | M1-01 |

### Ola C — decidir *(M3–M7 de la v1)*

| ID | Tarea | Severidad | Esfuerzo | Repo | Depende de |
|---|---|---|---|---|---|
| **M3-01** | Familia completa de PE + los despejes (bloque 1) | ALTO | L | back | M2-01 |
| **M3-02** | Planeamiento de resultados absoluto y % sobre capital (`i`, `Kf`, `a`) + guarda R12 | MEDIO | M | back + front | M3-01 |
| **M3-03** | Punto de cierre con horizonte (bloque 2) | ALTO | M | back + front | M1-01 |
| **M3-04** | Estado de resultados variable en cascada de niveles (bloque 9 + R17/R19) | ALTO | L | back + front | M1-01, M2-01 |
| **M10-01** ➕ | Tramos, PE por tramos y punto de resultado indiferente (`AM14`) | **CRÍTICO para el piloto** | L | back + front · **ADR** | M1-01 |
| **M4-01** | `SegmentoAnalisis` + equilibrio sectorial y específico + barrera de conjunta | ALTO | XL | back + front | M3-04 |
| **M5-01** | Relaciones de reemplazo, corto y largo plazo | MEDIO | M | back | M4-01 |
| **M6-01** | Punto de indiferencia genérico + R25 | MEDIO | M | back + front | M3-01 |
| **M7-01** | Capacidad ociosa: R22 por default + puente al `idleCapacity` que ya existe | ALTO | M | back + front | M3-01 |

### Ola D — optimizar *(M8–M9 de la v1)*

| ID | Tarea | Severidad | Esfuerzo | Repo | Depende de |
|---|---|---|---|---|---|
| **M8-01** | `RecursoEscaso` + consumo por unidad + heurística de un recurso | ALTO | L | back + front | M4-01 |
| **M9-01** | Programación lineal para N recursos | BAJO | XL | back · **ADR** | M8-01 + decisión de arquitectura |

### Ola E ➕ — lo que el corpus pide y la v1 no tenía

| ID | Tarea | Severidad | Esfuerzo | Repo | Depende de |
|---|---|---|---|---|---|
| **M11-01** | Moneda homogénea y tasa real (R33/R34/R35) | ALTO | L | back · **ADR** | M0-01 |
| **M13-01** | Precio de transferencia interna (R9/R24) | MEDIO | M | back + front | M4-01 |
| **M12-01** | Cotización de producción a pedido (`AM18`) | MEDIO | M | back + front | M4-01 + `O1-01` de Santi |
| **M14-01** | Rotación y ranking de comercio (`cm/S = Vel × m`) | BAJO | M | back + front | M4-01 |
| **V-A1** | Matriz R1–R35 → módulo → test, verde de punta a punta | ALTO | S | back | todas |

**Paralelismo.** Los cinco de la Ola A son independientes entre sí (salvo MX-05, que quiere MX-03 antes). `M0-04` no depende de nada. `M10-01` puede arrancar apenas cierre `M1-01` y **debería adelantarse a M4**, porque es lo que hace que el número del piloto no sea imposible. `M11-01` es independiente de toda la rama sectorial.

---

## 10.1 Ola A — las tareas, con su prompt

### MX-01 — Conversor de pesos a cajones sobre contribución marginal · **CRÍTICO** · S · front (+back)

**Problema.** El conversor del tablero (`CosteAR-frontend#93`, PR #119, mergeado el 04-09) calcula `importe ÷ precioPorCajón`. Su propia bitácora lo dice: *"el único cálculo de la herramienta es `importe / precioPorCajon`"*. Un costo fijo se cubre con **contribución marginal**, no con facturación. Con los números de la avícola la pantalla dice **20,8 cajones** cuando la respuesta es **33,6**: al vender esos 20,8 el dueño junta $619.646 de contribución y le faltan **$380.354** para el millón que creía cubierto.

**Doctrina.** `AM5` §5.3: la condición de equilibrio es `CM = CF`, no `V = CF`. `AM17` conclusión 6.

**Qué hay que hacer.** El divisor pasa a ser `contribucionMarginalPorCajon`. Si la contribución es incompleta o no positiva, el campo queda deshabilitado con el motivo, igual que hoy hace con el precio. El texto de la pantalla cambia de "equivale a" a "cajones que hay que vender para cubrirlo". Se conserva la trazabilidad de período que la herramienta ya muestra, y se agrega **cuál** de los dos números se usó.

**Criterio de aceptación.** `AM-08`: `pv = 50.000`, `cm = 30.000`, importe 1.000.000 → **33,33 cajones**. Con `cm` incompleta, el campo no calcula y muestra el motivo. Con `cm ≤ 0`, tampoco: nunca `Infinity`, nunca un guion sin explicación.

```texto
Corregí el conversor de pesos a cajones del tablero del dueño en CosteAR-frontend.

PROBLEMA MEDIDO: la calculadora agregada por el issue #93 (PR #119, mergeado el 04-09-2026) divide el importe por el PRECIO promedio de venta por cajón. Su propia bitácora (docs/sesiones/2026-09-04-93-conversor-pesos-cajones.md) lo dice: "el único cálculo de la herramienta es importe / precioPorCajon". Eso contesta "cuántos cajones facturan ese importe", que no es la pregunta. Un costo fijo se cubre con CONTRIBUCIÓN MARGINAL, no con facturación. Con los números del cliente avícola la pantalla informa 20,8 cajones para cubrir $1.000.000 cuando la respuesta correcta es 33,6: vender 20,8 cajones junta $619.646 de contribución y le faltan $380.354.

DOCTRINA (bóveda, Corpus Costos Curado): AM5 cap. 5 §5.3 — la condición de equilibrio es CM = CF, no V = CF. AM17 "El Análisis Marginal aplicado a Pico de Oro", conclusión 6: "un costo fijo se paga con contribución marginal, no con facturación".

QUÉ CONSTRUIR:
1. El divisor pasa a ser data.contribucionMarginalPorCajon (ya lo entrega GET /periods/:id/tablero-dueno), no data.precioPromedioVenta.
2. Si la contribución marginal viene incompleta, o su valor es <= 0, el campo queda deshabilitado con el motivo y la acción faltante, igual que hoy se comporta con el precio. Nunca Infinity, nunca un guion sin explicación.
3. El texto cambia de "equivale a X cajones" a "hay que vender X cajones para cubrir ese costo con contribución marginal".
4. La pantalla sigue mostrando el período y ahora también CUÁL número se usó (contribución marginal por cajón), para que la equivalencia sea auditable.
5. Actualizá el E2E tests/e2e/tablero-dueno.spec.ts: el caso positivo pasa a verificar la división por contribución, y se agrega el caso de contribución no positiva.

CRITERIO DE ACEPTACIÓN (fixture AM-08): con precio por cajón 50.000 y contribución marginal por cajón 30.000, un importe de 1.000.000 devuelve 33,33 cajones (hoy devuelve 20,00). Con contribución marginal incompleta el campo no calcula. Con contribución marginal 0 o negativa tampoco, y muestra el motivo que ya emite el backend.

REGLAS: no se elimina ni se renombra ningún test. Sin ADR: no es una decisión nueva, es la corrección de un cálculo. Dejá en el commit la cita de AM5 §5.3.
```

---

### MX-02 — El tablero deja de mostrar un costo fijo unitario · **CRÍTICO** · S · back + front

**Problema.** `owner-dashboard-service.ts` compone `costoPorCajon.fijo` como `Σ componentes FIJO ÷ period.productionQuantity × factor`. Tres cosas mal en una línea: (a) es un **costo fijo unitario**, la entidad que `AM4` demuestra inexistente; (b) se divide por unidades **producidas** mientras `.variable` se divide por unidades **vendidas** — dos denominadores distintos en la misma fila (G17); (c) por eso `variable + fijo ≠ total` (G3), además de la causa que la v1 ya nombró.

**Doctrina.** `AM4`: *"el 'costo fijo unitario' es una entidad inexistente en la realidad… establece una comparación entre dos magnitudes absolutamente independientes entre sí. No existe una relación causal entre ambas."* 🔴 **R10:** los fijos se controlan comparando **totales**.

**Qué hay que hacer.** El indicador `costoPorCajon.fijo` se **conserva en el contrato** (nada se saca) pero deja de ser el número destacado y viaja con `esUnitarioDeFijo: true` y su advertencia. En su lugar el tablero muestra **`costosFijosDelPeriodo`** (total, sin dividir) y **`cajonesQueTapanLosFijos = CF / cm`**, que es la pregunta que el dueño estaba haciendo cuando miraba el fijo por cajón. Y `costoPorCajon.total` se acompaña del puente por inventarios de proceso (§8.1) para que la fila cierre o diga por qué no.

**Criterio de aceptación.** Sobre `AM-01`: `costosFijosDelPeriodo = 192.000`; `cajonesQueTapanLosFijos = 750`; el tablero ya no destaca "costo fijo por unidad"; y `variable(244) + fijo + puente` reconcilia contra `netProductionCost` con diferencia **0,00**.

```texto
Sacá el costo fijo unitario del lugar destacado del tablero del dueño en CosteAR y reemplazalo por los dos números que sí son doctrinariamente válidos.

PROBLEMA MEDIDO (backend, src/application/cost-structures/owner-dashboard-service.ts): el indicador costoPorCajon.fijo se calcula como la suma de los componentes clasificados FIJO dividida por period.productionQuantity y multiplicada por el factor de la unidad. Tres defectos en la misma línea:
(a) es un COSTO FIJO UNITARIO;
(b) se divide por unidades PRODUCIDAS mientras costoPorCajon.variable se divide por unidades VENDIDAS: dos denominadores distintos en la misma fila;
(c) por eso, y porque costoPorCajon.total sale de detail.unitCost.unitFinishedGoodsCost, en la pantalla del dueño variable + fijo != total.

DOCTRINA (bóveda, Corpus Costos Curado): AM4 se titula "La falacia del costo fijo unitario" y dice: "el llamado 'costo fijo unitario' es una entidad inexistente en la realidad, por la sencilla razón de que establece una comparación entre dos magnitudes absolutamente independientes entre sí. No existe una relación causal entre ambas." Regla dura R10: los costos fijos y sus desvíos se analizan EXCLUSIVAMENTE en sus manifestaciones TOTALES; los variables, en valores unitarios.

QUÉ CONSTRUIR:
1. NO se elimina costoPorCajon.fijo del contrato (hay consumidores). Se le agrega el flag esUnitarioDeFijo: true y un motivo legible que explique por qué no es una magnitud económica, y el frontend lo baja de jerarquía visual.
2. Se agregan dos indicadores nuevos al endpoint del tablero:
   - costosFijosDelPeriodo: el total de los conceptos FIJO, SIN dividir por unidades.
   - cajonesQueTapanLosFijos = costos fijos totales / contribución marginal unitaria, expresado en la unidad de venta. Es la pregunta real que el dueño hace cuando mira un fijo por cajón.
   Los dos siguen la misma convención de NumeroTablero (valor, completo, parametrosSinConfirmar, motivos) que ya usan los seis indicadores.
3. costoPorCajon.total se acompaña de un renglón "puente" que expone la diferencia por existencia inicial y final de producción en proceso, para que la fila cierre o diga exactamente por qué no cierra.
4. El frontend (src/features/owner-dashboard/) muestra los dos indicadores nuevos y degrada el fijo unitario, con el texto de la advertencia.

CRITERIO DE ACEPTACIÓN (fixture AM-01, en tests/fixtures/analisis-marginal/): unidades producidas 1.000, vendidas 800, pv 500, MP 150.000 VARIABLE, MOD 60.000 FIJO, CIP 90.000 SEMIFIJO (54.000 variable / 36.000 fijo), amortización 40.000 FIJO, terceros 10.000 VARIABLE, gasto variable de comercialización 30 por unidad vendida, gastos fijos de administración 56.000.
- costosFijosDelPeriodo = 192.000
- contribución marginal unitaria = 256
- cajonesQueTapanLosFijos = 750
- el test de reconciliación da diferencia 0,00 contra netProductionCost + gastos de no fabricación = 430.000

REGLAS: migración no hace falta (es capa de aplicación). Cero regresión en tests/http/owner-dashboard.test.ts y tests/integration/owner-dashboard.test.ts: se agregan casos, no se cambian los existentes salvo para cubrir los campos nuevos. ADR en el mismo PR sobre por qué el fijo unitario se conserva marcado en vez de eliminarse.
```

---

### MX-03 — `costoPorCajon.fijo` deja de reportarse completo sobre una clasificación incompleta · ALTO · S · back

**Problema.** En `owner-dashboard-service.ts`, la rama `fijo:` llama `completo(...)` sin mirar `contribucion.incompleta`. Con un rubro sin clasificar, `.variable` sale `incompleto` con su motivo y `.fijo` sale con **un número seguro que suma únicamente los rubros que sí se clasificaron**. Es el peor de los dos errores posibles: no es un dato faltante, es un dato parcial presentado como completo.

**Doctrina.** 🔴 **R13**: con costos sin clasificar se informa una **zona**, nunca un punto.

**Qué hay que hacer.** `.fijo` hereda exactamente la misma condición de incompletitud que `.variable`: si la contribución es incompleta, `.fijo` sale `incompleto` con los mismos motivos y el mismo `pendientes`. (La zona de R13 llega en `M1-03`; esta tarea solamente deja de mentir.)

**Criterio de aceptación.** Con los CIP de `AM-01` sin clasificar: `.variable`, `.fijo` y `.total` salen los tres `incompleto`, con el mismo motivo *"Falta clasificar frente al volumen el rubro Costos indirectos de producción"*, y el arreglo `pendientes` trae la acción una sola vez.

```texto
Arreglá el indicador de costo fijo del tablero del dueño, que hoy informa un número parcial como si fuera completo.

PROBLEMA MEDIDO (src/application/cost-structures/owner-dashboard-service.ts): en el objeto costoPorCajon, la rama variable respeta la incompletitud (si contribucion.costoVariableUnitario es null devuelve incompleto con los motivos), pero la rama fijo llama a completo(...) SIEMPRE, sin mirar contribucion.incompleta. Efecto: con un rubro sin clasificar frente al volumen, el tablero muestra "costo variable: falta clasificar" y al lado "costo fijo: $X" — donde X es la suma de los rubros que SÍ se clasificaron. Un dato parcial presentado como completo es peor que un dato faltante.

DOCTRINA (bóveda): regla dura R13 del corpus — "cuando queden costos sin clasificar, informar una ZONA de equilibrio, no un punto falsamente preciso".

QUÉ CONSTRUIR: la rama fijo hereda exactamente la misma condición de incompletitud que la rama variable. Si contribucion.incompleta es true, o si hay algún componente con comportamientoVolumen null o SEMIFIJO sin tramo declarado, costoPorCajon.fijo sale incompleto con los mismos motivos que ya arma contribucion.motivos y con parametrosSinConfirmar igual que el resto. El arreglo pendientes sigue ofreciendo la acción una sola vez (pendientesUnicos ya lo resuelve).

CRITERIO DE ACEPTACIÓN: con el fixture AM-01 y el rubro "Costos indirectos de producción" SIN clasificar, los tres indicadores (variable, fijo, total) salen incompleto con el motivo "Falta clasificar frente al volumen el rubro Costos indirectos de producción.", y pendientes trae una sola entrada de área 'costeo'. Con todos los rubros clasificados, los tres salen completos y los valores no cambian respecto de hoy (regresión).

REGLAS: cero regresión en tests/http/owner-dashboard.test.ts. Sin ADR. Es un bug, no una decisión.
```

---

### MX-04 — La clasificación se resuelve contra el período calculado, no contra el abierto · ALTO · S · back

**Problema.** `enrichCalculationResult` busca `db.costPeriod.findFirst({ where: { structureId, status: 'OPEN' } })` y usa ese `periodId` como `contexto` de la cascada de `resolverComportamiento`. O sea: **la clasificación con la que se calcula un período es la del período abierto más reciente, no la del período que se está calculando.** Recalcular agosto con septiembre abierto usa la clasificación de septiembre. Es el mismo modo de falla que el hallazgo **E1-03** de la auditoría del 06-09 (el formulario que lee el config vivo de la estructura), en otra capa.

**Qué hay que hacer.** `enrichCalculationResult` recibe el `periodId` **del cálculo** como parámetro explícito. El `findFirst` de período abierto se conserva sólo como fallback documentado para las corridas sin período (mocks históricos), y en ese caso el resultado lleva un motivo que lo diga.

**Criterio de aceptación.** Con agosto cerrado clasificando CIP como `FIJO` y septiembre abierto clasificando CIP como `VARIABLE`, recalcular **agosto** devuelve la contribución marginal con CIP fijo; hoy devuelve la de septiembre. Y la traza de cada componente (`origen: 'periodo'`, `parametroId`) apunta a la fila de agosto.

```texto
Corregí de qué período sale la clasificación de comportamiento con la que se calcula la contribución marginal en CosteAR.

PROBLEMA MEDIDO (src/application/cost-structures/calculation-result-enrichment.ts): la función busca el período con status 'OPEN' de la estructura y usa ese id como contexto.periodId de calcularContribucionMarginal. La cascada de resolverComportamiento (período -> estructura -> empresa) entonces resuelve contra el período ABIERTO, sin importar qué período se esté calculando. Recalcular un período cerrado toma la clasificación de otro mes. Es el mismo modo de falla que el hallazgo E1-03 de la auditoría E2E del 06-09-2026, donde los formularios leían el config vivo de la estructura en vez del config del período seleccionado.

QUÉ CONSTRUIR:
1. enrichCalculationResult recibe el periodId del cálculo como argumento explícito (args.periodId), y lo usa en el contexto de la contribución marginal.
2. Recorré todos los llamadores (la ruta de cálculo y la de simulación) y pasales el período correcto. Hacé el inventario antes de tocar nada.
3. El findFirst de período OPEN se conserva SOLO como fallback para corridas sin período (mocks históricos sin companyId), y en ese caso el resultado suma un motivo legible que diga que la clasificación se resolvió contra el período abierto por falta de período de cálculo.
4. La traza que ya emite cada componente (origen, parametroId, clasificadoPorUserId, clasificadoEn) tiene que seguir apuntando a la fila que efectivamente se usó.

CRITERIO DE ACEPTACIÓN: con una estructura que tiene agosto CERRADO con el parámetro comportamiento_costos_indirectos = FIJO a nivel período, y septiembre ABIERTO con el mismo parámetro = VARIABLE a nivel período, recalcular agosto devuelve una contribución marginal donde el componente "Costos indirectos de producción" tiene comportamientoVolumen FIJO, origen 'periodo' y parametroId el de la fila de agosto. Hoy devuelve VARIABLE. Recalcular septiembre sigue devolviendo VARIABLE.

REGLAS: cero regresión en tests/domain/contribucion-marginal.test.ts y tests/integration/contribucion-marginal.test.ts. Ningún 500. ADR en el mismo PR: es la misma decisión de fondo que E1-03 y conviene que quede escrita una sola vez para las dos capas.
```

---

### MX-05 — `ScenarioSimulator`: fuera el `Infinity` y fuera los dos bloques hardcodeados · ALTO · M · front

**Problema.** Dos cosas, no una. (1) `ScenarioSimulator.tsx:90`: `const peEnCajones = margenPorCajon > 0 ? costosFijos / margenPorCajon : Infinity` — devuelve **`Infinity`**, exactamente lo que la regla dura 4 de este plan prohíbe. (2) El archivo tiene **dos** bloques con la clasificación escrita en código, no uno: el del escenario (`directLabor // fijo`, `costosFijos = directLabor + indirectCosts`, `variablePorCajon = rawMaterial / cajones`) y el de plena capacidad (`costoFijoTotal = directLaborTotal + indirectCostsApplied`). La v1 nombró el primero.

**Qué hay que hacer.** No es la reescritura del `CosteAR-frontend#94` — eso sigue siendo suyo. Acá se hacen dos cosas acotadas: el `Infinity` pasa a ser `null` con motivo, renderizado como el resto de los indicadores incompletos; y **los dos** bloques consumen `contribucionMarginal` y `puntoEquilibrio` del resultado enriquecido en vez de clasificar en código. Si el resultado viene incompleto, el simulador se deshabilita con el motivo, no inventa.

**Criterio de aceptación.** Con `margenPorCajon ≤ 0` la pantalla dice *"con esta contribución marginal no existe punto de equilibrio"* y no muestra ningún número. Con la clasificación cargada, el PE del simulador y el del tablero **coinciden al centavo** — hoy son dos números distintos del mismo concepto. Con la clasificación incompleta, el simulador se deshabilita.

```texto
Sacá el punto de equilibrio propio del simulador de escenarios de CosteAR-frontend y hacelo consumir el que ya calcula el backend.

PROBLEMA MEDIDO (src/features/cost-structures/components/ScenarioSimulator.tsx, origin/dev bf70d3d):
1. Línea 90: "const peEnCajones = margenPorCajon > 0 ? costosFijos / margenPorCajon : Infinity". Devuelve Infinity, que es exactamente lo que la regla dura del proyecto prohíbe ("si el denominador es cero o negativo, el equilibrio no existe: se devuelve null con motivo, nunca un número forzado ni un infinito").
2. Hay DOS bloques con la clasificación fijo/variable escrita en código, no uno:
   - el del escenario: "const directLabor = Number(currentResult.directLaborTotal); // fijo", "const costosFijos = directLabor + indirectCosts", "const variablePorCajon = rawMaterial / cajones";
   - el de plena capacidad, más abajo: "const costoFijoTotal = Number(currentResult.directLaborTotal) + Number(currentResult.indirectCostsApplied)".
   Los dos suponen que MP es variable y que MOD y CIP son fijos, cuando eso es un dato del tenant que vive en ParametroCosteo.comportamientoVolumen.
Resultado: el producto muestra dos puntos de equilibrio distintos del mismo concepto, y el del simulador ignora la clasificación que el cliente cargó.

ALCANCE: esto NO es la reescritura completa del simulador (eso es CosteAR-frontend#94, que sigue abierto y no se duplica acá). Son dos correcciones acotadas.

QUÉ CONSTRUIR:
1. peEnCajones y peEnAves pasan a ser number | null. Con contribución marginal no positiva devuelven null y la pantalla muestra "con esta contribución marginal no existe punto de equilibrio", con el mismo componente de indicador incompleto que ya usa el tablero. Nunca Infinity.
2. Los DOS bloques toman la clasificación de currentResult.contribucionMarginal (componentes[].comportamientoVolumen) en vez de suponerla. Los costos fijos son la suma de los componentes FIJO; el costo variable unitario sale de contribucionMarginal.costoVariableUnitario.
3. Si currentResult.contribucionMarginal.incompleta es true, el simulador entero se deshabilita mostrando contribucionMarginal.motivos y la acción que falta. No estima con supuestos.
4. Los escalones de costo fijo que el simulador ya maneja se siguen sumando a los fijos, sin cambio de comportamiento.

CRITERIO DE ACEPTACIÓN:
- Con una corrida cuya contribución marginal unitaria sea <= 0, la pantalla no muestra ningún número de equilibrio y sí el motivo. En ningún lugar del DOM aparece "Infinity".
- Con la clasificación cargada y completa, el punto de equilibrio que muestra el simulador coincide al centavo con el puntoEquilibrioCajones del tablero del dueño para el mismo período.
- Con la clasificación incompleta, el simulador queda deshabilitado con el motivo.
- Agregá un test que falle si vuelve a aparecer un literal Infinity en ese archivo.

REGLAS: no se elimina ni se renombra ningún test. Sin ADR (es corrección de bug), pero dejá en la descripción del PR la referencia a CosteAR-frontend#94 como el trabajo mayor que esto NO reemplaza.
```

---

## 10.2 Ola B — la base

### M0-01 — Contribución marginal sobre el costo REAL neto + control de suma · **CRÍTICO** · L · back

**Problema.** `calculation-result-enrichment.ts` pasa exactamente tres importes al dominio: `rawMaterialConsumed`, `directLaborTotal`, `indirectCostsApplied`. Eso es el **costo normal** (renglón 7 del Estado de Costos). Quedan afuera la amortización de activos, los trabajos de terceros, la variación presupuesto y el desperdicio, que son los renglones 7a a 7e. Y el CIP que sí entra es el **aplicado**, no el real (G20).

**Doctrina.** `cost-statement.ts` numera los renglones: `7c = costo REAL` (normal + terceros + amortización ± variación presupuesto) y `7f = costo NETO de desperdicio` (7c − recupero − merma extraordinaria). 🔴 **R6:** la amortización del plantel es **fija**, causa tiempo. 🔴 **R8:** ningún fijo entra al `cv` por cuota de aplicación.

**Qué hay que hacer.**
1. Los componentes que se pasan al dominio pasan de tres a **siete**: MP, MOD, CIP aplicado, **variación presupuesto**, **trabajos de terceros**, **amortización de activos**, y **desperdicio al costo**. Cada uno con su clave estable y su propia clasificación por cascada.
2. 🔴 La amortización nace con la propuesta de rubro `FIJO` y `causaVariabilidad = tiempo`. **No** `VARIABLE`.
3. Los opcionales (`budgetVariance?`, `thirdPartyWork?`, `assetDepreciation?`, `desperdicio?`) que vienen `undefined` en corridas viejas **no son cero**: no se computan y suman un motivo, igual que hace el motor.
4. **El control de suma como test**, anclado al renglón **7f** (no a `unitFinishedGoodsCost`), más el puente por producción en proceso como número expuesto.

**Criterio de aceptación.** `AM-01` completo, incluido el control corregido: `Σ conceptos MP/MOD/CIP = 350.000 = netProductionCost`, y con los de VENTA, `430.000`. Si la descomposición no llega, el resultado sale incompleto **con el faltante nombrado en pesos**, no con un "incompleto" genérico.

```texto
Hacé que la contribución marginal de CosteAR se calcule sobre el costo REAL NETO de producción y no sobre el costo normal, y agregá el control de suma que hoy no existe.

PROBLEMA MEDIDO (src/application/cost-structures/calculation-result-enrichment.ts): la función pasa exactamente tres importes a calcularContribucionMarginal: output.rawMaterialConsumed, output.directLaborTotal y output.indirectCostsApplied. Esos tres son el renglón 7 del Estado de Costos, o sea el COSTO NORMAL. Quedan fuera del costeo variable la amortización de activos (7a-bis), los trabajos de terceros (7a), la variación presupuesto (7b) y el desperdicio (7d, 7e). Además el CIP que entra es el APLICADO (cuota x actividad real), no el real.

DOCTRINA:
- src/domain/calculations/cost-statement.ts numera los renglones: 7 = costo normal; 7c = costo REAL = normal + terceros + amortización +- variación presupuesto; 7f = costo NETO de desperdicio = 7c - recupero - merma extraordinaria.
- Corpus de la bóveda, regla dura R6: la amortización de un bien de uso es FIJA si la causa es el tiempo y variable si la causa es la intensidad de uso. La amortización del plantel de ponedoras se amortiza en línea recta a 24 meses calendario: es FIJA. La nota AM17 del corpus lo llama "el error más caro del proyecto" y dice que tratarla como variable cambia la contribución marginal en un 24,9%.
- Regla dura R8: ningún costo fijo puede entrar en el costo variable unitario por vía de una cuota de aplicación.

QUÉ CONSTRUIR:
1. Los componentes que enrichCalculationResult pasa al dominio pasan de 3 a 7, cada uno con su clave estable en CLAVES_COMPORTAMIENTO_CONTRIBUCION:
   comportamiento_materia_prima, comportamiento_mano_obra_directa, comportamiento_costos_indirectos,
   comportamiento_variacion_presupuesto, comportamiento_trabajos_de_terceros,
   comportamiento_amortizacion_activos, comportamiento_desperdicio_al_costo.
2. Los cuatro nuevos son OPCIONALES en CalculationOutput. Si vienen undefined NO se computan como cero: se omite el componente y se suma un motivo legible ("este cálculo es anterior a que se midiera la amortización de activos"). Es la misma convención que ya usa el motor y está documentada en calculate.ts.
3. La propuesta de rubro por default para comportamiento_amortizacion_activos es FIJO, con confirmado=false. NUNCA VARIABLE.
4. Agregá el control de suma como test de dominio, anclado al renglón 7f:
   suma de los importes de todos los componentes de elemento MP/MOD/CIP == output.realProductionCost - wasteRecovery - extraordinaryLoss (== netProductionCost).
   Si no cierra, la contribución sale incompleta y el motivo nombra el FALTANTE EN PESOS, no un "incompleto" genérico.
5. Exponé el puente por producción en proceso como número propio: unitCost.unitFinishedGoodsCost x unidades terminadas = netProductionCost + EI producción en proceso - EF producción en proceso. Es lo que explica por qué variable + fijo no puede dar unitFinishedGoodsCost cuando hay trabajo a medio terminar.

CRITERIO DE ACEPTACIÓN (fixture AM-01, tests/fixtures/analisis-marginal/AM-01.json): 1.000 producidas, 800 vendidas, pv 500, MP 150.000 VARIABLE, MOD 60.000 FIJO, CIP 90.000 SEMIFIJO (54.000 var / 36.000 fijo), amortización 40.000 FIJO no erogable, terceros 10.000 VARIABLE, gasto variable de comercialización 30 por unidad vendida, gastos fijos de administración 56.000.
- Costo variable de producción total: 214.000
- Costos fijos totales: 192.000
- Control de suma, elementos MP/MOD/CIP: 350.000, igual a netProductionCost, diferencia 0,00
- Control de suma con los de VENTA (llega con M2-01): 430.000
ATENCIÓN: el plan v1 escribía 406.000 en este control. Es incorrecto: le falta el costo variable de comercialización de 24.000 (30 x 800). El número correcto es 430.000.

REGLAS: migración aditiva si hace falta para las claves nuevas de ParametroCosteo (NULL conserva el comportamiento histórico). Cero regresión: tests/domain/contribucion-marginal.test.ts y tests/domain/punto-equilibrio.test.ts tienen que seguir verdes con sus valores actuales. Ningún 500. ADR en el mismo PR sobre la clasificación FIJA de la amortización, citando R6 y AM17.
```

---

### M0-02 — El costo variable de producción se divide por unidades PRODUCIDAS · **CRÍTICO** · S · back

**Problema.** `contribucion-marginal.ts` hace `costoVariableTotal.divide(input.unidadesVendidas)`, alimentado con `args.input.sales.quantity`. Es el issue **#88 reaparecido en la capa nueva**: ese bug ya se corrigió en `unitCost`, que hoy declara `basadoEn: 'producidas' | 'vendidas'` y expone tres unitarios distintos con su comentario explicando por qué el divisor cambia. La capa de costeo variable no heredó la corrección.

**Qué hay que hacer.** Separar los dos costos variables: el **de producción** divide por unidades producidas; el **de comercialización** divide por unidades vendidas; `cv = cv_produccion + cv_comercializacion`. Y el resultado expone su propio `basadoEn`, igual que `unitCost`, para que la pantalla pueda avisar cuando no se cargó la cantidad producida.

**Criterio de aceptación.** `AM-01`: `cv_produccion = 214` (no 267,50), `cv = 244`, `cm = 256`, `PE = 750`. Con la cantidad producida sin cargar, `basadoEn: 'vendidas'` y un motivo que lo diga.

```texto
Separá el costo variable de producción del de comercialización en la capa de costeo variable de CosteAR y corregí el divisor.

PROBLEMA MEDIDO (src/domain/calculations/contribucion-marginal.ts): costoVariableUnitario = costoVariableTotal.divide(input.unidadesVendidas), y calculation-result-enrichment.ts lo alimenta con args.input.sales.quantity. El costo variable de PRODUCCIÓN dividido por las unidades VENDIDAS es el issue #88 reaparecido en una capa nueva. Ese bug ya se corrigió en detail.unitCost, que hoy expone unitProductionCost, unitFinishedGoodsCost y unitCostOfGoodsSold con divisores distintos y un campo basadoEn ('producidas' | 'vendidas') para que la pantalla pueda avisar. La capa de costeo variable no heredó la corrección.

QUÉ CONSTRUIR:
1. calcularContribucionMarginal recibe unidadesProducidas además de unidadesVendidas.
2. El costo variable se parte en dos: los componentes de elemento MP/MOD/CIP dividen por unidades PRODUCIDAS; los de elemento VENTA dividen por unidades VENDIDAS. cv = cv_produccion + cv_comercializacion.
3. El resultado expone costoVariableUnitarioProduccion, costoVariableUnitarioComercializacion, costoVariableUnitario (la suma) y basadoEn, con el mismo significado y el mismo comentario que ya tiene unitCost.
4. Si no se cargó cantidad producida, basadoEn = 'vendidas' y se suma un motivo legible. No se falla: se avisa.

CRITERIO DE ACEPTACIÓN (fixture AM-01): con 1.000 producidas y 800 vendidas, costo variable de producción total 214.000 y gasto variable de comercialización 30 por unidad vendida:
- cv_produccion = 214,00 (si sale 267,50 dividió por las vendidas)
- cv_comercializacion = 30,00
- cv = 244,00 ; cm = 256,00 ; punto de equilibrio = 750 unidades
- existencia final de 200 unidades = 42.800 (200 x 214). Si sale 48.800 incluyó el gasto variable de venta: ese es el error frecuente y el test lo tiene que atrapar.

REGLAS: cero regresión. Los tests existentes de contribucion-marginal usan producidas = vendidas implícitamente; actualizalos para que declaren las dos cantidades sin cambiar sus valores esperados. ADR: no hace falta, la decisión ya está tomada en el ADR 0006 / issue #88 y esto la extiende.
```

---

### M0-03 — `resultadoPeriodo` es el resultado por costeo variable, y se muestran las dos cifras · ALTO · M · back + front

**Problema.** El tablero se presenta como la vista de costeo variable y su número de cierre es `resultado.grossMargin`, que es de absorción. Son dos cifras distintas cuando producción ≠ venta y nada las distingue en pantalla.

**Qué hay que hacer.** Se agrega `resultadoPeriodoCosteoVariable` y se **conserva** `resultadoPeriodo` (absorción) con su etiqueta explícita. La pantalla muestra las dos y, cuando difieren, la diferencia explicada por la variación de inventarios. 🔴 Ninguna de las dos se esconde: `AM4` nota CosteAR — *"el absorción es una vista de salida, no el motor"*, y la RT 17 lo exige.

**Criterio de aceptación.** `AM-01`: resultado por costeo variable **12.800**, verificable también como `(800 − 750) × 256`. El de absorción difiere, y la diferencia = `200 × (costo fijo unitario de absorción)` queda explicada en pantalla.

```texto
Agregá el resultado por costeo variable al tablero del dueño de CosteAR, junto al de absorción, sin sacar ninguno de los dos.

PROBLEMA MEDIDO (src/application/cost-structures/owner-dashboard-service.ts): el sexto indicador, resultadoPeriodo, se compone con resultado.grossMargin, que es el margen bruto por ABSORCIÓN. El tablero se presenta como la vista de costeo variable del negocio. Cuando la producción no iguala a la venta las dos cifras son distintas, y en pantalla nada las distingue.

DOCTRINA (bóveda, AM4 nota CosteAR): "el costeo por absorción es una VISTA DE SALIDA para cumplir la RT 17; el motor razona en costeo variable, y la derivación es unidireccional". Las dos cifras coinciden SOLO cuando se vende todo lo producido; cuando no coinciden, la diferencia es la variación de inventarios valuada a costo fijo.

QUÉ CONSTRUIR:
1. Nuevo indicador resultadoPeriodoCosteoVariable = ventas - costo variable de producción de lo VENDIDO - costo variable de comercialización - costos fijos totales del período. Mismo contrato NumeroTablero que el resto.
2. resultadoPeriodo (absorción) SE CONSERVA, con la etiqueta explícita "resultado por costeo completo (absorción)".
3. Cuando los dos difieren, un tercer campo diferenciaPorVariacionDeInventarios con el importe y un texto que lo explique en castellano.
4. El frontend muestra los dos y la diferencia. La cifra destacada del tablero es la de costeo variable; la de absorción va al lado, no escondida.

CRITERIO DE ACEPTACIÓN (fixture AM-01): resultado por costeo variable = 12.800, verificable también como (800 - 750) x 256. Con producción 1.000 y venta 800 las dos cifras difieren y la diferencia queda expuesta y explicada. Con producción = venta, las dos cifras coinciden y diferenciaPorVariacionDeInventarios da 0,00.

REGLAS: no se elimina ningún campo del contrato. Cero regresión en tests/http/owner-dashboard.test.ts. ADR en el mismo PR sobre cuál de los dos resultados es el destacado y por qué.
```

---

### M0-04 — Contrato de unidad de gestión — desbloquea #252 · ALTO · M · back + front · **ADR**

**Problema.** `OwnerDashboardService` hardcodea `codigo: 'cajon'`. La v1 dice que ya existe el reemplazo (`Company.unidadGestion`, PR #275). ❌ **No existe.** La única mención de `unidadGestion` en `origin/dev` es la bitácora `docs/sesiones/2026-09-07-252-contrato-unidad-bloqueado.md`, que documenta que **#252 quedó sin implementar** justamente porque falta el contrato: *"Falta un contrato persistido que identifique la unidad de gestión de `Company` (por ejemplo, una FK a `UnidadMedida` o un código explícito) y el comportamiento HTTP cuando esa referencia es inválida."*

**Qué hay que hacer.** Definir el contrato que la bitácora pide y recién después reemplazar el literal. La bitácora ya descartó una alternativa (`IndustryProfile.measurementUnit`) por ser configuración de perfil y no declaración del tenant; **esa decisión se respeta**.

**Criterio de aceptación.** Una empresa con unidad de gestión declarada devuelve el tablero en esa unidad; una sin declararla devuelve los indicadores `incompleto` con la acción *"declarar la unidad de gestión de la empresa"* en `pendientes`, **no** un fallback a `'cajon'`; una con referencia inválida devuelve 422 accionable, nunca 500. Y `git grep "'cajon'" src/` no devuelve nada en la capa de aplicación.

```texto
Definí el contrato de unidad de gestión por empresa en CosteAR-backend y sacá el literal 'cajon' hardcodeado del tablero del dueño. Esto desbloquea el issue #252.

CONTEXTO IMPORTANTE, LEELO ANTES DE EMPEZAR: el issue #252 ya se intentó y quedó BLOQUEADO. La bitácora docs/sesiones/2026-09-07-252-contrato-unidad-bloqueado.md, que está en origin/dev, dice: "no existe un selector de unidad de gestión por empresa en origin/dev... Falta un contrato persistido que identifique la unidad de gestión de Company (por ejemplo, una FK a UnidadMedida o un código explícito) y el comportamiento HTTP cuando esa referencia es inválida. Sin ambos no se puede devolver la unidad ni probar el camino de falla sin inventar datos." Y ya descartó una alternativa: tomar IndustryProfile.measurementUnit, "porque es una configuración por perfil y no una declaración del tenant. Habría vuelto a introducir el valor por defecto que el issue prohíbe." RESPETÁ esa decisión: no la reabras.

PROBLEMA MEDIDO (src/application/cost-structures/owner-dashboard-service.ts): tx.unidadMedida.findFirst({ where: { companyId, codigo: 'cajon', deletedAt: null } }). Una unidad de negocio hardcodeada es una unidad que nadie puede corregir sin un PR, y rompe el tablero para cualquier tenant que no sea avícola.

QUÉ CONSTRUIR:
1. El contrato: Company.unidadGestionId, FK opcional a UnidadMedida, con onDelete: Restrict. Migración ADITIVA: NULL en todas las filas existentes.
2. Semántica de NULL: la empresa NO declaró su unidad de gestión. Los indicadores del tablero que dependen de la conversión salen incompleto, con el motivo "Falta declarar la unidad de gestión de la empresa" y una entrada en pendientes de área 'configuracion'. NO hay fallback a 'cajon' ni a ninguna otra unidad: un default acá es exactamente lo que el issue prohíbe.
3. Comportamiento HTTP ante referencia inválida (unidad borrada lógicamente, o de otra empresa): 422 accionable en castellano. Nunca 500, nunca silencio.
4. Endpoint para declararla y pantalla de configuración de empresa para elegirla de las UnidadMedida de esa empresa.
5. Sacá el literal 'cajon' de owner-dashboard-service.ts y de cualquier otro lugar de src/ donde aparezca en la capa de aplicación.

CRITERIO DE ACEPTACIÓN:
- Empresa con unidadGestionId apuntando a la unidad "cajon" (factor 360 sobre huevo): el tablero devuelve exactamente los mismos números que hoy. Regresión pura.
- Empresa con unidadGestionId NULL: costoPorCajon, precioPromedioVenta, contribucionMarginalPorCajon, puntoEquilibrioCajones y producidoCajones salen incompleto con el motivo y la acción; pendientes trae la entrada de configuración una sola vez.
- Empresa con unidadGestionId apuntando a una unidad de otra empresa o borrada: 422 con mensaje accionable.
- git grep -n "'cajon'" src/ no devuelve resultados en la capa de aplicación.

REGLAS: migración aditiva, RLS igual que el resto de las tablas tenant-scoped, cero regresión. ADR OBLIGATORIO en el mismo PR: qué es la unidad de gestión, por qué es una declaración del tenant y no del perfil de rubro, y por qué NULL no tiene default. Comentá el issue #252 con el contrato elegido antes de abrir el PR.
```

---

### M1-01 — `ConceptoCosteo` completo · **CRÍTICO** · XL · back · **ADR**

**Qué hay que hacer.** El modelo de §7.1, con los cuatro campos que la v1 no tenía: `horizonteErogableMeses` (R7), `evitable` (R19/R25), `causaVariabilidad` (R4/R6) y `rangoActividadDesde/Hasta` (R5). Cascada idéntica a `ParametroCosteo`. 🔴 Compatibilidad: una empresa sin ningún `ConceptoCosteo` resuelve exactamente como hoy contra los tres baldes. La migración **no crea** conceptos.

🔴 **Validación nueva y no negociable:** `comportamientoVolumen = VARIABLE` con `causaVariabilidad ≠ volumen` es un **422**. Es R4 y R8 hechos código, y es lo que hace estructuralmente imposible repetir el error de la amortización.

**Criterio de aceptación.** (1) Empresa sin conceptos: los seis números del tablero idénticos a los de hoy, al centavo. (2) Cargar `amortizacion_plantel` con `VARIABLE` + `causaVariabilidad = tiempo` devuelve 422 citando R6. (3) Un concepto `evitable = false` no entra al numerador de fabricar-vs-comprar (test de `M6-01`). (4) Un concepto `erogable = true` con `horizonteErogableMeses = 12` entra al punto de cierre a 12 meses y no al de 1 mes.

```texto
Creá el modelo ConceptoCosteo en CosteAR-backend: la clasificación de costos por concepto, por debajo de los tres baldes actuales.

CONTEXTO: hoy la clasificación frente al volumen vive en ParametroCosteo.comportamientoVolumen con tres claves fijas (comportamiento_materia_prima, comportamiento_mano_obra_directa, comportamiento_costos_indirectos). Un CIP real mezcla energía (variable) con depreciación (fija); con un solo balde hay que elegir una etiqueta para las dos.

QUÉ CONSTRUIR — modelo ConceptoCosteo (migración ADITIVA, RLS, denormalización de userId igual que el resto):
- companyId, userId
- structureId?, periodId?  -> misma cascada que ParametroCosteo: NULL vale para todo lo de arriba
- clave (string estable snake_case), descripcion
- elemento: CostElement (MP | MOD | CIP | VENTA) -> ancla el concepto al renglón del motor
- comportamientoVolumen: ComportamientoCosto?  (el enum que YA existe)
- causaVariabilidad: enum? (volumen | tiempo | intensidad_de_uso | precio | contrato | otra)
- erogable: Boolean?
- horizonteErogableMeses: Int?
- evitable: Boolean?
- nivelSegmentacion: String? (empresa | division | canal | linea) ; segmentoId: uuid?
- rangoActividadDesde, rangoActividadHasta: Decimal(18,6)?
- clasificadoPorUserId, clasificadoEn
- confirmado: Boolean @default(false)
- unique (companyId, structureId, periodId, clave) + índices como ParametroCosteo

POR QUÉ CADA CAMPO NUEVO (reglas duras del corpus de la bóveda):
- causaVariabilidad -> R4: la clasificación fijo/variable se define por CAUSALIDAD, no por variabilidad observada. R6: la amortización es fija si la causa es el tiempo y variable si la causa es la intensidad de uso; no hay regla por defecto.
- horizonteErogableMeses -> R7: erogable/no erogable depende del HORIZONTE del análisis. Sin horizonte, "erogable" no significa nada.
- evitable -> R19: los fijos indirectos evitables van en fila propia del estado de resultados, antes de los inevitables. R25: en la decisión de dejar de fabricar, el numerador es el fijo EVITABLE, no el total. NO es sinónimo de erogable: un alquiler con contrato es erogable e inevitable.
- rangoActividadDesde/Hasta -> R5: todo costo declarado fijo debe declarar el rango de actividad dentro del cual esa afirmación vale.

VALIDACIÓN OBLIGATORIA: un ConceptoCosteo con comportamientoVolumen = VARIABLE y causaVariabilidad distinta de 'volumen' es un error de validación con 422 accionable en castellano que cite R6/R8. Esto es lo que impide volver a clasificar la amortización del plantel como costo variable, que el corpus (AM17) llama "el error más caro del proyecto".

COMPATIBILIDAD HACIA ATRÁS (regla dura): una empresa sin ningún ConceptoCosteo cargado tiene que resolver EXACTAMENTE como hoy, contra los tres baldes de ParametroCosteo. La migración NO crea conceptos: los crea el onboarding cuando el cliente desagrega. La resolución es: si hay ConceptoCosteo para ese elemento, mandan los conceptos; si no hay ninguno, manda el balde.

CRITERIO DE ACEPTACIÓN:
1. Empresa sin ConceptoCosteo: los seis indicadores del tablero del dueño dan idénticos a hoy, al centavo. Es el test de regresión que importa.
2. POST de un concepto amortizacion_plantel con comportamientoVolumen VARIABLE y causaVariabilidad 'tiempo' devuelve 422 con el texto de R6.
3. Un concepto con erogable=true y horizonteErogableMeses=12 entra al punto de cierre calculado a 12 meses y no al calculado a 1 mes.
4. Un concepto con evitable=false queda fuera del numerador del punto de indiferencia inverso.
5. La traza (clasificadoPorUserId, clasificadoEn, origen de la cascada) se conserva por concepto igual que hoy por balde.

REGLAS: migración aditiva, ninguna fila existente cambia de comportamiento, bitácora en la misma transacción, ningún 500. ADR OBLIGATORIO: por qué la clasificación baja a nivel de concepto, por qué los tres baldes se conservan como caso degenerado, y la tabla de reglas duras R4/R5/R6/R7/R8/R19/R25 mapeada a los campos.
```

---

### M1-02 — `TramoSemifijo` + pantalla de desagregación · ALTO · L · back + front

**Qué hay que hacer.** El modelo de §7.2 con los cuatro métodos de `AM3` (puntos extremos, correlación, dispersión gráfica, declarado), `porcionFija + porcionVariable = importe` como validación dura (no ajuste silencioso), y `observacionesBase` con los pares (volumen, importe) para que el número sea auditable. La pantalla guía la separación con el método elegido.

**Criterio de aceptación.** `AM-01`: clasificar el CIP como `SEMIFIJO` y declarar 54.000 / 36.000 deja de vaciar el tablero (G5) y produce `cm = 256`. Con `porcionFija + porcionVariable ≠ 90.000`, 422. Con el método `PUNTOS_EXTREMOS` y dos observaciones, el sistema calcula la separación y la muestra antes de guardarla.

---

### M1-03 — Zona de equilibrio con clasificación incompleta · ALTO · M · back + front

**Qué hay que hacer.** Implementar §8.3. Cuando quedan conceptos sin clasificar, `punto-equilibrio.ts` devuelve `{ tipo: 'zona', qMin, qMax, conceptosQueLaEnsanchan: [{clave, etiqueta, importe, aporteAlAncho}] }` en vez de `incompleta`. 🔴 La pantalla no puede mostrar un solo número mientras el intervalo tenga ancho, y el `incompleta: true` actual se conserva para el caso en que **ni siquiera** se puede acotar (sin ventas, sin precio).

**Criterio de aceptación.** `AM-07`: con los CIP sin clasificar, la zona es `[709,09 ; 793,55]`, el concepto que la ensancha se nombra, y el valor verdadero de `AM-01` (750) cae adentro. Con todo clasificado, `tipo: 'punto'` y 750 exacto.

---

### M2-01 — Gastos de no fabricación dentro de la CM y del PE · **CRÍTICO** · L · back

**Problema.** `CostElement.VENTA` existe y se trazabiliza, pero **nunca llega** a `calcularContribucionMarginal`. Consecuencia: el punto de equilibrio de hoy es un equilibrio **de producción**, no de la empresa. Es prerrequisito de que los bloques 1, 2 y 5 sean honestos.

**Qué hay que hacer.** Los conceptos de elemento `VENTA` entran a la contribución marginal: los `VARIABLE` al `cv_comercializacion` (dividido por unidades **vendidas**), los `FIJO` al `CF`. Se toma **sólo** esta rebanada del bloque 8; el presupuesto de producción y el base cero quedan afuera (§5).

**Criterio de aceptación.** `AM-01`: el PE **cambia** al incorporar los gastos de no fabricación, y el test compara explícitamente contra la versión sin ellos. Sin gastos de venta: `cv = 214`, `cm = 286`, `CF = 136.000`, `PE = 475,52`. Con ellos: `cv = 244`, `cm = 256`, `CF = 192.000`, `PE = 750`. 🔴 **La diferencia es de 274,48 unidades — un 57,7 % — y es la medida de cuánto miente hoy el número del tablero.**

```texto
Meté los gastos de no fabricación dentro de la contribución marginal y del punto de equilibrio de CosteAR.

PROBLEMA MEDIDO: el enum CostElement de prisma/schema.prisma:1200 tiene MP, MOD, CIP y VENTA. Los costos de elemento VENTA se trazabilizan (tree-builder.ts, orders-input-points.ts) pero NUNCA llegan a calcularContribucionMarginal: calculation-result-enrichment.ts sólo pasa importes de producción. Consecuencia: el punto de equilibrio que muestra el tablero es un equilibrio DE PRODUCCIÓN, no de la empresa. Le faltan los gastos de administración y de comercialización enteros.

ALCANCE: esta tarea toma SOLO la rebanada de gastos de no fabricación. El presupuesto de producción y el presupuesto base cero quedan explícitamente fuera: necesitan política de stock, existencia final deseada y presupuesto de ventas, y son un módulo de planeamiento, no de análisis.

QUÉ CONSTRUIR:
1. Los ConceptoCosteo de elemento VENTA entran como componentes de la contribución marginal.
2. Los clasificados VARIABLE se acumulan en el costo variable de COMERCIALIZACIÓN y dividen por unidades VENDIDAS (los de producción dividen por producidas: eso lo resuelve M0-02).
3. Los clasificados FIJO se suman a los costos fijos totales del punto de equilibrio.
4. El resultado expone las dos mitades por separado (costoVariableUnitarioProduccion y costoVariableUnitarioComercializacion) y los costos fijos abiertos en fijos de producción y fijos de administración y comercialización.
5. El endpoint del tablero informa explícitamente que el punto de equilibrio pasó a ser de la EMPRESA, no de la producción, y muestra las dos cifras la primera vez que cambia.

CRITERIO DE ACEPTACIÓN (fixture AM-01): el test compara las dos versiones del mismo caso.
- SIN gastos de no fabricación: cv = 214,00 ; cm = 286,00 ; CF = 136.000 ; PE = 475,52 unidades
- CON gastos de no fabricación (30 por unidad vendida de comercialización + 56.000 fijos de administración): cv = 244,00 ; cm = 256,00 ; CF = 192.000 ; PE = 750 unidades
- La diferencia es de 274,48 unidades (57,7%) y el test la afirma explícitamente: es la medida de cuánto subestima el número de hoy.
- Control de suma con los de VENTA incluidos: 430.000.

REGLAS: migración aditiva, cero regresión, ningún 500. ADR: no hace falta uno propio si M1-01 ya explicó el modelo; sí una nota en el PR sobre por qué el resto del bloque de presupuestos queda afuera.
```

---

## 10.3 Ola C — decidir

> Los prompts de esta ola están escritos contra el modelo que entrega `M1-01`. 🔴 **No se abren como issue antes de que `M1-01` esté mergeado**: un prompt escrito hoy contra un schema que M1 va a cambiar es un prompt que miente.

### M3-01 — Familia completa de PE + los despejes · ALTO · L · back

**Qué hay que hacer.** Las siete fórmulas de §8.2 **más los seis despejes** de `AM5` §5.6 y §5.10, que la v1 no tiene y que son features de producto por derecho propio: *¿cuánta estructura aguanto?*, *¿a cuánto tengo que vender?*, *¿cuánto puedo pagar el insumo?* 🔴 Cada fórmula replica el comportamiento que `punto-equilibrio.ts` ya tiene: denominador `≤ 0` → `null` con motivo. 🔴 Y toda respuesta viaja con `basadoEn` y con el tramo de validez (llega en `M10-01`).

**Criterio.** `AM-01` completo, las 15 cifras de la clave, incluidos los tres despejes nuevos (204.800 / 564 / 180) y la trampa de la existencia final (42.800, no 48.800).

```texto
Ampliá punto-equilibrio.ts de CosteAR con la familia completa de fórmulas del capítulo 5 de Yardín.

FÓRMULAS (corpus de la bóveda, AM5 §5.5 a §5.10 — formulario consolidado en §5.10):
  Físico:                  Q  = CF / cm
  Monetario por razón:     V  = CF / RC        con RC = cm / pv   (y RC = m/(1+m))
  Monetario por marcación: V  = CF (1+m) / m
  Utilidad objetivo:       Qr = (CF + R) / cm   ;   Vr = (CF + R)(1+m)/m
  Multiproducto:           Q  = CF / (a·cm_a + ... + n·cm_n)   con participaciones en tanto por uno
  DESPEJES (los que faltan y son features de producto):
    Costo fijo máximo soportable:  CF = Q · cm
    Precio de venta necesario:     pv = CF/Q + cv
    Costo variable máximo:         cv = pv - CF/Q
    Resultado del nivel actual:    R  = Q · cm - CF
    Costo fijo con resultado:      CF = Qr · cm - R
    Margen necesario:              m  = (CF + R) / (Vr - CF - R)

REGLAS DURAS: si cm <= 0, o m <= 0, o RC <= 0, el equilibrio NO EXISTE: se devuelve null con motivoSinEquilibrio, igual que ya hace calcularPuntoEquilibrio. Nunca infinito, nunca un número forzado, nunca un guion sin explicación. Toda respuesta viaja con la lista de conceptos que la compusieron, como ya hace la contribución marginal.

CRITERIO DE ACEPTACIÓN (fixture AM-01): cm 256, CF 192.000, pv 500.
  PE físico 750 ; PE monetario 375.000 ; RC 0,512 ; utilidad objetivo 64.000 -> 1.000 unidades
  Costo fijo máximo soportable a 800 unidades: 204.800
  Precio necesario para equilibrar a 600 unidades: 564
  Costo variable máximo para equilibrar a 600 unidades: 180
  Sub-fixture AM-01b: con CF 192.000 y m 0,60, V = 512.000 (verificación: CV = 320.000, CM = 192.000 = CF)

REGLAS: funciones puras, sin base de datos, en src/domain/calculations/. Cero regresión en tests/domain/punto-equilibrio.test.ts.
```

### M3-02 — Planeamiento de resultados absoluto y % sobre capital · MEDIO · M · back + front

**Qué hay que hacer.** Las dos fórmulas de `AM5` §5.8.3 y §5.8.5, con los tres parámetros `i`, `Kf` y **`a`** — el último no existe en la v1 y sin él la fórmula no se puede escribir. ➕ 🔴 **Guarda de R12:** un objetivo expresado como porcentaje **de ventas** o **de costos** se rechaza con 422 y el mensaje explica por qué, con el ejemplo de Yardín (el empresario que cumple su objetivo sobre ventas y su situación empeora a la mitad).

**Criterio.** El ejemplo verificado del libro: `Kf=30.000, CF=8.000, cv=30, pv=100, a=0,25, i=0,10` → `Qr = 170,40`, y el resultado logrado da **3.927,80**, exactamente el pretendido. Versión monetaria con `m=0,40` → `Vr = 44.053,33`, resultado logrado **4.586,67**. Y `POST` con `objetivo: {tipo: 'porcentaje_sobre_ventas'}` → 422.

### M3-03 — Punto de cierre con horizonte · ALTO · M · back + front

**Qué hay que hacer.** §8.4. 🔴 El reemplazo `CF→CFE`, `cv→cve` se aplica a **todas** las fórmulas de `M3-01`, no sólo a la del equilibrio. 🔴 Texto obligatorio en pantalla con estas palabras: *un resultado negativo no significa que haya que cerrar*.

**Criterio.** `AM-01`: punto de cierre **593,75**; con horizonte de 1 mes vs. 12 meses, dos números distintos y los dos visibles. Entre 593,75 y 750 la pantalla dice explícitamente *"pierde económicamente y sostiene la caja"*.

### M3-04 — Estado de resultados variable en cascada de niveles · ALTO · L · back + front

**Qué hay que hacer.** §8.5, en cascada de N niveles. 🔴 Los fijos indirectos **no bajan a las columnas de las líneas** (R17). 🔴 Los evitables van en **fila propia**, antes de los inevitables (R19). 🔴 Existencia final valuada **sólo** a costo variable de producción. 🔴 La carga fabril fija no se prorratea por lo vendido.

**Criterio.** `AM-12` verde: nivel 1 = 40.000, nivel 2 = 12.000 con A en −4.000, nivel 3 = 8.000, resultado 0. Y el test falla si aparece un importe de indirecto en la columna de una línea.

### M10-01 ➕ — Tramos, PE por tramos y punto de resultado indiferente · **CRÍTICO para el piloto** · L · back + front · **ADR**

**Por qué es crítico y por qué la v1 no lo tenía.** `AM17` conclusión 2: *"Pico de Oro no tiene punto de equilibrio. No está lejos: **no existe en el tramo de capacidad actual**."* Sin esta tarea, el sistema le muestra al primer cliente un equilibrio de 598,5 cajones para un galpón que da 475,7 — aritméticamente impecable, operativamente imposible, y sin ninguna advertencia. 🔴 **Es la diferencia entre un número correcto y un número útil.**

**Qué hay que hacer.** El modelo `TramoCosto` de §7.3 y las fórmulas de §8.11. R29 (el `cm` es una tabla de tramos y todo PE se verifica contra el suyo), R30 (tramo que reemplaza vs. tramo que acumula), R31 (el punto de resultado indiferente no puede quedar pegado al techo del tramo nuevo).

**Criterio.** `AM-09` verde, las siete cifras.

```texto
Implementá el punto de equilibrio por TRAMOS en CosteAR: la respuesta del capítulo 12 de Yardín a la crítica de que el análisis marginal sólo sirve para el corto plazo.

POR QUÉ AHORA: la nota AM17 del corpus, que baja el análisis marginal al primer cliente real, concluye textual: "Pico de Oro no tiene punto de equilibrio. No está lejos: NO EXISTE EN EL TRAMO DE CAPACIDAD ACTUAL. El PE de corto plazo son 598,5 cajones; el galpón admite 6.350 aves, o sea 475,7 cajones como máximo absoluto." Hoy el sistema mostraría 598,5 sin decir nada. Un número aritméticamente correcto y operativamente imposible es peor que un número faltante.

DOCTRINA (corpus, AM14 = cap. 12 de Yardín):
- R29: el cm no es un escalar por producto sino una TABLA DE TRAMOS con rango de validez. Todo punto de equilibrio calculado DEBE verificarse contra el tramo que lo generó. Puede haber varios puntos de equilibrio, tramos enteros inoperables, y ningún punto de equilibrio.
- R30: hay dos tipos de tramo y son fórmulas distintas: el que REEMPLAZA el valor para toda la actividad, y el que SE ACUMULA por escalones.
- R31: antes de aprobar una ampliación de estructura, verificar que el punto de resultado indiferente no quede pegado al techo de la nueva capacidad.
- Punto de resultado indiferente: Qn = (Ra + CFn) / cm, donde Ra es el resultado MÁXIMO alcanzable con la estructura actual (= techo_actual x cm - CF_actual) y CFn los costos fijos de la estructura nueva. Para que convenga abordar el tramo siguiente hay que SUPERAR Qn.

QUÉ CONSTRUIR:
1. Modelo TramoCosto (migración aditiva, RLS): conceptoId o segmentoId, desde, hasta, tipo (REEMPLAZA | ACUMULA), importeFijo, cmUnitaria, techoFisico. El techo físico es lo que convierte "598,5 cajones" en "no existe en este tramo".
2. src/domain/calculations/tramos.ts, función pura: dado un conjunto de tramos y los parámetros, devuelve para cada tramo su Q, si ese Q cae dentro de [desde, hasta], y su resultado máximo.
3. calcularPuntoEquilibrio pasa a devolver, además de unidadesEquilibrio, el tramo que lo generó y su techo. Si el Q cae fuera del tramo vigente devuelve null con motivoFueraDeTramo y, si existe, el Q del tramo siguiente.
4. Punto de resultado indiferente entre dos tramos, con la alerta de R31 cuando Qn (o el PE del tramo nuevo, el que mande) queda a menos del 15% del techo del tramo nuevo.
5. La pantalla muestra la función por tramos, no un número: qué tramo está vigente, dónde está su techo, y si el equilibrio existe ahí o hay que cambiar de estructura.

CRITERIO DE ACEPTACIÓN (fixture AM-09, cifras inventadas): cm = 2.974 por unidad. Tramo 1: CF 1.780.000, techo 475,7. Tramo 2: CF 2.600.000, techo 950,9.
- Q aritmético del tramo 1: 598,52 -> el sistema devuelve null con motivoFueraDeTramo, NO el número.
- Resultado máximo del tramo 1 (Ra): -365.268,20  (475,7 x 2.974 - 1.780.000). El mejor mes posible pierde.
- PE del tramo 2: 874,24  (2.600.000 / 2.974). Cae dentro de 475,7-950,9.
- Punto de resultado indiferente Qn: 751,42  ((-365.268,20 + 2.600.000) / 2.974).
- Binding = max(PE2, Qn) = 874,24.
- Margen contra el techo del tramo 2: 76,66 unidades = 8,1% -> ALERTA de R31 ("pegado al techo").
- Resultado máximo del tramo 2: 227.976,60.

REGLAS: migración aditiva, funciones puras en el dominio, ningún 500, cero regresión (una empresa sin tramos cargados se comporta como un único tramo de rango infinito y da exactamente los números de hoy). ADR OBLIGATORIO sobre el modelo de tramos y sobre por qué un PE fuera de tramo se devuelve como null y no como número con advertencia.
```

### M4-01 — `SegmentoAnalisis` + equilibrio sectorial y específico · ALTO · XL · back + front

**Qué hay que hacer.** El modelo jerárquico de §7.4 y las fórmulas de §8.6, con las dos vistas —con y sin prorrateo— lado a lado (regla dura 6) y la vista prorrateada rotulada como no doctrinaria (regla dura 8). ➕ **La barrera de producción conjunta (R15/R16, G28):** un segmento marcado `produccionConjunta = true` no acepta costo variable propio; sus coproductos entran como ingresos ponderados por rendimiento, y un desecho con costo de eliminación se modela como coproducto de **precio negativo**. Es el caso de los huevos por tamaño, que son producción múltiple **condicionada**.

**Criterio.** `AM-02` verde, incluido el control de que las contribuciones netas sumen los indirectos (12.000 → resultado cero). Y un segmento `produccionConjunta` que recibe un costo variable propio devuelve 422 citando R15.

### M5-01 — Relaciones de reemplazo · MEDIO · M · back

§8.7. 🔴 La API devuelve las **dos** cifras de horizonte. **Criterio:** `AM-03` verde: RR 2,00; 50 → 100; corto plazo 1.900; largo plazo 900.

### M6-01 — Punto de indiferencia genérico · MEDIO · M · back + front

§8.8, un solo módulo parametrizable entre dos estructuras de costos, no cuatro features. ➕ Con R25 para la decisión inversa. **Criterio:** `AM-04` verde (4.000, y las dos estructuras cuestan 700.000 en el punto) **y** `AM-04b` verde (1.600 con el fijo evitable de 180.000). 🔴 Fabricar-vs-comprar y selección de equipos resueltos por la **misma** función.

### M7-01 — Capacidad ociosa · ALTO · M · back + front

**Qué hay que hacer (corregido, C5/C7/C9).**
1. 🔴 **Métrica por default: R22**, contribución marginal no obtenida. Ya no es una pregunta abierta.
2. **Enchufar** la capacidad ociosa de mano de obra que **ya existe** en el motor (`detail.directLabor.idleCapacity`: `idleHours`, `idleCost`, `applicableMod`, `breakdown` por tipo de improductividad, `alert` ya redactada, `destination`). No se construye: se muestra.
3. Las **dos vías** de CIP que el motor ya calcula, con el control que **sí** cierra: `presupuesto + volumen = −(aplicado − real)`.
4. 🔴 **Las tres vías NO entran en esta tarea.** Requieren una base estándar que el motor no tiene y cuya incorporación es la tarea `O1-02` del plan de Santi. Se declara como dependencia, no se improvisa.
5. 🔴 Las ociosidades de MOD y de CIP se muestran **separadas** y nunca se suman sin decirlo: son la misma idea sobre dos elementos distintos y sumarlas cuenta dos veces la misma hora.

**Criterio.** `AM-05` verde en las filas marcadas "vale hoy": cuota fija 960/h, variación volumen del motor 4.800, ociosidad R22 **25.600**, y el control de dos vías exacto. El test **no** afirma que uso + eficiencia = 9.600 contra el motor: afirma que esa descomposición está bloqueada y por qué.

---

## 10.4 Ola D — optimizar

### M8-01 — Recurso escaso y mezcla óptima · ALTO · L · back + front

§7.5 y §8.10. 🔴 El ranking sólo se muestra con `esCuelloDeBotellaActivo = true` (R26). 🔴 Con dos o más recursos activos el sistema **dice que no puede** en vez de aplicar la heurística igual (R28). ➕ **El caso real para validarlo ya está identificado (C10):** `AM17` dice que la planta de alimento está **87 % ociosa** y que por peso de capital rinde **13,3 % mensual** contra **1,71 %** de la gallina con galpón nuevo. El capital de trabajo entra como un recurso más, misma tabla, otra unidad.

**Criterio.** `AM-06` verde: 140.000 por `cme` contra 60.200 por `cm` por unidad. Con dos recursos marcados activos, 422 accionable.

### M9-01 — Programación lineal para N recursos · BAJO · XL · back · **ADR**

Se conserva la decisión 5 de la v1 íntegra: heurística ahora, LP después, y la elección real es **librería JS contra servicio Python** (`scipy.optimize.linprog` es Python; el backend es TypeScript). Es una decisión de arquitectura, no una dependencia más. **Criterio:** reproduce un óptimo global mejor que la suma de óptimos locales, con el ejemplo del cap. 11.

---

## 10.5 Ola E ➕ — lo que el corpus pide y la v1 no tenía

### M11-01 — Moneda homogénea y tasa real · ALTO · L · back · **ADR**

§8.12. 🔴 R33 `tr = (1+tn)/(1+ti) − 1`, **nunca** `tn − ti`. 🔴 R34 series en moneda homogénea con momento cero fijo. 🔴 R35 FIFO/LIFO/promedio **después** de convertir, nunca antes.

**Por qué importa acá y no en un backlog lejano.** El PPP de `raw-material.ts` promedia pesos nominales de meses distintos. En `AM-10` eso subvalúa el consumo un **16,7 %** con una inflación semestral del 50 %, y el error viaja entero al costo del producto, a la contribución marginal y al punto de equilibrio. Toda la capa de análisis marginal se apoya en números que hoy no son comparables entre períodos.

**Criterio.** `AM-10` verde. Y 🔴 mientras esta tarea no cierre, **toda serie de más de un período lleva el cartel "pesos nominales"** (regla dura 11).

```texto
Agregá moneda homogénea y tasa real a CosteAR.

DOCTRINA (corpus de la bóveda, AM16 = cap. 14 de Yardín):
- R33: tasa real tr = (1+tn)/(1+ti) - 1. NUNCA tn - ti.
- R34: las series históricas se guardan en moneda homogénea con momento cero fijo, y se re-expresan a moneda de hoy multiplicando por el último coeficiente corrector.
- R35: FIFO / LIFO / promedio ponderado se aplican DESPUÉS de convertir a moneda homogénea, nunca antes.

PROBLEMA: el promedio ponderado de src/domain/calculations/raw-material.ts promedia pesos NOMINALES de meses distintos. Con inflación, el consumo sale subvaluado y el error viaja entero al costo del producto, a la contribución marginal y al punto de equilibrio. Toda la capa de análisis marginal se apoya en cifras que hoy no son comparables entre períodos.

QUÉ CONSTRUIR:
1. Modelo de serie de índice de precios por empresa, con momento cero declarado y un valor por período. Migración aditiva; sin serie cargada, todo se comporta como hoy y las cifras salen marcadas "pesos nominales".
2. src/domain/calculations/moneda-homogenea.ts, funciones puras: reexpresar(valor, indiceOrigen, indiceDestino) y tasaReal(tn, ti).
3. La valuación de stock aplica el promedio DESPUÉS de reexpresar cada lote al índice del período de consumo. NO se toca raw-material.ts: se agrega una capa que reexpresa las entradas antes de pasárselas.
4. Toda cifra que se compare entre períodos (variación del punto de equilibrio, series del tablero) viaja reexpresada, y la API dice en qué moneda está.

CRITERIO DE ACEPTACIÓN (fixture AM-10):
- tn = 0,08 mensual, ti = 0,05 mensual -> tasa real 2,8571% (no 3,0000%). A 12 meses: x1,4034 (no x1,4258).
- Stock: 1.000 kg comprados a $100/kg con índice 100, más 1.000 kg a $150/kg con índice 150. El PPP nominal da $125/kg; el PPP en moneda homogénea al índice 150 da $150/kg. El nominal subvalúa el consumo un 16,7%.
- Sin serie de índices cargada, todos los números dan idénticos a hoy y llevan la marca de moneda nominal.

REGLAS: migración aditiva, no se toca el motor auditado (se agrega capa), cero regresión. ADR OBLIGATORIO sobre el momento cero, la fuente del índice y qué pasa con los períodos anteriores a la carga de la serie.
```

### M13-01 — Precio de transferencia interna · MEDIO · M · back + front

§7.6 y `AM-11`. 🔴 R24 para el estado de resultados por sector (precio de mercado de la etapa); 🔴 R9 para la **decisión** marginal (costo variable). Los dos conviven y la pantalla dice cuál se usa para qué. **Criterio:** `AM-11` verde — PE 493,42 a costo variable contra 510,20 a mercado, **16,78 cajones de diferencia sin que cambie un costo real**. Es `AM17` conclusión 7.

### M12-01 — Cotización de producción a pedido · MEDIO · M · back + front

§8.13 y `AM-14`. 🔴 El sistema **se niega** a informar la ganancia de un pedido individual. 🔴 La mano de obra asignada a un pedido se clasifica **fija y directa**. **Depende de `O1-01` de Santi** (la entidad `ProductionOrder`): sin órdenes no hay pedidos a los que cotizar. **Criterio:** `AM-14` verde, los tres vectores de precios.

### M14-01 — Rotación y ranking de comercio · BAJO · M · back + front

§8.14 y `AM-13`. 🔴 R32: el ranking por default es `cm/S = Vel × m`; ordenar por margen queda detrás de una advertencia. **Criterio:** `AM-13` verde — A (margen 20 %, rota 12) le gana a B (margen 60 %, rota 2) y le rinde el doble.

### V-A1 — Matriz R1–R35 verde de punta a punta · ALTO · S · back

Un test de meta-cobertura que lee §4 y falla si alguna regla dura no tiene un test con nombre asociado. Es lo que hace que este plan sea auditable dentro de seis meses por alguien que no lo escribió.

---

## 11. ➕ Colisiones con el plan de Órdenes y Procesos de Santi

La v1 no menciona el plan hermano del mismo día. Son dos colas que tocan los mismos archivos y hay **siete puntos de contacto**, tres de ellos con riesgo de regresión real.

| # | Colisión | Qué pasa si no se ordena | Resolución propuesta 🟡 |
|---|---|---|---|
| **X1** | **`O1-01` cambia `unitCost` de por-estructura a por-orden** y el CMV pasa a ser "órdenes terminadas y vendidas". La capa marginal lee `unitCost.unitFinishedGoodsCost` (el `total` del tablero) y `input.sales.quantity` | Si `M0` mergea contra el contrato viejo y `O1-01` después, `M0` se rompe entero | 🔴 **Anclar el control de suma de `M0-01` al renglón 7f (`netProductionCost`), que sobrevive a `O1-01`, y no a `unitFinishedGoodsCost`.** Ya está así en §8.1 y es la razón técnica de esa decisión. Con eso las dos colas pueden correr en paralelo |
| **X2** | 🔴 **Convención de signo de las variaciones, invertida entre el motor y el plan de Santi.** El motor: `budgetVariance = CIP real − presupuesto ajustado`, `(+)` = desfavorable, y `cost-statement.ts` renglón 7b **la suma tal cual** al costo real. El plan de Santi (`O1-02`) escribe `variación presupuesto = presupuesto ajustado − CIP real` y espera **+$220.861,38** donde el motor devuelve **−220.861,38**; ídem volumen (**−$32.000** contra **+32.000**) | Si `O1-02` invierte el signo sin tocar `cost-statement.ts`, **el costo real del producto se mueve al doble de la variación** en todos los períodos. Es una regresión silenciosa del motor auditado | 🔴 **Un ADR, una sola convención, antes de abrir `O1-02`.** Recomendación: conservar la del motor (`(+)` = desfavorable, documentada en `cost-statement.ts` líneas 36-49 con la cita de la clase 26) y corregir los signos esperados del plan de Santi. `M7-01` depende de esta decisión |
| **X3** | **`O1-03` dice que `direct-labor.ts` divide por horas pagadas.** En `origin/dev` (`07415de`) el archivo hace `hourlyRate = applicableMod / chargeableHours` y expone `idleCapacity` con `destination`, `idleCost` y `applicableMod` | O el diagnóstico de la auditoría del 06-09 quedó viejo, o el default de `destination` es `'absorbido-en-el-producto'` y por eso el efecto es el mismo | 🔴 **Verificar el valor por default de `destination` antes de abrir `O1-03`.** Si ya está en `'perdida-del-periodo'`, `O1-03` es una tarea de **UI**, no de motor, y baja de esfuerzo M a S |
| **X4** | **La capacidad ociosa se cuenta dos veces.** `O1-03` la manda al estado de resultados como línea de MOD; `M7-01` la muestra como contribución marginal no obtenida (R22) | El mismo hecho económico aparece dos veces con dos magnitudes distintas y el dueño no sabe cuál mirar | 🔴 Son **dos medidas distintas de lo mismo y hay que decirlo en pantalla**: la de `O1-03` es el **costo** de las horas ociosas; la de `M7-01` es la **contribución que no se generó**. Nunca se suman. `M7-01` entrega el texto |
| **X5** | **`O1-02` construye la base presupuestada (capacidad normal) como input propio.** `M7-01` necesita una base **estándar** para las tres vías | Sin coordinación, `M7` improvisa un estándar o entrega dos vías para siempre | `M7-01` entrega dos vías + R22 y declara `O1-02` como dependencia de las tres vías. Ver C7 |
| **X6** | 🔴 **La base de aplicación del CIP son horas trabajadas.** R11 y R23 dicen que debe medir **eficiencia** (unidades, producto representativo, facturación), **nunca tiempo trabajado**. Los dos planes construyen sobre horas | Toda la familia de variaciones queda apoyada en una base que la doctrina del propio proyecto rechaza | 🔴 **Pregunta H del anexo.** No la resuelve ninguno de los dos planes solo: es una decisión de motor y hay que tomarla una vez |
| **X7** | **`MX-04` (clasificación contra el período abierto), `O1-06` (formulario que lee el config vivo) y `E1-03`** son el mismo modo de falla en tres capas: "el estado del período seleccionado se resuelve contra el período abierto más reciente" | Se arregla tres veces con tres criterios distintos | 🔴 **Un solo ADR** — "el período seleccionado manda sobre el período abierto" — referenciado por las tres tareas |

**Orden de merge sugerido 🟡:** Ola A completa (5 PRs chicos, independientes de todo) → `M0-01`/`M0-02` (ancladas al 7f, sobreviven a O1-01) → en paralelo, la Ola 1 de Santi → `M0-04` y `M1-01` → el resto de la Ola B → Ola C, con `M10-01` adelantado.

---

## 12. Riesgos

Se conservan los seis de la v1 y se agregan cinco.

| Riesgo | Por qué pasa | Qué lo baja |
|---|---|---|
| Construir M3 sobre la base rota | M0 no se ve, no tiene pantalla y parece opcional | M0 es dependencia declarada de todo, y su entregable es el control de suma |
| Que el prorrateo mate una línea rentable | Es el resultado que sale por default de una vista de Costeo Completo | Regla dura 6: la vista sin prorrateo va siempre al lado |
| Que el ranking por recurso escaso se muestre sin cuello de botella real | Es la pantalla más vistosa del plan | `esCuelloDeBotellaActivo` como condición de render |
| Dos puntos de equilibrio conviviendo | `ScenarioSimulator.tsx` calcula el suyo | **`MX-05` lo cierra ahora**, sin esperar a `CosteAR-frontend#94` |
| Que "resultado negativo" se lea como "cerrá" | Es la lectura intuitiva y es falsa | Regla dura 5, con texto obligatorio |
| Sobre-modelar la segmentación con un solo cliente | Mismo riesgo que el plan 2 nombró para los rubros | La regla de los dos casos. Hoy hay dos —canal y variante— y los dos están en `VentaProducto` |
| ➕ **Mostrarle al primer cliente un equilibrio imposible** | El `Q` sale de una división que siempre da un número; nada lo verifica contra el techo del galpón | 🔴 `M10-01` y la regla dura 10. **Es el riesgo con más costo comercial de todo el documento**: es el número que Augusto va a mirar primero |
| ➕ **Regresión silenciosa del motor por el signo de las variaciones** | Dos planes con dos convenciones opuestas sobre el mismo campo, y `cost-statement.ts` lo suma tal cual | X2: un ADR antes de `O1-02` |
| ➕ **Que la Ola A no se haga porque "no es un módulo"** | Son cinco PRs chicos y ninguno tiene una feature nueva que mostrar | Son los únicos números que el cliente **ya está mirando**. Un módulo nuevo sobre un conversor que divide por el precio equivocado no arregla nada |
| ➕ **Comparar períodos en pesos nominales** | La inflación no aparece en ninguna fórmula, así que no se ve | Regla dura 11 (cartel obligatorio) hasta que `M11-01` cierre |
| ➕ **Que la capa marginal consuma la distribución de costos conjuntos** | `joint-costs.ts` existe, funciona y devuelve números lindos | La barrera de `produccionConjunta` en `M4-01` (R15/R16), con 422 |

---

## 13. Anexo — decisiones y preguntas

### 13.1 Decisiones ya tomadas — se conservan íntegras

| # | Pregunta | Decisión (Lautaro, 07-09-2026) | Estado tras la re-verificación |
|---|---|---|---|
| 1 | ¿El Costeo Variable convive como capa paralela permanente, o reemplaza algo del reporting interno? | **Capa paralela permanente.** El motor de absorción es obligatorio para estados contables. 🔴 No se toca el motor | ✅ **Confirmada por doctrina.** R14 y la nota CosteAR de `AM4` §4.6 dicen exactamente eso |
| 2 | Fijos indirectos: ¿posición de Yardín o prorrateo tradicional? | **Los dos modos, configurables, `sin_prorrateo` por default** | 🟡 **Se conserva, con una obligación agregada.** R17 dice "nunca se prorratean". La decisión sobrevive como decisión de producto; el precio es la regla dura 8 (rótulo de no doctrinaria) |
| 3 | ¿Mezcla óptima (4) o análisis sectorial (5) primero? | **Bloque 5 primero** | ✅ Confirmada. `VentaProducto.canal` y `.variante` existen e están indexados |
| 4 | ¿Margen de marcación en la Fase 1? | **Sí** | ✅ Confirmada, y reforzada: `AM5` §5.7 da la derivación completa y `RC = m/(1+m)` los liga |
| 5 | ¿Heurística o programación lineal? | **Heurística de un recurso ahora (M8), LP en M9** | ✅ Confirmada. R28 respalda el corte |
| 6 | ¿Quién escribe el contenido de bóveda? | **Se flagea, no se asume** | ✅ Sigue viva como **D** |
| + | ¿Qué hace la Fase 1 con los semifijos? | **Separar el tramo variable**, con los tres métodos de la bóveda | ✅ Confirmada (`AM3`) |

### 13.2 ➕ Preguntas que este documento **cierra** con doctrina

| # | Pregunta de la v1 | Cierre |
|---|---|---|
| **A** *(era bloqueante de M7)* | ¿Qué métrica de capacidad ociosa por default? | ✅ **Cerrada por 🔴 R22:** *"La capacidad ociosa se reporta como contribución marginal no obtenida, en pesos que el empresario recuperaría."* La recomendación de la v1 coincidía con la regla; faltaba citarla. **M7 queda desbloqueada** |
| **C** *(conviene antes de M8)* | ¿Cuál es el recurso escaso real de la avícola? | ✅ **Cerrada por `AM17` §0.4 y §0.5:** la planta de alimento **no** es el recurso escaso (está 87 % ociosa); los escasos son la **capacidad de galpón** —que ya está en el techo— y el **capital de trabajo**. Y hay un ranking por peso de capital calculado: alimento 13,3 % mensual contra 1,71 % de la gallina con galpón nuevo |

### 13.3 Preguntas vivas

**Bloquean `M4-01`:**

- **B.** ¿Qué niveles de segmentación existen para el tenant avícola: sólo canal y variante, o hace falta también "galpón" o "lote" como nivel con costos fijos directos propios? Cambia si `SegmentoAnalisis` se puebla sólo desde `VentaProducto` o también desde `UnidadProductiva` y `LoteProductivo`. *(v1, sigue viva)*
- **E.** ¿Se acepta `CosteAR-frontend#94` como dependencia de `M4`? *(v1)* 🟡 **Matizada:** `MX-05` cierra las dos partes urgentes (el `Infinity` y los dos bloques hardcodeados) sin esperar al #94, así que deja de ser bloqueante y pasa a ser deseable.

**Bloquean `M7-01` y `O1-02` de Santi — ➕ nuevas:**

- **G.** 🔴 **¿Qué convención de signo rige para las variaciones?** El motor y el plan de Santi dicen cosas opuestas sobre el mismo campo, y `cost-statement.ts` renglón 7b lo suma tal cual al costo real. Recomendación 🟡: conservar la del motor. **Es la pregunta con más riesgo de regresión silenciosa del documento.**
- **H.** 🔴 **¿La base de aplicación del CIP pasa a medir eficiencia (unidades, producto representativo) en vez de tiempo trabajado?** R11 y R23 lo exigen; el motor usa horas; cambiarlo toca el motor auditado. Es una decisión de motor que ninguno de los dos planes puede tomar solo.
- **I.** ¿Cuál es el valor por default de `idleCapacity.destination`? De eso depende si `O1-03` es una tarea de motor o de UI, y si `M7-01` tiene que advertir de doble conteo.

**Bloquean `M10-01`:**

- **K.** ➕ ¿Quién declara el **techo físico** del tramo actual de cada tenant, y con qué evidencia? Para la avícola es la capacidad del galpón (6.300–6.400 blancas, confirmada el 14-08). Sin ese dato el sistema no puede decir "este equilibrio no existe en tu tramo", que es el punto entero de la tarea.

**Bloquean `M11-01`:**

- **J.** ➕ ¿Qué serie de índice de precios se usa como coeficiente corrector (IPC, IPIM, una propia del cliente), quién la carga y con qué frecuencia? Y qué pasa con los períodos anteriores a la carga de la serie.

**No bloquean, pero conviene cerrarlas:**

- **D.** ¿Quién escribe la guía operativa de bóveda de §14? *(v1)* Sigue sin dueño.
- **F.** ➕ ¿Dónde vive este documento? `docs/planes/` no existe en ninguno de los dos repos (C4).

---

## 14. Qué es contenido de bóveda y qué es código *(v1, conservado, con una corrección)*

**Bóveda / RAG — no es trabajo de este repo.** Una guía operativa nueva en `000 - MOC Metodologías de Costeo` que unifique Yardín y las clases de Alfred en el formato de las guías 01–09. El insumo ya existe y no hay que leer nada nuevo: hay que destilarlo. El indexador (`src/application/vault-indexer/`) reindexa solo.

➕ **Corrección:** la v1 dice que el insumo son "las 14 notas del MOC Yardín". El corpus curado tiene **AM0–AM18 (19 notas) más P1–P4**, y **`AM17` ya es la bajada al caso avícola con las cifras calculadas y un script de verificación**. La destilación es todavía más barata de lo que la v1 estimaba, y `AM17` debería ser el punto de partida, no el MOC.

**Código de producto.** Todo lo demás. 🔴 Ningún módulo de este plan necesita que la guía de bóveda exista para poder construirse.

---

## 15. ➕ Anexo — diferencias contra la v1 de Lautaro

Lo que sigue es el resumen de qué cambió, para que se pueda leer sin releer los dos documentos.

### Lo que se conservó sin tocar

Las 14 brechas con su numeración · la tabla §2.1 de lo que está bien · las 7 reglas duras de fase · el diagrama de capas · `ConceptoCosteo`, `TramoSemifijo`, `SegmentoAnalisis`, `RecursoEscaso` · las fórmulas §8.2 a §8.10 · los 6 fixtures `AM-01` a `AM-06` · las 10 fases M0–M9 con sus dependencias · los 6 riesgos · las 7 decisiones del anexo · la tabla de brechas de negocio de §3 · la priorización razonada de los 9 bloques · el criterio de "un repo por issue" · la sección de bóveda vs. código.

### Lo que se corrigió — 12 puntos

`C1` la amortización es fija, no variable *(R6, R8, `AM17`)* · `C2` `Company.unidadGestion` no existe y #252 está bloqueado · `C3` los commits de auditoría · `C4` `docs/planes/` no existe · `C5` la capacidad ociosa de MOD ya está viva en el motor · `C6` el control de suma de `AM-01`: 430.000, no 406.000 · `C7` `AM-05` no cierra contra el motor · `C8` el control se ancla al renglón 7f, y falta el puente por producción en proceso · `C9` la pregunta A ya está contestada por R22 · `C10` la pregunta C ya está contestada por `AM17` · `C11` la decisión 2 suaviza R17 y necesita rótulo · `C12` el estado de resultados es en cascada de niveles, no plano.

### Lo que se agregó

**17 brechas nuevas** (`G15`–`G31`), de las cuales tres son bugs con número mal **ya en producción**: el conversor de pesos a cajones (`G15`), el costo fijo unitario (`G16`) y el fijo parcial presentado como completo (`G18`).

**Una ola entera nueva y anterior a todo** (`MX-01` a `MX-05`): cinco PRs chicos sobre los números que el dueño ya está viendo.

**Cinco fases nuevas** que salen del corpus que la v1 declara como doctrina y no usa: `M10` tramos y fractura de fijos (`AM14`, R29/R30/R31) · `M11` moneda homogénea y tasa real (`AM16`, R33/R34/R35) · `M12` producción a pedido (`AM18`) · `M13` transferencias internas (R9/R24) · `M14` rotación (`AM15`, R32).

**Ocho fixtures nuevos** (`AM-07` a `AM-14`) más dos sub-fixtures (`AM-01b`, `AM-04b`), todos con la aritmética verificada a mano.

**La matriz R1–R35 → módulo → test** (§4) y la tarea `V-A1` que la mantiene verde.

**Cuatro campos nuevos en `ConceptoCosteo`** que el corpus exige y la v1 no tiene: `causaVariabilidad`, `horizonteErogableMeses`, `evitable`, `rangoActividadDesde/Hasta`. Más dos modelos nuevos: `TramoCosto` y `PrecioTransferencia`.

**Cinco reglas duras de fase** (8 a 12), la más importante de las cuales es la 10: todo PE viaja con su tramo, y un PE fuera de tramo es `null`, no un número.

**La sección §11 de colisiones con el plan de Santi**, con siete puntos de contacto y dos riesgos de regresión silenciosa del motor.

**Seis preguntas nuevas** (`G` a `K` más `F`), dos de ellas bloqueantes de tareas de las dos colas.

### Lo que se sacó

Nada.

---

*Documento v2, 07/09/2026. Verificado contra `CosteAR-backend` `origin/dev` = `07415de` y `CosteAR-frontend` `origin/dev` = `bf70d3d`, con archivo y línea donde la línea es el punto; la doctrina, contra el Corpus Costos Curado (`AM0`–`AM18`, `P1`–`P4`) y las reglas duras `R1`–`R35`. Los fixtures son cifras inventadas y su aritmética está recalculada a mano, una por una. La v1 de Lautaro se conserva íntegra: este documento la corrige y la amplía, no la reemplaza en lo que dijo bien.*

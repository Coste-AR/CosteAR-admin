# 2026-08-20 — Cuatro defectos que hacían que el costo de un producto saliera mal

- **Repo(s):** backend
- **Ramas:** `fix/prorrateo-secundario-sin-reparto` · `fix/costo-unitario-produccion-en-proceso` · `fix/cpv-unitario-por-unidades-vendidas` · `fix/estado-de-costos-variacion-presupuesto`
- **PRs:** [#103](https://github.com/Coste-AR/CosteAR-backend/pull/103) · [#104](https://github.com/Coste-AR/CosteAR-backend/pull/104) · [#105](https://github.com/Coste-AR/CosteAR-backend/pull/105) · [#106](https://github.com/Coste-AR/CosteAR-backend/pull/106)
- **ADRs:** backend#0007 · [backend#0005](https://github.com/Coste-AR/CosteAR-backend/blob/fix/prorrateo-secundario-sin-reparto/docs/adr/0005-cortar-el-calculo-si-el-prorrateo-secundario-no-cierra.md) · [backend#0006](https://github.com/Coste-AR/CosteAR-backend/blob/fix/costo-unitario-produccion-en-proceso/docs/adr/0006-el-costo-unitario-de-terminados-va-al-lado-del-de-produccion.md)
- **Estado:** en review — los cuatro PRs abiertos, ninguno mergeado
- **Issues:** cierra [#91](https://github.com/Coste-AR/CosteAR-backend/issues/91), [#89](https://github.com/Coste-AR/CosteAR-backend/issues/89) y [#88](https://github.com/Coste-AR/CosteAR-backend/issues/88); avanza [#90](https://github.com/Coste-AR/CosteAR-backend/issues/90) sin cerrarlo — los cuatro primeros del **Bloque C** del reparto del 20-08

## Qué se hizo

Cuatro arreglos en el motor de cálculo. Los cuatro tenían la misma característica y por eso eran
peligrosos: **el sistema no daba ningún error, simplemente devolvía un número equivocado.**

- **Un centro de servicio podía desaparecer del cálculo.** Si un centro de servicio
  (mantenimiento, administración de planta: los que no fabrican pero cuestan) no tenía cargado a
  qué centros productivos le reparte su costo, ese costo **se evaporaba**. No aparecía en ningún
  lado y el costo del producto salía más barato de lo que realmente es. Ahora el sistema **frena
  y avisa** cuál es el centro al que le falta el reparto, en vez de seguir con un número más
  chico. Sobre el caso de prueba de la cátedra el faltante medido era del 1,46 %, y crece con el
  tamaño del centro de servicio.

- **La producción sin terminar no movía ningún costo unitario.** Un mes donde parte del trabajo
  quedó a medio hacer daba exactamente el mismo costo por unidad que un mes donde se terminó
  todo, y eso no puede ser. Ahora el resultado trae **un renglón nuevo**: el costo por unidad de
  lo que efectivamente salió terminado.

- **El costo de lo vendido se dividía por las unidades producidas.** Producir 100 y vender 60
  daba un costo por unidad vendida un 40 % más bajo que el real. Ahora cada número se divide por
  las unidades que le corresponden: lo producido por las producidas, lo vendido por las vendidas.

- **El estado de costos se quedaba en el costo "normal" y lo trataba como si fuera el real.**
  Cuando la carga fabril real de un mes no coincide con la presupuestada, esa diferencia —la
  *variación presupuesto*— es parte de lo que costó producir, y no estaba entrando al costo del
  producto. Ahora el estado muestra las dos líneas: el costo normal y el costo real.

## Por qué

Los cuatro salieron de la auditoría del 20-08: el primero es el hallazgo **L1** de Lautaro sobre
el motor de costos por órdenes, y los otros tres son hallazgos propios de esa misma revisión. Los
cuatro estaban en el Bloque C del reparto, que es el que mueve números de plata y por eso quedó
del lado de Santiago.

Con un cliente real usando el sistema desde agosto, **un costo mal calculado no es un error de
software: es una lista de precios mal armada.** Ninguno de los cuatro avisaba de ninguna manera.

## Decisiones que se tomaron sobre la marcha

- **El arreglo del issue #89 no es el que pedía el issue, y hay que leer el ADR antes de
  aprobarlo.** El issue proponía cambiar la fórmula del costo unitario de producción. Se fue a
  buscar la clase 2 de Mirta y **la cátedra dice que la fórmula que el código ya tenía es la
  correcta**: el costo unitario de producción se calcula sobre el costo del período, antes de
  ajustar por la producción sin terminar. Que no se mueva no es el defecto. El defecto era que
  faltaba el renglón siguiente del estado de costos. Por eso el número nuevo se agrega **al lado**
  del viejo y no en su lugar. Las alternativas descartadas están en el ADR 0006.

- **Quedó fijada la definición de "Cantidad producida"**, el dato que el usuario carga en la
  sección Venta: son las **unidades terminadas en el período**. De eso depende que el renglón
  nuevo divida por el número correcto. Si esa definición cambia, hay que revisar el ADR 0006
  entero.

- **Se decidió cortar el cálculo, no avisar y seguir.** Cuando falta el reparto de un centro de
  servicio el sistema devuelve un error accionable en castellano y no calcula. La alternativa era
  mostrar una advertencia al lado del número: se descartó porque una advertencia al lado de un
  número mal calculado se ignora.

- **Hay dos variaciones y van a lugares distintos.** La *variación presupuesto* (lo que costó de
  más o de menos hacer lo que se hizo) es costo del producto y ahora entra al estado de costos. La
  *variación volumen* (la capacidad que se pagó y no se usó) es una pérdida de la empresa y va al
  estado de resultados: **se dejó afuera a propósito.** La cátedra marca esa confusión como el
  punto que más se olvida.

- **Los trabajos de terceros quedaron afuera.** Es otro renglón que falta en el estado de costos,
  pero no existe en el sistema: no hay campo, ni pantalla, ni dato. Es una funcionalidad nueva, no
  una cuenta mal hecha, y agrandar el trabajo sin avisar no corresponde. **Por eso el issue #90
  queda abierto.**

- **El PR #105 se apiló sobre el #104** en vez de salir de `dev`, porque tocan las mismas líneas
  del mismo archivo. **La cadena se mergea de abajo hacia arriba: #104, después #105, después #106.**

## Lo que apareció sin estar en ningún issue

- **Una función del prorrateo modificaba los datos que recibía.** Al escribir el control de
  seguridad se descubrió que el reparto secundario **alteraba el resultado del reparto primario**
  del que partía. Hoy no cambiaba ningún número porque nadie volvía a mirar ese dato, pero
  invalidaba cualquier control que comparara las dos etapas. Corregido en el PR #103.

- **Un test consagraba uno de los defectos.** Existía un test llamado *"el COGS unitario usa el
  mismo divisor que el costo de producción unitario"*, que afirma exactamente lo contrario de lo
  que dice la cátedra. La suite estaba certificando el error. Se reescribió.

- **El caso de prueba "D01" que cita la auditoría no existe en ninguno de los cuatro repos.**
  Solo están sus números en el documento de auditoría. El caso de órdenes se cubrió con el
  fixture "Dorado", que sí vive en el repo y tiene el mismo centro de mantenimiento. Si D01 está
  en la máquina de Lautaro, conviene que lo reproduzca ahí.

## Qué quedó pendiente

- **El renglón nuevo de costo unitario no se ve en ninguna pantalla.** El backend lo calcula pero
  la pantalla de resultado sigue mostrando solo el número viejo. Es un cambio del repo de
  frontend y no se metió acá sin avisar. Mientras tanto es exactamente el patrón que persigue el
  issue [#98](https://github.com/Coste-AR/CosteAR-backend/issues/98): algo calculado que nadie usa.
- **El issue [#90](https://github.com/Coste-AR/CosteAR-backend/issues/90) queda abierto** por los
  trabajos de terceros, que son una entrada nueva de punta a punta.
- **Del Bloque C falta el [#92](https://github.com/Coste-AR/CosteAR-backend/issues/92)**: conectar
  el módulo de desperdicio, que existe y nadie llama.
- **Los cuatro PRs esperan review y merge.** Ninguno se mergea el mismo día que se abre (REV-07).

## Cómo verificarlo

Desde `CosteAR-backend`, parado en cada rama:

```bash
npx vitest run tests/application/hl1-secundario-no-pierde-costo.test.ts
npx vitest run tests/application/costo-unitario-produccion-en-proceso.test.ts
npx vitest run tests/application/cpv-unitario-por-vendidas.test.ts
npx vitest run tests/application/estado-de-costos-variacion-presupuesto.test.ts
```

La suite completa quedó en **1342 tests, 0 fallidos**, con `npm run typecheck` y `npm run lint`
limpios (los 20 warnings que salen ya estaban antes de esta sesión).

En pantalla: guardar Costos Indirectos con un centro de servicio sin reparto cargado. Tiene que
aparecer un error que nombre a ese centro, y no un cálculo que termina bien.

## Riesgos abiertos

- **Estructuras ya cargadas pueden dejar de calcular.** Si a alguna le falta el reparto de un
  centro de servicio, ahora frena hasta que se complete. Es deliberado —antes calculaba mal— pero
  es un cambio de comportamiento que se puede notar como "se rompió". No se puede saber de
  antemano a cuántas afecta sin mirar los datos de producción.
- **El control de cierre del prorrateo usa una tolerancia de medio centavo**, que es un umbral
  elegido por nosotros y no una regla de la cátedra. Está muy por encima del error de redondeo y
  muy por debajo de cualquier pérdida real, pero es un número decidido.
- **Ahora hay dos costos unitarios parecidos en el resultado**, y dos números parecidos se
  confunden. Que no pase es trabajo de la pantalla: hay que etiquetarlos con las palabras del
  estado de costos, no con jerga.
- ⚠️ **Los períodos ya calculados que tengan variación presupuesto van a dar distinto si se
  recalculan**, y el margen bruto con ellos. En el caso de prueba de la cátedra son $21.500 más de
  costo. Es el arreglo funcionando —antes esa plata no llegaba al costo del producto—, pero
  conviene saberlo antes de mergear y no descubrirlo comparando dos números que "no coinciden".
- **No se sabe todavía qué SHA corre en producción**, así que no se puede afirmar si estos tres
  defectos están afectando al cliente hoy. Depende del Bloque E (desatascar el pipeline).

# 2026-08-18 — El motor ya sabe contar cajones de huevo (y dividía mal el costo unitario)

- **Repo(s):** backend
- **Rama:** `feat/fixture-avicola` · `feat/alertas-cierre` · `feat/parametro-costeo` · `feat/amortizacion-y-desperdicio` · `feat/tenant-pico-de-oro`
- **PRs:** #67 y #68 (mergeados) · #69, #70 y #71 (abiertos, en cadena)
- **ADRs:** `0002` (unidad de medida y parámetros) · `0003` (subproducto de Categoría 2, sin resolver)
- **Estado:** 4 de 6 tareas del carril terminadas

## Qué se hizo

Se implementó la parte de Santi del plan del vertical avícola: lo que hace falta para que el
sistema pueda costear una granja de ponedoras, donde todo se mide en **cajones de huevo** (360
huevos) y no en unidades sueltas.

- **Los números del plan no cerraban con sus propios datos.** La tabla de aceptación estaba
  calculada a mano y arrastraba un error desde el costo del alimento. Se rehízo como test, con
  cada valor **derivado** de los insumos en vez de escrito a mano: si mañana cambia el precio del
  alimento, los números se recalculan solos.
- **El costo unitario se dividía por las unidades vendidas, no por las producidas.** Producir 100
  y vender 60 daba un costo unitario **66 % más alto** que el real. Es el número con el que se
  pone precio.
- **El plantel de gallinas ahora es un activo que se amortiza**, no un gasto del mes en que se
  compra. Antes, comprar las gallinas hacía ver un mes catastrófico y los siguientes,
  engañosamente baratos.
- **El desperdicio necesita que alguien diga de qué tipo es.** Si nadie lo declara, no entra al
  cálculo: queda pendiente. El sistema no elige por el costista.
- **Se enchufó el detector de anomalías** que estaba escrito, probado y sin usar, y se sacó una
  versión casera peor que corría en su lugar.
- **Las constantes del negocio salieron del código.** Cuántos huevos entran en un cajón o cuántos
  meses dura un lote ahora se cargan y se editan, con la cascada período → estructura → empresa.

## Por qué

Hay un cliente real en producción. Un número mal calculado no es un bug: es una decisión de
negocio equivocada del cliente. Todo lo de arriba salió de auditar contra el código real y
encontrar que varias cosas que el plan daba por hechas no estaban, y que dos cuentas del plan
estaban mal.

## Lo que falló y cómo se arregló

- **Un test fallaba 1 de cada 50 veces por el reloj.** Verificaba que un dato no se filtrara,
  pero revisaba también la marca de tiempo del servidor. Cuando la hora contenía cierto número,
  fallaba sin que nada estuviera mal. Medido: **20 de cada 1.000 milisegundos**.
- **Prisma quería borrar los índices de la búsqueda de la bóveda.** Al generar cada migración
  empaquetaba nueve órdenes de borrado que no tenían nada que ver, por una inconsistencia vieja
  del esquema. Aplicarlas habría roto la búsqueda **en silencio**. Se filtraron a mano las dos
  veces. **La causa sigue sin resolverse** y va a reaparecer en cada migración nueva.
- **Dos errores de datos del plan.** Uno decía "$800 por cabeza" y a la vez daba un total que
  correspondía a $10.666. Cargar $800 subestimaba la amortización 13 veces. El otro: la
  producción declarada implica un porcentaje de postura que no coincide con ninguno de los dos
  que usa el mismo documento.
- **Se subieron datos comerciales del cliente a un repositorio público.** Ver abajo.

## 🚨 Lo más importante que hay que revisar

**El repositorio del backend es público, y ahí quedó la estructura de costos del cliente**: su
costo por cajón, su punto de equilibrio, su precio de venta y el hecho de que hoy opera a
pérdida. Con el nombre del cliente al lado.

Parte de esa práctica **ya venía de antes** (el archivo de vocabulario y un ejemplo en las reglas
del equipo ya lo nombraban), pero esta sesión **aumentó mucho** lo expuesto: pasó de un nombre
suelto a la estructura económica completa.

Está cargado como issue en el repositorio privado, no en el público — escribirlo en el público
sería señalar dónde mirar: `CosteAR-admin#18`.

### Qué se acordó hacer, y cuándo

Decidido con Santiago la madrugada del 18-08-2026. Los dos primeros pasos quedan comprometidos
para la próxima sesión; el tercero es una decisión que no toma el equipo técnico.

| Paso | Qué | Estado |
|---|---|---|
| 1 | **Anonimizar** archivos, nombres de archivo, ramas y cuerpos de PR: nombres y cifras reales por datos ficticios. La matemática y los tests quedan intactos | ✅ Hecho la misma madrugada |
| 2 | **Escribir la regla** en el `CLAUDE.md` de los tres repos: los datos de un cliente no entran a un repositorio público | ✅ Hecho |
| 3 | Decidir sobre el **historial de git** y sobre **avisarle al cliente** | ⏳ Sin fecha. Decisión de Santiago |

Los dos primeros se hicieron en el momento, sin esperar. Quedó verificado con `git grep` que el
nombre del cliente no aparece en ningún archivo de la rama principal. **Los tests siguen probando
exactamente lo mismo**: lo que se prueba es la matemática, y ésa no depende de que las aves sean
6.300 o 5.000.

**Lo que la anonimización no resuelve, dicho claro:** el historial de git es permanente. Baja lo que
se ve al entrar al repositorio y lo que aparece en una búsqueda, pero no borra lo ya publicado. El
repositorio es público desde hace tiempo y puede estar clonado o indexado. Reescribir el historial
obliga a forzar el repositorio y les rompe la copia a todos, así que se evalúa aparte.

Queda anotado además como comentario en los PRs #67, #69, #70 y #71, para que nadie los dé por
cerrados sin ver esto.

## Un problema que apareció al final

**S-03, S-04 y el seed del tenant nunca habían llegado a la rama principal.** Los pedidos de
integración estaban encadenados uno sobre otro y se integraron contra su rama de origen en vez de
contra la principal, así que el trabajo quedó en ramas que ya nadie mira. Se detectó al anonimizar,
por casualidad. Quedó todo junto en un pedido nuevo.

Es una lección sobre encadenar trabajo: si se integra fuera de orden, **el trabajo se pierde de
vista sin que nada falle**.

## Qué quedó pendiente

- Las dos tareas que faltan del carril: el sistema de reglas de alerta y las fotos por WhatsApp.
- Dar de alta la empresa del cliente y confirmar con él los cuatro parámetros que hoy son
  estimaciones del relevamiento.
- La inconsistencia del esquema que rompe las migraciones.
- Decidir cómo se trata la venta de gallina de descarte: hoy no tiene dónde registrarse.

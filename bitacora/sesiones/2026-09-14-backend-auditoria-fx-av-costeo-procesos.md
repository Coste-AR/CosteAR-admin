# 2026-09-14 — Auditoría de punta a punta sobre staging: dos bloqueos críticos para el vertical avícola

- **Repo(s):** backend (CosteAR-backend), con verificación en pantalla contra frontend (CosteAR-frontend)
- **Rama:** `auditoria/AUD-2026-09-14` (local, no publicada — no hay PR)
- **PRs:** — (esta sesión no genera código, solo auditoría)
- **ADRs:** —
- **Estado:** commit local en `auditoria/AUD-2026-09-14` (`4f691e4`), sin push, sin PR

## Qué se hizo

- Se auditó todo lo que entró a `staging` desde la última auditoría (39 PR de backend, 34 de frontend), con el foco puesto en Costeo por Procesos y el vertical avícola, que es el del cliente piloto.
- Se armó, desde cero, el mapa completo del API de Costeo por Procesos (11 endpoints) — no existía documentado en ningún lado accesible.
- Se cargó un período real (enero) de una granja avícola de prueba (Granja → Fraccionadora) contra el servidor real, con datos reales de por medio, no simulados.
- Se probó en pantalla el tablero del dueño, el conversor de pesos a cajones, y el comportamiento con datos sin clasificar.
- Se corrió el motor de cálculo puro (sin base de datos) contra un set de casos de prueba de una avícola inventada, con cifras que cierran matemáticamente.

## Por qué

Rutina: antes de promover una tanda grande a producción, se audita que los números que le van a llegar al cliente estén bien. Esta vez el foco fue el costeo por procesos porque es el motor que usa directamente el cliente piloto (avícola).

## Lo que se encontró — dos bloqueos que impiden usar el producto en este rubro

1. **La conversión entre huevos, maples y cajones no se puede cargar sin romper el cálculo.** El sistema pide una razón exacta para convertir 360 huevos en 1 cajón, pero la guarda con menos precisión de la que esa cuenta necesita — y como consecuencia, el número matemáticamente correcto (750 cajones, por ejemplo) queda rechazado por el propio sistema. Pasa con las tres conversiones del rubro (huevo→maple, maple→cajón, huevo→cajón), no es un caso raro: es la cuenta que define a todo el rubro avícola.

2. **Cerrar un mes no lo protege de cambios posteriores.** Se probó: clasificar un costo como "fijo", cerrar enero, abrir febrero, reclasificar ese mismo costo como "variable" — y al volver a mirar enero (ya cerrado), el sistema muestra la clasificación nueva, no la que tenía cuando se cerró. Eso significa que un ajuste hecho hoy le puede cambiar retroactivamente el resultado a un mes que el cliente ya dio por cerrado, sin ningún aviso.

Además, en pantalla: el conversor de "cuánto me cuesta esto en cajones" sigue dividiendo por el precio de venta en vez de por el margen — el mismo error que ya se sabía que existía, confirmado hoy en vivo con un caso concreto ($1.000.000 muestra 0,06 cajones, cuando la cuenta correcta da un número bien distinto).

## Decisiones que se tomaron sobre la marcha

- Para poder seguir auditando el resto del período pese al bloqueo de la conversión, se cargó un valor "forzado" (750,06 en vez de 750). Queda clarísimo en los papeles cuáles números son válidos igual (las relaciones internas del motor, que no cambian aunque el input esté forzado) y cuáles quedan sin poder verificarse contra el caso de prueba hasta que se arregle el bloqueo.
- No se llegó a cargar los otros tres meses de prueba (febrero, marzo, abril) porque cargar cada uno hereda el mismo problema del anterior y no aporta nada nuevo mientras el bloqueo de la conversión siga ahí.
- De las 35 reglas de negocio que se revisan en cada auditoría, esta vez solo se pudieron chequear 13: la lista completa de las 35 no estaba disponible desde la terminal en esta sesión. Queda pendiente tenerla accesible para la próxima.

## Qué quedó pendiente

- Arreglar los dos bloqueos críticos (conversión de unidades, período cerrado) — son los que bloquean la próxima promoción a producción.
- Cargar los meses de febrero a abril del caso de prueba, una vez resuelto el bloqueo de la conversión.
- Revisar en pantalla: el simulador de escenarios, el punto de equilibrio contra la capacidad instalada, el sidebar nuevo por procesos, y el panel de precios de CAPIA — no se llegó por tiempo esta sesión.
- Tener accesible el listado completo de las 35 reglas de negocio desde la terminal, para que la próxima auditoría no dependa de memoria repartida entre conversaciones.

## Cómo verificarlo

1. `git -C Costear.api log -1 auditoria/AUD-2026-09-14` → tiene que mostrar el commit `4f691e4`.
2. Los papeles completos, con cada número y cada prueba documentados paso a paso, están en `Costear.api/docs/auditorias/AUD-2026-09-14/` (7 archivos + carpeta de evidencia con los scripts que reproducen cada prueba).
3. El dictamen final, en un lenguaje más directo, está en `07-dictamen.md` de esa misma carpeta.

## Riesgos abiertos

- Mientras el bloqueo de la conversión de unidades no se arregle, **ninguna empresa avícola real puede cerrar un período de Costeo por Procesos con la conversión bien declarada.**
- El problema del período cerrado es silencioso: no hay ningún aviso en pantalla ni en el sistema de que un mes ya cerrado cambió sus números. Si esto ya pasó con datos reales del cliente piloto, los cierres de meses anteriores podrían no reflejar lo que se le mostró en su momento — vale la pena revisar si esto le tocó al cliente real antes de la fecha de esta auditoría.

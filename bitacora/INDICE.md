# Índice de la bitácora

Una fila por sesión de trabajo. **La más reciente arriba.** Lo mantiene `/costear-bitacora`
en el mismo commit que crea la entrada — no editar a mano salvo para corregir un link roto.

Cómo funciona todo esto: [`README.md`](./README.md).

| Fecha | Repo | Qué se hizo | PRs | ADRs |
| --- | --- | --- | --- | --- |
| 2026-08-22 | backend | [Dos cosas que el deploy hacía a mano](./sesiones/2026-08-22-backend-infra-automatizada.md) — las reglas de aislamiento entre empresas no se aplicaban solas en cada deploy, y el sistema no decía qué versión estaba corriendo. Las dos quedaron automatizadas | [#125](https://github.com/Coste-AR/CosteAR-backend/pull/125), [#126](https://github.com/Coste-AR/CosteAR-backend/pull/126) | — |
| 2026-08-21 | backend | [El deploy estaba bloqueado y nadie lo sabía](./sesiones/2026-08-21-backend-el-deploy-estaba-bloqueado.md) — una migración figuraba como fallida y frenaba cualquier cambio de estructura. Se armó el chequeo previo y se comprobó que producción está sana | [#121](https://github.com/Coste-AR/CosteAR-backend/pull/121), [#122](https://github.com/Coste-AR/CosteAR-backend/pull/122), [#123](https://github.com/Coste-AR/CosteAR-backend/pull/123) | — |
| 2026-08-21 | backend | [El estado de costos quedó completo](./sesiones/2026-08-21-backend-trabajos-de-terceros.md) — se agregó el último renglón que faltaba, los trabajos de terceros, y se verificó que el trabajo recuperado sí llegó esta vez | [#119](https://github.com/Coste-AR/CosteAR-backend/pull/119) | backend#0009 |
| 2026-08-21 | backend | [Tres arreglos figuraban como terminados y no habían llegado](./sesiones/2026-08-21-backend-tres-arreglos-que-no-llegaron-a-dev.md) — los PRs apilados se mergearon contra su rama de abajo en vez de contra `dev`. GitHub los mostraba en verde y el trabajo había quedado en ramas muertas | [#110](https://github.com/Coste-AR/CosteAR-backend/pull/110) | — |
| 2026-08-20/21 | backend | [Cinco defectos que hacían que el costo de un producto saliera mal](./sesiones/2026-08-20-backend-tres-defectos-del-motor-de-costeo.md) — un centro de servicio que desaparecía del cálculo, la producción sin terminar que no movía nada, el costo de lo vendido dividido por las producidas, el estado de costos que se quedaba en el costo normal y un módulo de desperdicio entero que nadie llamaba. Ninguno daba error: devolvían un número equivocado | [#103](https://github.com/Coste-AR/CosteAR-backend/pull/103), [#104](https://github.com/Coste-AR/CosteAR-backend/pull/104), [#105](https://github.com/Coste-AR/CosteAR-backend/pull/105), [#106](https://github.com/Coste-AR/CosteAR-backend/pull/106), [#107](https://github.com/Coste-AR/CosteAR-backend/pull/107) | backend#0005 a #0008 |
| 2026-08-18 | backend | [El motor ya sabe contar cajones de huevo (y dividía mal el costo unitario)](./sesiones/2026-08-18-santi-vertical-avicola-carril-backend.md) — vertical avícola: el costo unitario se dividía por las unidades vendidas, el plantel pasa a ser un activo amortizable y el desperdicio necesita naturaleza declarada | [#67](https://github.com/Coste-AR/CosteAR-backend/pull/67) · [#68](https://github.com/Coste-AR/CosteAR-backend/pull/68) · [#69](https://github.com/Coste-AR/CosteAR-backend/pull/69) · [#70](https://github.com/Coste-AR/CosteAR-backend/pull/70) · [#71](https://github.com/Coste-AR/CosteAR-backend/pull/71) | backend#0002 · backend#0003 |
| 2026-08-15 | los 3 | [Alan y Lauti ya pueden cargar el trabajo pendiente como issues](./sesiones/2026-08-15-todos-skill-para-cargar-issues.md) — herramienta `/costear-issue` y las etiquetas de tipo, prioridad y área que las plantillas nombraban pero no existían | — | — |
| 2026-08-15 | backend | [61 tests que no corrían en ningún lado](./sesiones/2026-08-15-backend-tests-que-no-corrian-en-ci.md) — entre ellos los 34 que verifican que una empresa no vea los datos de otra. El CI daba verde igual | [#58](https://github.com/Coste-AR/CosteAR-backend/pull/58) | backend#0001 |
| 2026-08-15 | los 3 | [Convenciones de equipo y sistema de trazabilidad](./sesiones/2026-08-15-todos-convenciones-y-trazabilidad.md) — reglas escritas, hooks, plantillas, protección de ramas y esta bitácora | — | — |

---

## Convenciones de esta tabla

- **Fecha:** la de la sesión, no la del commit.
- **Repo:** `backend` · `frontend` · `admin` · `knowledge-base` · `los 3` cuando cruza varios.
- **Qué se hizo:** una línea, en castellano y sin jerga. El link va al archivo de la sesión.
- **PRs:** `#N` con link. Si son varios, separados por coma.
- **ADRs:** número y repo, ej. `backend#0003`. `—` si no hubo.

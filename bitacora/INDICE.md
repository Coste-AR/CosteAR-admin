# Índice de la bitácora

Una fila por sesión de trabajo. **La más reciente arriba.** Lo mantiene `/costear-bitacora`
en el mismo commit que crea la entrada — no editar a mano salvo para corregir un link roto.

Cómo funciona todo esto: [`README.md`](./README.md).

| Fecha | Repo | Qué se hizo | PRs | ADRs |
| --- | --- | --- | --- | --- |
| 2026-08-15 | backend | [61 tests que no corrían en ningún lado](./sesiones/2026-08-15-backend-tests-que-no-corrian-en-ci.md) — entre ellos los 34 que verifican que una empresa no vea los datos de otra. El CI daba verde igual | [#58](https://github.com/Coste-AR/CosteAR-backend/pull/58) | backend#0001 |
| 2026-08-15 | los 3 | [Convenciones de equipo y sistema de trazabilidad](./sesiones/2026-08-15-todos-convenciones-y-trazabilidad.md) — reglas escritas, hooks, plantillas, protección de ramas y esta bitácora | — | — |

---

## Convenciones de esta tabla

- **Fecha:** la de la sesión, no la del commit.
- **Repo:** `backend` · `frontend` · `admin` · `knowledge-base` · `los 3` cuando cruza varios.
- **Qué se hizo:** una línea, en castellano y sin jerga. El link va al archivo de la sesión.
- **PRs:** `#N` con link. Si son varios, separados por coma.
- **ADRs:** número y repo, ej. `backend#0003`. `—` si no hubo.

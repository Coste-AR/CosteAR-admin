# Contrato de G7 para repositorios públicos

Este documento es el contrato que consumen `CosteAR-backend#348` y
`CosteAR-frontend#166`. La lista y la lógica de detección son privadas; los repositorios públicos
sólo conocen esta entrada y este resultado.

## Solicitud

El workflow público envía un `repository_dispatch` a `Coste-AR/CosteAR-admin`:

- `event_type`: `g7-revisar`.
- `client_payload.repo`: `Coste-AR/CosteAR-backend` o `Coste-AR/CosteAR-frontend`.
- `client_payload.pr`: número del PR.
- `client_payload.sha`: SHA completo (40 hexadecimales) del head que se quiere etiquetar.

G7 sólo acepta esos dos repositorios, PR numérico, base `dev` y coincidencia exacta entre el SHA
solicitado y el head actual. Así, un veredicto de una versión anterior no habilita una nueva.

## Respuesta

G7 escribe un commit status sobre `client_payload.sha` con el contexto exacto:

```text
G7/datos-de-cliente
```

| Estado | Significado | Qué hace el consumidor |
| --- | --- | --- |
| `pending` | La solicitud fue aceptada y G7 está midiendo. | Espera. |
| `success` | G7 leyó diff contra `dev`, título, cuerpo y commits; no halló coincidencias. | Puede continuar con G1–G6. |
| `failure` | Hubo una coincidencia o G7 no pudo medir de manera confiable. | No pone `auto-merge` y deja el PR para una persona. |
| Sin status | El dispatch no llegó o `CIRCUITO_PAT` no permitió leer/escribir. | Espera hasta cinco minutos y luego deja el PR para una persona. |

`success` es el único estado habilitante. El consumidor debe consultar el status del SHA exacto,
no el último status de la rama ni el de otro commit.

## Comentarios y confidencialidad

Cuando encuentra coincidencias, G7 comenta el archivo y línea, la línea del cuerpo, el título o el
commit abreviado. No publica el identificador, el texto inspeccionado, hashes ni fragmentos. Los
errores de configuración o lectura también se comentan sin material inspeccionado. Cada clase de
resultado se comenta una sola vez por SHA.

La lista ausente o vacía produce `failure`. Si el PAT falta o no puede publicar, el workflow queda
en rojo y el repositorio público conserva la puerta cerrada por ausencia de `success`.

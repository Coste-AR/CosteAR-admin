# 2026-09-04 — El guardián dejó de adivinar, y apareció que hace dos meses no entregamos

- **Repo(s):** frontend, backend, admin, os
- **Rama:** `ci/auto-etiquetar-medido` (os: `ci/auto-etiquetar`)
- **PRs:** [frontend #116](https://github.com/Coste-AR/CosteAR-frontend/pull/116) · [backend #240](https://github.com/Coste-AR/CosteAR-backend/pull/240) · [admin #77](https://github.com/Coste-AR/CosteAR-admin/pull/77) · [os #30](https://github.com/Coste-AR/CosteAR-os/pull/30) · [frontend #79](https://github.com/Coste-AR/CosteAR-frontend/pull/79)
- **Issues creados:** backend [#234](https://github.com/Coste-AR/CosteAR-backend/issues/234), [#235](https://github.com/Coste-AR/CosteAR-backend/issues/235), [#236](https://github.com/Coste-AR/CosteAR-backend/issues/236), [#237](https://github.com/Coste-AR/CosteAR-backend/issues/237), [#238](https://github.com/Coste-AR/CosteAR-backend/issues/238), [#239](https://github.com/Coste-AR/CosteAR-backend/issues/239) · frontend [#115](https://github.com/Coste-AR/CosteAR-frontend/issues/115)
- **Estado:** mergeado en los cuatro repos

## Qué se hizo

Empezó como "etiquetá esto a mano" y terminó en tres cosas distintas.

**Una.** Los reportes de los dos agentes estaban desactualizados: los dos describían PRs abiertos
que ya estaban mergeados. La cola no estaba trabada, estaba casi vacía. Lo que sí estaba mal eran
las etiquetas.

**Dos.** Las cuatro clases de PR que quedaban a mano pasaron a ser tres automatizadas y una que
no se toca. El cambio de fondo: **se dejó de adivinar y se empezó a medir.**

**Tres.** Auditando todo para el próximo plan apareció lo que importa de verdad, y no tiene que
ver con etiquetas. Está más abajo.

## El guardián adivinaba

Dos guardas del auto-etiquetado —"no borra archivos" y "cero líneas borradas bajo `tests/`"— eran
**proxies sintácticos** de lo único que importaba: que no bajara la verificación. Y como proxies
fallaban en las dos direcciones.

**De más**, rechazando trabajo legítimo: renombrar un test, partirlo en dos, borrar un fixture
muerto. Ya había pasado con backend #204, donde la guarda que existe para impedir que alguien
*recorte* un test bloqueó el arreglo que hacía que un test *corriera*.

**De menos**, y esto es lo grave: un test al que le comentan el cuerpo **borra pocas líneas o
ninguna**. La guarda lo dejaba pasar. Es literalmente uno de los tres incidentes que decía estar
previniendo.

Ahora se mide directo: se cuentan casos (`it(`, `test(`) y afirmaciones (`expect(`) en todo el
árbol de tests, base contra PR. Si baja cualquiera de los dos, lo mira una persona. Sobre `dev`
mide 156/381 en frontend, 1569/3580 en backend, 6/6 en admin, 0/0 en os.

Es mejor en las dos direcciones: deja pasar el trabajo legítimo y atrapa el test comentado.

## Tres cosas que encontró la verificación y no el diseño

> **Las tres se me habrían quedado como "arreglado" si no hubiera mirado el artefacto final.**
> Es la tercera vez que pasa lo mismo, y por eso `GR-09` existe.

**1. La medición contaba `// expect(` como una afirmación.** O sea que la primera versión de la
guarda nueva tenía exactamente el agujero que venía a tapar: comentar veinte afirmaciones dejaba
el balance intacto. Se descubrió sabotear un archivo de test real —comentar dos `expect(`— y ver
que el contador no se movía. Ahora se quitan comentarios (`//`, `/* */` en línea y en bloque, con
semántica de C) antes de contar: el mismo archivo pasa de 9 a 7.

**2. El guardián se caía sin decir por qué.** Dos runs reales seguidos con `exit code 1` y **cero
líneas de salida**. La causa estaba en un `printf` sin salto de línea: el `read` del otro lado
llega a EOF sin delimitador, devuelve 1, y con `set -e` el step muere antes del primer `echo`.

Se encontró corriendo el bloque `run:` extraído del YAML con `bash -x` contra el PR real. **Mis
dos intentos anteriores de razonarlo leyendo el archivo apuntaron al lugar equivocado** — el
primero al `git rev-parse` (que sí tenía un bug propio, pero no era ese), el segundo también.

De paso apareció un tercero: `git rev-parse` **sin `--verify`** no falla cuando no puede resolver
una ref — imprime el string tal cual. Con `|| true`, la variable quedaba con basura, el chequeo
de vacío pasaba de largo y se medía contra nada.

**3. El modo tanda dejaba pasar cambios a `.github/workflows/`** mientras el comentario del propio
workflow le decía al lector que no. El guardián podía aprobarse a sí mismo: si un PR aflojaba una
guarda, la versión que decidía si entraba era la vieja, y a partir del merge ya no quedaba nadie
controlando. Ahora no pasan nunca.

> **El principio que faltaba escrito, y quedó en el archivo:** *no poder medir nunca significa
> apto*. Un guardián que se cae tiene que dejar la puerta cerrada, no abierta.

## Lo que NO se automatizó, y por qué

**`main` sigue a mano.** No se agregó ninguna guarda que lo permita y no se va a agregar.

Es producción, hay un cliente real del otro lado, y es el único paso irreversible del circuito:
lo que entra a `dev` se revierte sin que nadie se entere, lo que entra a `main` ya lo vio alguien
que paga. Son treinta segundos por promoción y es el único lugar donde ese minuto compra algo.

`staging` sí entra sola, pero sólo si la promoción **no trae ni un commit que no esté ya en
`dev`**. Un arreglo hecho sobre la rama de promoción —que es justo donde nadie lo mira— la
devuelve a mano.

## Lo que apareció al auditar, y es lo más importante de la sesión

**El circuito produce a toda velocidad y no entrega.**

| Repo | `main` (lo publicado) | Commits que le faltan |
|---|---|---|
| `CosteAR-frontend` | **11-07-2026** | **230** |
| `CosteAR-admin` | 28-07-2026 | 124 |
| `CosteAR-backend` | 22-08-2026 | 64 |

`staging` en los tres está al 03-09. Hay dos meses de trabajo probado, verde y detenido a un
merge de distancia. El 22-08 se decidió que `staging` prueba y **`main` publica**; con ese mapa,
lo que el cliente tiene delante es de julio.

> **Falta verificar a qué rama apunta hoy Vercel en el frontend.** No se ve desde el repo. Si
> estuviera sirviendo `staging`, el cliente estaría al día y el problema sería otro —que `main`
> no significa nada y hay que decirlo—. **Es lo primero a confirmar y cambia el plan entero.**

La causa es incómoda: `main` es el único paso manual que queda. Un paso manual dentro de un
circuito automático no se vuelve más cuidadoso, **se vuelve el paso que nadie hace**. No es falta
de disciplina: es que todo lo demás dejó de necesitar una persona, y lo que sigue necesitándola
pierde contra lo que no.

## Las etiquetas mentían

De los 7 issues de frontend de la tanda B1, **6 estaban bloqueados** por contratos que el backend
no expone. Lauti hizo lo correcto: se frenó, comentó en cada uno el contrato exacto que falta y no
tocó etiquetas. Pero los seis seguían marcados `listo`, así que la cola decía que había trabajo y
no lo había.

Los contratos que faltaban se convirtieron en issues: #235 (qué parámetros sin confirmar, no sólo
que los hay), #236 (los pendientes de cierre como datos y no como frases), #237 (el simulador
quedó atrás de la corrida) y #238 (no hay forma de saber cuál es el lote activo). Y **#239**, que
no es para un agente: alimento, peso y la fórmula habitual no tienen modelo de dominio, y eso
define cómo entra el consumo al costo.

También: #162 y #170 llevaban días sin tomarse porque les faltaba la etiqueta `listo` — y no
tenían ninguna dependencia abierta.

> **La lección:** un agente que se frena y explica por qué está trabajando bien. Lo que falló es
> que su diagnóstico **no movía ninguna etiqueta**, así que el siguiente que miraba la cola veía
> un estado falso. El reporte del agente y el estado del sistema tienen que ser lo mismo.

## Y doce issues que están fuera del circuito

backend #73, #74, #75, #95, #96, #97, #98, #154 · frontend #47, #57, #58, #59 · admin #18, #19, #39.

Ninguno tiene la etiqueta `codex`. La cola se arma con `--label listo`, así que **ningún agente
los puede tomar nunca**. No están priorizados abajo: están afuera de la lista. Entre ellos,
**admin #18 (`priority:alta`, abierto desde el 18-08): datos comerciales de un cliente en los
repos públicos.**

Un issue que ningún agente puede tomar y que ninguna persona va a mirar no es un pendiente: es
ruido que hace que el inventario mienta.

## Qué sigue

1. **Confirmar a qué rama apunta Vercel.** Todo lo demás depende de eso.
2. **Cerrar admin #18.**
3. **Promover.** De a un repo, empezando por backend (64 commits, el más chico).
4. **Un aviso semanal de cuántos commits le faltan a `main`.** `main` sigue a mano, pero no puede
   seguir dependiendo de que alguien se acuerde.
5. **Decidir los doce de agosto:** entran con `codex` o se cierran.

El detalle completo, con los comandos para volver a medir cada número, está en la nota de
auditoría del Second Brain (`001.5 - Notas`).

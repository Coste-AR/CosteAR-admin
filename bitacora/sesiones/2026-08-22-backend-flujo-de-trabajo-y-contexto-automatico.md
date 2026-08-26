# 2026-08-22 — El equipo dejó de depender de acordarse

> Continúa [dos cosas que el deploy hacía a mano](./2026-08-22-backend-infra-automatizada.md).

- **Repo(s):** backend, frontend, admin
- **PRs:** backend [#128](https://github.com/Coste-AR/CosteAR-backend/pull/128) · [#129](https://github.com/Coste-AR/CosteAR-backend/pull/129) · [#130](https://github.com/Coste-AR/CosteAR-backend/pull/130) · [#136](https://github.com/Coste-AR/CosteAR-backend/pull/136) · [#137](https://github.com/Coste-AR/CosteAR-backend/pull/137) · [#138](https://github.com/Coste-AR/CosteAR-backend/pull/138) · [#139](https://github.com/Coste-AR/CosteAR-backend/pull/139) · [#142](https://github.com/Coste-AR/CosteAR-backend/pull/142) · [#143](https://github.com/Coste-AR/CosteAR-backend/pull/143) — frontend [#61](https://github.com/Coste-AR/CosteAR-frontend/pull/61) · [#62](https://github.com/Coste-AR/CosteAR-frontend/pull/62) · [#63](https://github.com/Coste-AR/CosteAR-frontend/pull/63) — admin [#35](https://github.com/Coste-AR/CosteAR-admin/pull/35) · [#36](https://github.com/Coste-AR/CosteAR-admin/pull/36) · [#37](https://github.com/Coste-AR/CosteAR-admin/pull/37)
- **ADRs:** —
- **Estado:** todo mergeado a `dev` en los tres repos, cero PRs abiertos

## Qué se hizo

- El **PR ahora nace en borrador** en los tres repos. GitHub no deja mergear un borrador: mientras
  el trabajo todavía está creciendo, nadie lo puede mergear por error.
- **El deploy se verifica solo.** Después de mergear a `staging` o `main`, un chequeo automático
  confirma que el ambiente esté sirviendo el código correcto — y avisa si no.
- Al abrir una sesión de Claude en cualquiera de los tres repos, **aparece solo un resumen de qué
  está pasando**: en qué rama está, qué PRs hay abiertos, qué issues tiene asignados y qué no hay
  que tocar esa semana. Nadie tiene que explicarle nada a mano.
- Se reordenaron los ambientes de Railway: **`staging` pasa a ser donde se prueba y `main` donde se
  publica**. Antes los dos servían el mismo código y el otro no se usaba para nada.
- Se sacaron **137 ramas** que ya estaban mergeadas y seguían dando vueltas.

## Por qué: el número que lo explica todo

En tres días se abrieron **24 PRs** en el backend. **4 no agregaron nada**: existieron solo para
recuperar trabajo que ya estaba hecho y se había quedado afuera. El motivo, siempre el mismo: se
seguía pusheando después de abrir el PR, y quien mergeaba veía "abierto y en verde" sin poder
distinguir si el trabajo ya había terminado.

Ya existía una regla escrita pidiendo evitar justo esto. **Volvió a pasar tres veces** después de
escribirla.

> Todo lo que dependía de que alguien se acordara, falló. Todo lo que quedó automatizado,
> funcionó.

Por eso ninguno de los cambios de hoy es "una regla más para acordarse": todos son mecanismos que
funcionan solos.

## Un hallazgo en el medio: los dos ambientes no eran lo que decía el manual

Al cargar las URLs para el chequeo automático, se descubrió que **los dos ambientes de producción
servían el mismo código** — el de la rama que se pensaba que era solo para pruebas. El otro
ambiente, el que se creía "de referencia", **no recibía deploys hacía 39 días porque nadie lo
usaba**. No era abandono: era que apuntaba a la rama equivocada.

Se corrigió con cuidado en el orden correcto: primero se llevó todo el código al día en las dos
ramas, y **recién después** se cambió a qué ambiente apunta cada una. Al revés, se habría publicado
código de 39 días atrás encima de una base de datos ya actualizada.

## Un bug que apareció mirando el propio chequeo funcionar

Mientras se probaba el verificador automático de deploys, el ambiente respondió con un mensaje que
no era el esperado durante los segundos en que todavía estaba arrancando. El chequeo lo interpretó
como una falla y hubiera marcado rojo un deploy que en realidad estaba bien, solo que tardaba.
Se corrigió para que distinga "todavía está arrancando" de "esto está roto de verdad".

## Una decisión que se tomó y se dio vuelta en el momento

Se había armado un plan para mover un documento (la forma de trabajar del equipo) a la bóveda de
conocimiento que usa el motor de costeo. Antes de escribir nada se revisó cómo funciona esa bóveda,
y se encontró que **indexa cualquier archivo que encuentre** para que la IA lo use al clasificar
comprobantes. Guardar ahí un documento sobre cómo programa el equipo se habría mezclado con la
doctrina de costeo real en las búsquedas del clasificador. Se cambió de lugar a tiempo: terminó en
el archivo personal de notas de Santiago, con una copia en este mismo repo para que cualquiera del
equipo la pueda abrir.

## Lo que se evaluó y no se hizo, a propósito

- **Exigir aprobación de review antes de mergear.** Se probó en agosto y con 4 personas trababa el
  trabajo. El borrador automático ataca la misma causa sin poner a nadie a esperar a otro.
- **Una migración de limpieza en la base de datos** (issue #72): se armó el diagnóstico completo,
  se confirmó que es segura, y se decidió **no aplicarla ahora** porque no arregla nada que hoy
  esté roto — es prolijidad, no necesidad. Ya hay un filtro automático que evita el riesgo real
  desde el 21-08. Queda documentado para más adelante.

## Pendiente

- El servicio de producción se conecta a su base de datos por una dirección pública en vez de la
  interna. Funciona, pero conviene corregirlo — tiene paso a paso escrito, falta el momento.
- Rotar dos credenciales que se compartieron por error durante el trabajo de hoy.

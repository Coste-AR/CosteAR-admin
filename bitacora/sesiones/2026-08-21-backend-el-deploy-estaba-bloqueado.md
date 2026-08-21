# 2026-08-21 (noche) — El deploy estaba bloqueado y nadie lo sabía

> Cuarta entrada del día. Las anteriores:
> [los cinco defectos](./2026-08-20-backend-tres-defectos-del-motor-de-costeo.md),
> [los tres arreglos que no llegaron](./2026-08-21-backend-tres-arreglos-que-no-llegaron-a-dev.md)
> y [el estado de costos completo](./2026-08-21-backend-trabajos-de-terceros.md).

- **Repo(s):** backend
- **PRs:** [#121](https://github.com/Coste-AR/CosteAR-backend/pull/121) · [#122](https://github.com/Coste-AR/CosteAR-backend/pull/122) · [#123](https://github.com/Coste-AR/CosteAR-backend/pull/123)
- **ADRs:** backend#0009 (actualizado)
- **Estado:** #121 y #122 en `dev`; #123 esperando merge

## Qué se hizo

- Se descubrió que **la base de datos tenía anotada una migración como fallida**, y que eso
  **bloquea cualquier cambio de estructura futuro**. Se armó una herramienta para detectarlo
  antes de un deploy, y se comprobó que **producción está sana**.
- Los trabajos de terceros se rehicieron con un campo propio en la base, en vez de guardarlos
  dentro de la configuración de costos indirectos.
- Se dejó escrito, paso a paso, **cómo correr ese chequeo**: en qué máquina, de dónde sacar la
  dirección de la base y con qué terminal.

## Por qué

El sistema anota cada cambio de estructura que aplica. Si uno queda anotado como fallido, **se
niega a aplicar cualquier otro** hasta que alguien lo resuelva. Es una protección razonable.

El problema apareció al querer agregar el campo de trabajos de terceros: había una anotación de
fallo del 19-08 —la del módulo de desperdicio— y sin embargo **todo lo que esa migración tenía que
crear estaba creado y funcionando**. Se había aplicado y quedó mal anotada.

Eso importaba porque el equipo estaba por promover a producción con un cambio de estructura nuevo.
**Si producción tenía la misma anotación, el deploy se habría cortado a la mitad**, con un cliente
real usando el sistema.

## La parte que no era obvia

Ya existía una herramienta que "arregla" migraciones fallidas: las marca para que se vuelvan a
aplicar. Sirve cuando la migración no alcanzó a hacer nada.

**En este caso habría empeorado las cosas.** Como la migración sí se había aplicado, volver a
intentarlo falla con "esto ya existe" y el deploy queda a medias. El límite estaba escrito en la
propia herramienta como advertencia; lo que cambió es que dejó de ser teórico.

Por eso la herramienta nueva **no arregla nada**: mira y avisa. Contesta la única pregunta que
decide qué hacer —*la migración fallida, ¿dejó algo hecho o no dejó nada?*— porque según la
respuesta **lo correcto es exactamente lo opuesto** en cada caso. Y si quedó a medias, dice que no
se automatice: eso lo tiene que mirar una persona.

**Resultado sobre producción: está sana.** Se verificó en vivo y no hay ninguna migración
bloqueando. El camino para promover quedó despejado.

## Decisiones que se tomaron sobre la marcha

- **Los trabajos de terceros se rehicieron con campo propio.** Estaban guardados dentro de la
  configuración de costos indirectos, que era más rápido pero los dejaba a un renglón de los
  conceptos que **sí** se reparten entre sectores. La ubicación invitaba al error que queríamos
  evitar. Se cambió a un campo propio, con su cambio de estructura correspondiente.
- **La herramienta nueva solo lee.** Tocar el registro de migraciones de una base con datos reales
  es una decisión de una persona, no algo que deba hacer un script solo.
- **El instructivo se escribió para quien no lo escribió.** La primera versión decía qué comando
  correr, pero no en qué máquina, ni de dónde sacar la dirección de la base, ni que la terminal de
  Windows usa una sintaxis distinta. Era inservible. Ahora está completo.

## Lo que hay que corregir del método

**Cuatro veces en dos días quedó trabajo afuera de `dev`.** Las tres primeras se atribuyeron a los
PRs apilados. La cuarta fue un PR simple, así que la explicación era otra: **se estaba mergeando
mientras la rama todavía recibía cambios.**

No es un problema técnico, es de coordinación: quien implementa avisa cuando terminó, y recién ahí
se mergea. Se acordó así.

## Qué quedó pendiente

- Mergear el #123 y **promover a producción**, que es lo que destraba todo esto: los cinco
  arreglos del costo siguen sin llegarle al cliente.
- Anotar qué versión quedó corriendo en cada ambiente después del deploy.
- Las tres pantallas del frontend, ya cargadas como issues.

## Cómo verificarlo

Contra el ambiente que sea, desde la carpeta del backend:

```powershell
$env:DATABASE_URL = "<dirección pública de la base>"
node scripts/check-migrations.mjs
Remove-Item Env:\DATABASE_URL
```

Lo primero que imprime es contra qué base miró, para no confundir un ambiente con otro.

## Riesgos abiertos

- **El cliente sigue sin los cinco arreglos del costo.** Están terminados y probados, pero en el
  ambiente de desarrollo. Hasta que se promueva, el costo que ve el cliente sigue teniendo los
  errores de cálculo que encontramos el 20-08. **Es el riesgo más caro que hay abierto.**
- La misma anotación de migración fallida podría aparecer en el ambiente de referencia (`main`),
  que lleva 39 días sin recibir nada. Conviene correrle el chequeo antes de tocarlo.

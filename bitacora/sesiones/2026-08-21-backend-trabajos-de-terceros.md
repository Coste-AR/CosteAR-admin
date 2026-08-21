# 2026-08-21 (cierre) — El estado de costos quedó completo

> Tercera y última entrada del día. Las anteriores:
> [los cinco defectos](./2026-08-20-backend-tres-defectos-del-motor-de-costeo.md) y
> [los tres arreglos que no habían llegado](./2026-08-21-backend-tres-arreglos-que-no-llegaron-a-dev.md).

- **Repo(s):** backend
- **Rama:** `feat/trabajos-de-terceros`
- **PRs:** [#119](https://github.com/Coste-AR/CosteAR-backend/pull/119)
- **ADRs:** backend#0009
- **Estado:** en review
- **Issues:** cierra [#90](https://github.com/Coste-AR/CosteAR-backend/issues/90) entero

## Qué se hizo

- **Se confirmó que el trabajo recuperado sí llegó esta vez.** Los PRs #110 y #113 se mergearon y
  se verificó mirando el contenido de `dev`, no el cartelito del PR: las decisiones escritas y el
  código del desperdicio están donde tienen que estar.
- **Se agregó el último renglón que le faltaba al estado de costos: los trabajos de terceros.** Con
  eso el estado de costos tiene ya todos los renglones de la estructura que enseña la cátedra.

## Por qué

Los trabajos de terceros son procesos que la empresa manda a hacer afuera —un tratamiento
térmico, un bordado, un flete— y que son parte de lo que costó producir. **El sistema no los
contemplaba en absoluto**: no había dónde cargarlos.

Era el último pendiente del bloque de arreglos del motor de costeo que se abrió con la auditoría
del 20-08.

## La decisión que se tomó, y por qué no es obvia

Que estos trabajos suman al costo no lo discute nadie. Lo que había que resolver es **dónde
guardar el dato para que el sistema no los confunda con carga fabril**.

La cátedra es tajante: *"los trabajos de terceros se registran por separado de los costos
indirectos"*. Y hay una razón concreta: los costos indirectos **se reparten entre los sectores de
la fábrica** y después se diluyen en una cuota por hora. Si los trabajos de terceros entraran por
ahí, el costo total del mes daría parecido, pero **el costo de cada sector quedaría mal** — y ese
error se arrastra a todo lo que se costee después. Es el tipo de error que no se ve mirando el
número grande.

Así que van como renglón aparte, sin pasar por ese reparto. Hay una prueba automática que lo fija:
si alguien alguna vez los mete en el reparto, el test se pone en rojo.

**Lo que aceptamos pagar, y está escrito:** el campo quedó guardado dentro de la sección de Costos
Indirectos, que es donde el costista los va a cargar, aunque no sean un costo indirecto. Se eligió
así para no tener que tocar la estructura de la base de datos. La contra es que alguien que lea el
código puede suponer que se reparten. Si más adelante molesta, se mueve a un campo propio.

## Qué quedó pendiente

- **Las tres pantallas.** El servidor ya sabe hacer todo esto; falta que el navegador lo muestre y
  lo pida: el costo unitario de lo terminado, la carga de desperdicio y el campo de trabajos de
  terceros. Es otro repositorio.
- Mergear el PR #119.
- Decidir si el test que falla por lentitud de la máquina se arregla o se le sube el límite.

## Cómo verificarlo

```bash
npx vitest run tests/application/trabajos-de-terceros.test.ts
```

Suite completa: **1.384 pruebas, ninguna fallando**, con verificación de tipos y estilo limpias.

Que el trabajo de los PRs anteriores llegó de verdad:

```bash
git checkout dev && git pull
ls docs/adr/                                   # 0007, 0008 y 0009 presentes
```

## Riesgos abiertos

- **El estado de costos está completo en el servidor y no se ve completo en pantalla.** Mientras
  eso siga así, el costista no tiene forma de cargar ni de mirar tres cosas que el sistema ya
  calcula. Es la brecha que queda abierta al cerrar este bloque de trabajo.

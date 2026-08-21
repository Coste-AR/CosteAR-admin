# 2026-08-21 — Tres arreglos figuraban como terminados y no habían llegado

> Continuación de [2026-08-20/21 — Cinco defectos que hacían que el costo de un producto saliera
> mal](./2026-08-20-backend-tres-defectos-del-motor-de-costeo.md). Esa entrada quedó cerrada con
> los cinco PRs en review; ésta cuenta qué pasó cuando se mergearon.

- **Repo(s):** backend
- **Rama:** `feat/desperdicio-en-el-motor`
- **PRs:** [#110](https://github.com/Coste-AR/CosteAR-backend/pull/110) — recupera [#105](https://github.com/Coste-AR/CosteAR-backend/pull/105), [#106](https://github.com/Coste-AR/CosteAR-backend/pull/106) y [#107](https://github.com/Coste-AR/CosteAR-backend/pull/107)
- **ADRs:** —
- **Estado:** en review

## Qué se hizo

- Se detectó que **tres de los cinco arreglos del motor de costeo nunca llegaron a `dev`**, aunque
  GitHub los mostraba como terminados y en verde.
- Se recuperaron los tres en un PR nuevo, sin tocar una sola línea del código original.
- Se verificó, esta vez mirando el contenido real de `dev` y no el estado del PR.

## Por qué

Los cinco arreglos se habían abierto **apilados**: cada uno construido sobre el anterior, porque
todos tocaban las mismas líneas del mismo archivo y hacerlos por separado garantizaba conflictos.

Un PR apilado apunta a la rama de abajo, no a `dev`. Eso está bien mientras se mergeen **en orden
y de abajo hacia arriba**: cada vez que uno entra, GitHub reapunta solo el siguiente. Si se
mergean todos juntos, cada uno entra en la rama de abajo —que ya nadie va a mirar— y el trabajo
queda ahí.

Es lo que pasó:

| PR | Arreglo | Entró en | ¿Llegó a `dev`? |
|---|---|---|---|
| #103 | El centro de servicio que desaparecía | `dev` | ✅ |
| #104 | La producción sin terminar | `dev` | ✅ |
| #105 | El costo de lo vendido | la rama del #104 | ❌ |
| #106 | La variación presupuesto | la rama del #105 | ❌ |
| #107 | El desperdicio | la rama del #106 | ❌ |

**Lo importante no es el error: es que era invisible.** Los cinco PRs figuraban como *merged*, con
su tilde verde. Nada avisaba que tres de ellos habían entrado en una rama muerta.

## Decisiones que se tomaron sobre la marcha

- **Se recuperó con un PR nuevo, no reescribiendo la historia.** Los tres commits van tal cual
  estaban. Un `cherry-pick` o un `rebase` habrían dejado los mismos cambios con identidad distinta,
  y después nadie entiende por qué el mismo arreglo figura dos veces.
- **El PR nuevo no repite la discusión técnica.** Cada arreglo ya tiene su PR original y su ADR
  con las alternativas descartadas; duplicar eso hace que después haya dos versiones de la misma
  decisión y no se sepa cuál manda.
- **Los issues #90 y #92 se cierran en este PR, y queda dicho por qué.** Sus PRs originales decían
  *"part of"* porque quedaban partes sin hacer, pero esas partes son **funcionalidad nueva** —los
  trabajos de terceros y la pantalla para cargar desperdicio—, no arreglos a medias. Queda anotado
  en el PR que si se prefiere dejarlos abiertos como recordatorio, se sacan esas dos líneas antes
  de mergear.

## Lo que apareció sin estar previsto

- **Hay un test que falla por lentitud de la máquina, no por el código.** En una corrida completa
  que tardó el doble de lo normal, dos pruebas de la conexión de WhatsApp se cortaron por tiempo
  agotado a los 5 segundos. Corridas solas pasan en menos de un segundo. **No es un error nuevo ni
  tiene relación con estos cambios**, pero un test que falla según cuán ocupada esté la máquina va
  a pintar el semáforo en rojo tarde o temprano, y cuando eso pasa se empieza a desconfiar del
  semáforo entero.

## Qué quedó pendiente

- **Mergear el PR #110** y después verificar que llegó, no que figura como mergeado.
- Los dos gaps de funcionalidad nueva ya conocidos: los trabajos de terceros del estado de costos
  y la pantalla para cargar desperdicio.
- Decidir si el test lento se arregla o se le sube el tiempo límite.

## Cómo verificarlo

Antes de mergear, `dev` **no** tiene el trabajo:

```bash
git fetch origin
git ls-tree -r --name-only origin/dev docs/adr/   # no aparecen 0007 ni 0008
```

Después de mergear, tiene que aparecer todo:

```bash
git checkout dev && git pull
ls docs/adr/                                       # 0007 y 0008 presentes
npx vitest run tests/application/desperdicio-en-el-motor.test.ts \
               tests/application/estado-de-costos-variacion-presupuesto.test.ts \
               tests/application/cpv-unitario-por-vendidas.test.ts
```

En esta sesión se corrieron las dos suites del motor: **897 pruebas, ninguna fallando**, con
verificación de tipos y de estilo limpias.

## Riesgos abiertos

- **Esto ya había pasado el 18-08**, y de ahí salió la regla REV-08 del protocolo de revisión:
  *"los PRs apilados se mergean de abajo hacia arriba, y después se verifica que el trabajo llegó a
  `dev`"*. La regla estaba escrita y aun así volvió a pasar. **Una regla que hay que recordar en el
  momento exacto no alcanza**: mientras el aviso dependa de que alguien se acuerde, va a repetirse.
  Vale pensar si conviene evitar los PRs apilados salvo que no haya alternativa, o tener un chequeo
  que avise cuando un PR apunta a algo que no es `dev`.
- Mientras el #110 no se mergee, **`dev` tiene tres de los cinco arreglos**. Un período calculado
  contra `dev` hoy sigue teniendo el costo de lo vendido mal dividido.

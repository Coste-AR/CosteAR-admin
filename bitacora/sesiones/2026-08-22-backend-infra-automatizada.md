# 2026-08-22 — Dos cosas que el deploy hacía a mano, y por eso no se hacían

> Continúa [el deploy estaba bloqueado](./2026-08-21-backend-el-deploy-estaba-bloqueado.md).

- **Repo(s):** backend
- **PRs:** [#125](https://github.com/Coste-AR/CosteAR-backend/pull/125) · [#126](https://github.com/Coste-AR/CosteAR-backend/pull/126) · [#124](https://github.com/Coste-AR/CosteAR-backend/pull/124) (promoción)
- **ADRs:** —
- **Estado:** #125 en `dev`; #126 y la promoción, en review

## Qué se hizo

- Se automatizó que **cada deploy aplique las reglas de aislamiento entre empresas**. Antes solo
  aplicaba los cambios de estructura, y las reglas se cargaban a mano.
- El sistema ahora **dice qué versión está corriendo** cuando se le pregunta. Antes había que
  anotarlo a mano después de cada deploy.
- Se destrabó la promoción a producción, que estaba frenada por un conflicto.

## Lo más importante: había un agujero de aislamiento

Cada empresa solo puede ver sus propios datos. Eso **no lo garantiza el programa: lo garantiza la
base de datos**, con reglas que se cargan aparte.

El deploy aplicaba los cambios de estructura automáticamente, pero **esas reglas no**: había que
acordarse de cargarlas a mano. O sea que **una tabla nueva podía quedar en producción sin
protección**, y eso no falla ni avisa: simplemente devuelve los datos de todas las empresas.

No era hipotético. La promoción que estaba por salir **crea una tabla nueva** —la de desperdicio—
que guarda información por empresa.

Ahora el deploy hace las dos cosas, en orden, **antes de que la versión nueva salga viva**. Si algo
falla, se queda la versión anterior: es preferible no actualizar a actualizar sin protección.

## Lo segundo: saber qué versión está corriendo

En la auditoría del 20-08 la pregunta *"¿este error está afectando al cliente?"* quedó sin
respuesta **tres veces**, siempre por lo mismo: nadie sabía qué versión estaba corriendo en cada
lado.

El instructivo pedía anotarlo a mano después de cada deploy. **Anotar a mano algo que el sistema ya
sabe es una promesa que se incumple sola** — y se incumplió: hoy seguía sin saberse.

Ahora se le pregunta al ambiente y contesta él. Y si no lo sabe, **dice que no lo sabe** en vez de
inventar un número: un dato falso pero creíble es peor que ninguno, porque alguien lo va a usar
para decidir.

## Decisiones que se tomaron sobre la marcha

- **No se tocó la verificación que ya existía.** Hay un control automático que revisa que toda tabla
  nueva tenga sus reglas de aislamiento escritas, y está bien hecho. **El problema nunca fue que
  faltara escribirlas, sino que no se ejecutaban.** Cambiar lo que ya funcionaba habría sido
  arreglar el lugar equivocado.
- **El conflicto de la promoción se resolvió a favor de lo más nuevo.** El ambiente de producción no
  tenía trabajo propio: tenía el mismo trabajo por otro camino, y en una versión anterior.

## Dos errores propios que conviene registrar

- **Un cambio se coló de nuevo sin que nadie lo aprobara.** Al resolver el conflicto, el sistema
  combinó solo un archivo y **revirtió una decisión de diseño que se había tomado a propósito**. No
  pidió intervención: lo hizo en silencio. Lo detectó una prueba automática escrita justamente para
  eso. Es el mejor argumento a favor de escribir esas pruebas.
- **Una prueba nueva no servía para nada.** La escribí de una forma que solo funciona en una
  computadora con base de datos, y el control automático del equipo **no levanta base a propósito**.
  Resultado: la prueba no corría donde tenía que correr. Se reescribió. Una prueba que solo corre
  donde hay base no protege nada.

## Qué quedó pendiente

- Mergear la automatización y **hacer la promoción a producción**: los cinco arreglos del costo
  siguen sin llegarle al cliente.
- Después del deploy, preguntarle al ambiente qué versión quedó — ahora se puede.
- El ambiente de referencia sigue 39 días atrás.

## Cómo verificarlo

Después del deploy:

```bash
curl https://<direccion-del-ambiente>/health
```

Tiene que devolver la versión que se acaba de deployar. **Ese es el chequeo de que la
automatización funcionó.**

## Riesgos abiertos

- **El cliente sigue sin los cinco arreglos del costo.** Es el riesgo más caro que hay abierto, y
  ya lleva dos días.
- Una prueba del sistema **falla cuando la computadora está cargada** (se corta por tiempo). No es
  un error real, pero enseña a desconfiar del semáforo, que es peor.

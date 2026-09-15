# 2026-09-15 — Auditoría AUD-2026-09-16: conjuntos por tamaño, corrimiento de mix, punto de equilibrio y un hallazgo nuevo grave sobre el tablero del dueño

- **Repo(s):** backend (CosteAR-backend), con verificación en pantalla contra frontend (CosteAR-frontend)
- **Rama:** `auditoria/AUD-2026-09-14` (backend, local, sin push a `dev`/`staging` todavía en esta sesión)
- **PRs:** — (esta sesión no genera código, solo auditoría)
- **ADRs:** —
- **Estado:** dos commits locales (`5e2341e`, `d714f7f`), sin push al abrir esta sesión

## Qué se hizo

- Se retomó la auditoría de costos (después de la del 14-09 y la del 15-09) con cinco preguntas puntuales que habían quedado sin responder: si el reparto de costos conjuntos por tamaño funciona, si el sistema se entera cuando cambia la mezcla de tamaños vendidos, si el punto de equilibrio avisa cuando queda fuera de lo que la planta puede producir, cuánto pesa en pesos el problema del "período cerrado que cambia solo" ya conocido, y cuatro datos técnicos exactos para poder escribir los reclamos (issues) sin ambigüedad.
- Se cargaron los cuatro métodos de reparto de costos conjuntos contra el servidor real por primera vez en toda la serie de auditorías — nunca se habían probado, ni una vez, en ningún test del proyecto ni en ninguna auditoría anterior.
- Se armó un escenario real, con la app en el navegador, del caso "el mes rompe todo" del fixture de prueba (entra un lote nuevo, cambia el tamaño de huevo, el punto de equilibrio pide más cajones de los que la planta puede hacer), y se sacaron capturas de pantalla del tablero del dueño en ese estado.
- Se armó un escenario controlado para medir en pesos qué tan grave es que un período ya cerrado cambie sus números si alguien reclasifica un costo después — el hallazgo de la auditoría del 14-09.
- En una segunda vuelta, se cerraron dos preguntas que habían quedado abiertas: si la pantalla donde se clasifica un costo como fijo/variable puede mostrarle a alguien el número equivocado de un mes ya cerrado, y si el mismo problema le pasa al costeo por procesos (el que usa el cliente avícola).

## Por qué

Continuación de la auditoría de costos que se viene haciendo desde el 14-09, antes de decidir si se promueve la tanda actual. El pedido de esta vuelta vino con cinco preguntas puntuales del socio, más la instrucción de dejar los datos técnicos exactos y listos para poder escribir los reclamos al equipo de desarrollo.

## Lo que se encontró

1. **El reparto de costos conjuntos por tamaño funciona bien matemáticamente** — los cuatro métodos que existen dan números distintos y consistentes, probados por primera vez contra el servidor real. Pero se encontraron dos problemas nuevos: la pantalla marca como "en pérdida" a productos que en realidad no tienen ningún dato de precio cargado (falsa alarma, en dos de los cuatro métodos, siempre), y no hay forma de cargar un descarte (los huevos más chicos o más grandes, sin valor de reventa) con el costo que sale eliminarlo — el sistema no lo permite.

2. **El sistema no tiene ninguna forma de enterarse de que cambió la mezcla de tamaños vendidos.** No es que la pantalla no lo muestre bien: directamente no existe ningún lugar del sistema donde esa información entre. Un costista podría estar vendiendo cada vez más huevo chico (que vale menos) sin que nada se lo avise.

3. **El punto de equilibrio nunca avisa cuando queda fuera de lo que la planta puede producir.** Se armó el caso real (entra un lote nuevo, cambia el tamaño de huevo) y se vio en pantalla: el sistema pide 1.107 cajones para no perder plata, pero la planta solo puede hacer 972 — y la pantalla no dice nada de eso, muestra el número solo. Además se confirmó en vivo, con captura, que el "conversor de pesos a cajones" sigue con el error ya conocido: divide por el precio de venta en vez de por lo que realmente queda de ganancia.

4. **Se pudo medir el mecanismo del "período cerrado que cambia solo"** y se confirmó algo importante: el número que el cliente ve como "resultado del período" no se mueve (eso está bien, es matemáticamente correcto). El problema está un nivel más abajo, en los números de gestión (margen, punto de equilibrio), que sí cambian sin aviso.

5. **El hallazgo más grave de esta vuelta, encontrado casi de casualidad al cerrar las preguntas pendientes:** el tablero del dueño — la pantalla principal, los "seis números" — **nunca funciona para las empresas que usan Costeo por Procesos**, que es el único sistema que usa el rubro avícola, el foco exclusivo del producto y el del cliente piloto. No es que falte configurar algo: se probó con todo cargado (unidad de medida, ventas, un cálculo hecho de nuevo después de cargar todo) y el tablero sigue sin poder calcular el margen ni el punto de equilibrio. Esto explica, con la causa técnica identificada, por qué ninguna de las tres auditorías de esta serie pudo nunca ver un tablero del dueño completo y funcionando para una empresa avícola real.

## Decisiones que se tomaron sobre la marcha

- No existe, en todo el sistema, ninguna forma de que una empresa declare su "unidad de gestión" (por ejemplo, que trabaja en cajones) — es un dato que hoy solo se puede cargar directo en la base de datos, no desde la aplicación. Se usó ese método (declarado, no oculto) solo para poder ver las pantallas de esta auditoría; ningún cliente real puede hacerlo hoy.
- No se abrió ningún issue (reclamo) todavía — el pedido explícito de esta sesión fue dejar los papeles listos, no reclamar todavía.

## Qué quedó pendiente

- Escribir los issues con `/costear-issue` a partir de los papeles de esta sesión — quedaron los datos técnicos exactos (archivo y línea de cada problema) para que salga sin ida y vuelta.
- Arreglar los dos bloqueos críticos de la auditoría del 14-09 (conversión huevo/cajón, período cerrado) sigue siendo lo que frena la promoción — nada de esta vuelta lo destraba.
- Revisar si el arreglo del "conversor de pesos a cajones" (un cambio chico, solo de pantalla) se puede adelantar y salir antes que el resto — se dejó confirmado que no toca la base de datos ni el servidor, aunque solo sirve para el tipo de costeo que no es el del cliente avícola.

## Cómo verificarlo

1. `git -C Costear.api log -3 auditoria/AUD-2026-09-14` → tiene que mostrar los commits `d714f7f` y `5e2341e`.
2. Los papeles completos están en `Costear.api/docs/auditorias/AUD-2026-09-16/` (reconocimiento, dictamen, y una segunda parte con las preguntas cerradas), con las capturas de pantalla en la carpeta `capturas/` y los scripts que reproducen cada prueba en `evidencia/`.

## Riesgos abiertos

- El tablero del dueño no funciona para Costeo por Procesos — es la pantalla principal del producto, y el rubro que no puede usarla es exactamente el del cliente piloto. Vale la pena decidir si esto se prioriza por delante de los dos bloqueos ya conocidos, porque hoy ni arreglando esos dos el cliente vería un tablero completo.
- Sin forma de cargar la "unidad de gestión" desde la aplicación, ningún cliente nuevo del rubro puede llegar a ver el tablero armado en cajones por su cuenta.

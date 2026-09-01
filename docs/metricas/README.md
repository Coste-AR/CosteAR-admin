# Métricas de PR

`prs.csv` lo escribe solo `.github/workflows/metricas.yml` cada vez que entra un PR. **Nadie lo
edita a mano**: si una fila está mal, se arregla el workflow, no el archivo.

| Columna | Qué es |
| --- | --- |
| `pr` | Número del PR |
| `issue` | El issue que cerró. **Vacío = entró sin alcance declarado**, y eso es en sí mismo un hallazgo |
| `autor` | Quién lo abrió |
| `base` | Rama destino |
| `abierto` / `mergeado` | Marcas de tiempo |
| `horas` | Entre apertura y merge |
| `archivos` / `agregadas` / `borradas` | Tamaño del cambio |
| `corridas_ci` | Cuántas veces corrió el CI sobre la rama |
| `fallas_ci` | **Cuántas fallaron: son los intentos hasta el verde** |
| `tokens` / `minutos_sesion` | Lo que el agente reportó en su bitácora |
| `bitacora` | Ruta de la bitácora de esa sesión |

## Para qué sirve

Para que "el proceso mejora" sea un hecho y no una impresión. Las preguntas que esta tabla
responde y antes no se podían responder:

- **¿Cuánto cuesta un issue de verdad?** No lo que estimamos: lo que tardó.
- **¿Qué issues necesitaron más intentos hasta el verde?** Esa columna suele señalar un issue mal
  escrito, no un agente lento — es la lección de F-1 y F-2, medida en vez de recordada.
- **¿Cuántos PR entraron sin cerrar un issue?** Cada uno es trabajo sin alcance declarado.

## Lo que no hay que hacer con esto

**No usarla para comparar personas.** Un issue con más intentos casi siempre dice algo sobre cómo
lo pedimos, no sobre quién lo hizo. Toda la tanda B0 lo mostró: de las nueve fallas registradas,
ninguna fue del agente.

Y **las celdas vacías se dejan vacías.** Si un dato no está, no se completa a ojo: un número
inventado en una tabla que después alguien promedia es peor que un hueco, porque el hueco se ve.

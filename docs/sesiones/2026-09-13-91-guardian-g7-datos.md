---
issue: 91
repo: CosteAR-admin
pr: 97
minutos: no-informado
tokens: no-informado
clears: 0
intentos_hasta_verde: 1
rojos_deliberados: 0
rebotes_de_guarda: 0
---

# G7 protege los PR públicos desde el repo privado

## Qué se hizo

Se implementó el diseño elegido por el Owner el 13-09-2026. Un nuevo workflow de
`CosteAR-admin` recibe `{repo, pr, sha}` por `repository_dispatch`, verifica que el pedido
corresponda al head actual de un PR contra `dev`, lee con `CIRCUITO_PAT` el diff, título, cuerpo y
mensajes de commit, y publica el commit status exacto `G7/datos-de-cliente`.

El detector normaliza mayúsculas, acentos y puntuación, compara palabras completas y sólo revisa
contenido agregado. La lista queda en claro en este repo privado, con una cabecera que prohíbe
copiarla y dos identificadores ficticios para probarla. Las salidas contienen ubicaciones, nunca
el término ni el texto inspeccionado. La lista ausente o vacía, una lectura incompleta, una base
distinta de `dev` o un SHA desactualizado cierran la puerta con `failure`; un PAT ausente o sin
permisos no puede publicar y deja al consumidor sin el único status habilitante.

El contrato para los consumidores quedó en `docs/g7-contrato-status.md`. Backend #348 y frontend
#166 pueden implementar el disparo y la espera sin conocer la lista ni duplicar la detección.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** separar el detector puro del workflow. **Qué otra opción había:** mantener toda
  la normalización y el parseo del diff dentro de Bash. **Por qué:** el módulo Python se prueba con
  entradas controladas y permite demostrar que el resultado serializado no contiene términos; el
  workflow queda reducido a entrada, permisos y efectos sobre GitHub.
- **Qué decidí:** publicar `failure` y terminar exitosamente la corrida cuando G7 sí encontró una
  coincidencia. **Qué otra opción había:** dejar también el job en rojo. **Por qué:** encontrar y
  bloquear es el funcionamiento correcto del guardián; el semáforo que consume el repo público ya
  queda rojo. Los errores de configuración, lectura o publicación sí dejan roja la corrida de G7.
- **Qué decidí:** revisar también las rutas nuevas del diff. Si una ruta contiene un identificador,
  el comentario dice “ruta de un archivo modificado” o “archivo con ruta protegida” sin copiarla.
  **Qué otra opción había:** revisar sólo líneas agregadas o publicar la ruta textual. **Por qué:**
  un nombre de archivo también puede filtrar un cliente, pero repetirlo en el comentario violaría
  la prohibición de divulgar el término.
- **Qué decidí:** limitar el comentario a veinte ubicaciones e informar cuántas quedaron fuera.
  **Qué otra opción había:** comentar todas. **Por qué:** conserva evidencia accionable sin crear
  cuerpos enormes; el status sigue siendo `failure` aunque haya más hallazgos.

## Dónde el issue no alcanzaba

El criterio exigía archivo y línea sin imprimir el término, pero no definía qué hacer si el propio
nombre del archivo era el identificador. Se eligió una ubicación genérica con el número de línea,
del lado de no volver a publicar el dato.

El issue pide corridas reales roja y verde, pero GitHub sólo procesa `repository_dispatch` para un
workflow presente en la rama default. Antes del merge de este PR no existe una forma honesta de
producir esas corridas con `g7.yml`. Quedó documentado el procedimiento post-merge y una prueba
determinista en CI que cubre los mismos veredictos sin escribir estados en PR ajenos.

## Qué quedó afuera

- El disparo y la espera de G7 en los repos públicos: backend #348 y frontend #166.
- Las corridas cross-repo y su evidencia, ejecutables después de integrar #97 en `dev`.
- Reemplazar los dos términos ficticios por la lista real: lo hace una persona en un commit aparte.
- Eliminar las huellas ya publicadas en el seed de backend: #95.

## Con qué se verificó

```text
python scripts/probar-g7.py
  10 comprobaciones OK
  TODOS LOS CASOS PASAN

python scripts/chequear-workflows.py .github/workflows/*.yml
  7 workflows OK

Parseo completo de los 7 YAML con el paquete `yaml`
  OK

npm run lint
  comando informativo; ESLint todavía no aplica según CMD-02

npm run typecheck
  exit 0

npm test
  No test files found, exiting with code 0

npm run build
  exit 0

npm run test:e2e
  26 passed, 2 skipped (2.1m)
```

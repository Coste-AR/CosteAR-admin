---
issue: 89
repo: CosteAR-admin
pr: 92
minutos: 32
tokens: no-informado
clears: 0
intentos_hasta_verde: 2
rojos_deliberados: 1
rebotes_de_guarda: 0
---

# El guardián vuelve a arrancar el CI de los PR atrasados

## Qué se hizo

El guardián ahora ordena los PR por fecha y, cuando encuentra el primer PR contra `dev` que está
etiquetado y atrasado, actualiza su rama con el secreto de organización `CIRCUITO_PAT`. Termina la
corrida inmediatamente para que el CI disparado por ese push mida el código integrado antes de
considerar otro PR. El token normal de Actions se conserva para las demás operaciones y nunca se
usa como reemplazo del PAT.

Si el secreto no está disponible o el token fue revocado, venció o perdió permisos, el job queda
rojo, nombra `CIRCUITO_PAT` sin imprimir su valor y deja el PR etiquetado `necesita-mano`. Los PR
contra `staging` y `main` no se actualizan.

Se agregó una prueba de sabotaje que extrae el bloque ejecutable del workflow real, reemplaza la
red por un doble controlado y verifica cinco condiciones. La primera corrida de CI se hizo antes
del arreglo y quedó roja; la segunda, con el cambio implementado, pasó completa.

La misma lógica se replicó en:

- `CosteAR-backend` PR #339.
- `CosteAR-frontend` PR #159.
- `CosteAR-os` commit local `0290be6` (no se pudo publicar; ver más abajo).

## Decisiones que tomé sobre la marcha

- **Qué decidí:** fallar el job con una anotación `::error::` cuando falta o falla
  `CIRCUITO_PAT`. **Qué otra opción había:** dejar el workflow en verde y emitir sólo un warning.
  **Por qué:** el issue pide que el vencimiento sea visible y que el camino de falla se muestre en
  rojo; un warning en un cron exitoso vuelve a convertir el freno en silencio.
- **Qué decidí:** ordenar todos los candidatos por `createdAt` y salir después del primer
  `update-branch`. **Qué otra opción había:** confiar en el orden por defecto de `gh pr list` o
  actualizar todos. **Por qué:** sólo el orden explícito demuestra que se eligió el más viejo, y
  salir impide que dos actualizaciones simultáneas se vuelvan a atrasar entre sí.
- **Qué decidí:** usar `CIRCUITO_PAT` únicamente mediante una asignación de entorno en el comando
  `gh pr update-branch`. **Qué otra opción había:** reemplazar globalmente `GH_TOKEN` en todo el
  job. **Por qué:** mergear y cerrar issues no necesitan ampliar la credencial; reducir el uso del
  PAT reduce su exposición y conserva el comportamiento anterior.
- **Qué decidí:** versionar la prueba de sabotaje sólo en `CosteAR-admin` y ejecutarla desde su CI,
  pero correrla localmente contra las cuatro copias. **Qué otra opción había:** duplicar el script
  en los cuatro repos. **Por qué:** el issue declara a admin como lugar de desarrollo de los
  guardianes; cuatro copias del test crearían una segunda obligación de paridad no cubierta por la
  guarda existente.

## Dónde el issue no alcanzaba

El issue exige replicar en cuatro repos, pero no define cómo representar un único trabajo mediante
cuatro PRs ni qué referencia debe usar cada réplica. Se abrió el PR principal cerrando #89 y las
réplicas públicas sólo lo referencian, para no intentar cerrar un issue inexistente en sus repos.

Tampoco especifica si el fallo por token vencido debe dejar el job rojo o sólo avisar, ni dónde
debe vivir la prueba de sabotaje. Se eligieron las opciones explicadas arriba porque fallan de forma
visible y mantienen una sola prueba canónica.

La prueba de un PR atrasado que llega a mergearse de punta a punta no puede completarla este agente
antes de que el workflow esté en `dev`: requeriría aplicar `auto-merge` y permitir que la máquina
mergee un PR deliberado. El agente tiene prohibido tanto etiquetar como mergear.

## Qué quedó afuera

La réplica en `CosteAR-os` está implementada y verificada localmente, pero no publicada. La cuenta
`g-lautiialtamiranda` tiene permiso efectivo `READ`, `push=false`, y el repo privado declara
`allow_forking=false`; el push fue rechazado con HTTP 403. Sin permiso de escritura no existe una
ruta para abrir ese PR. Por lo tanto, la paridad 4/4 está demostrada sobre los archivos locales,
pero no está entregada en GitHub y #89 no debe considerarse cerrado todavía.

Los cuatro timeouts repetidos de Chromium que aparecieron sólo en Windows no se corrigieron en este
PR. La misma suite pasó completa en Actions/Linux y el hallazgo quedó separado como issue #93.

## Con qué se verifica

```text
python scripts/probar-auto-merge-atrasados.py .github/workflows/auto-merge.yml
  OK   los candidatos se ordenan del mas viejo al mas nuevo
  OK   sin secreto: falla visible y no empuja
  OK   token vencido: falla visible y deja el PR para una persona
  OK   dos atrasados: actualiza solo el mas viejo
  OK   staging y main: nunca ejecuta update-branch
TODOS LOS CASOS PASAN

python scripts/chequear-workflows.py .github/workflows/*.yml
ok en los 6 workflows

npm run typecheck
exit 0

npm run test
No test files found, exiting with code 0

npm run test:e2e (GitHub Actions/Linux, run 34652228256)
Running 28 tests using 1 worker
2 skipped
26 passed (3.4m)

npm run test:e2e (Windows local, dos corridas consecutivas)
4 failed, 2 skipped, 22 passed
Hallazgo separado: #93

Paridad normalizada del script ejecutable y disparadores
CosteAR-admin    1f0e99b3f16de3853d57b192246e06ce035cdbda340b44e
CosteAR-backend  1f0e99b3f16de3853d57b192246e06ce035cdbda340b44e
CosteAR-frontend 1f0e99b3f16de3853d57b192246e06ce035cdbda340b44e
CosteAR-os       1f0e99b3f16de3853d57b192246e06ce035cdbda340b44e
PARIDAD EXACTA: 4/4 local

GitHub Actions — camino rojo deliberado
run 34652152087: failure, 4 CASO(S) EN ROJO

GitHub Actions — camino verde
run 34652228452: success, TODOS LOS CASOS PASAN
```

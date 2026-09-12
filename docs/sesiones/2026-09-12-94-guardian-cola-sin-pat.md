---
issue: 94
repo: CosteAR-admin
pr: 96
minutos: 18
tokens: no-informado
clears: 0
intentos_hasta_verde: 2
rojos_deliberados: 1
rebotes_de_guarda: 0
---

# El guardián continúa la cola aunque falle el PAT

## Qué se hizo

El guardián conserva el error visible cuando `CIRCUITO_PAT` no está disponible o no puede
actualizar un PR atrasado, pero ya no termina la corrida en ese punto. Registra que ocurrió la
falla, continúa evaluando la cola y devuelve código 1 después del bucle. Así, un PR que necesita
intervención humana no impide que se mergeen otros PRs independientes que ya están al día.

La prueba canónica incorpora una cola de dos PRs: el primero está atrasado y el segundo al día.
Comprueba que el segundo alcanza el camino de merge y que, aun así, el job termina rojo y nombra
`CIRCUITO_PAT`. Los cinco casos anteriores siguen pasando, incluida la regla de actualizar como
máximo un PR atrasado por corrida.

La lógica se replicó en:

- `CosteAR-admin` PR #96.
- `CosteAR-backend` PR #343.
- `CosteAR-frontend` PR #161.
- `CosteAR-os` commit local `49e9f67` (no se pudo publicar; ver “Qué quedó afuera”).

## Decisiones que tomé sobre la marcha

- **Qué decidí:** reemplazar el pipeline que alimentaba al `while` por sustitución de proceso.
  **Qué otra opción había:** conservar el pipeline y comunicar el fallo con un archivo temporal o
  con el código de salida del subshell. **Por qué:** la sustitución de proceso mantiene el bucle en
  el shell principal, por lo que `falla_pat_ocurrio` conserva su valor después de recorrer la cola
  sin agregar estado en disco.
- **Qué decidí:** mantener `exit 0` inmediatamente después de un `update-branch` exitoso.
  **Qué otra opción había:** continuar evaluando los demás PRs. **Por qué:** el issue prohíbe
  cambiar la regla de uno por corrida; el CI nuevo del PR actualizado debe medirse antes de tocar
  otro atrasado.
- **Qué decidí:** hacer que la prueba registre que un PR llegó al camino de merge después del
  fragmento real que maneja el atraso. **Qué otra opción había:** simular todo GitHub CLI y `jq`
  para ejecutar el workflow entero. **Por qué:** el defecto estaba en el corte de flujo anterior;
  ejecutar el fragmento real demuestra que el segundo candidato ya no queda oculto, sin duplicar
  en el test toda la lógica de checks y merge que este issue no modifica.
- **Qué decidí:** conservar una sola prueba canónica en `CosteAR-admin` y ejecutarla localmente
  contra las cuatro copias. **Qué otra opción había:** copiar también el script de prueba a los
  otros repos. **Por qué:** cuatro copias del test crearían otra obligación de paridad; el
  antecedente #92 ya establece que el desarrollo de estos guardianes vive en admin.

## Dónde el issue no alcanzaba

El issue pide paridad en cuatro repos, pero no dice qué hacer si la cuenta del agente no puede
publicar una de las réplicas. Se siguió el antecedente de #92: los cambios publicables se entregan
como PRs en borrador y la réplica bloqueada queda implementada en un commit local verificable, sin
afirmar que llegó a GitHub.

El criterio dice que el segundo PR “se mergea”. La prueba canónica no levanta GitHub completo:
ejecuta el fragmento real del workflow que decide si el candidato continúa o corta la corrida, y
registra que el segundo alcanza el camino de merge. El comando real de merge no cambió en este
issue.

## Qué quedó afuera

La réplica de `CosteAR-os` está implementada y pasa la prueba canónica y el parser YAML, pero no se
pudo publicar. `g-lautiialtamiranda` tiene permiso efectivo `READ`, `push=false`; `git push`
respondió HTTP 403. El PR #96 debe permanecer en borrador hasta que una cuenta con escritura
publique `49e9f67` o replique el mismo cambio desde `origin/dev`.

Playwright volvió a fallar dos veces seguidas sólo en Windows. La primera corrida terminó con
`2 failed, 2 skipped, 24 passed`; la segunda con `3 failed, 2 skipped, 23 passed`. Son timeouts de
Chromium durante navegación o cierre del contexto y coinciden con el issue abierto #93. No se
tocaron tests ni timeouts para ocultarlo; el contraste en Actions/Linux queda pendiente del CI del
PR #96.

## Con qué se verificó

```text
python scripts/probar-auto-merge-atrasados.py .github/workflows/auto-merge.yml
  Antes del arreglo: 1 CASO(S) EN ROJO
  Después del arreglo: TODOS LOS CASOS PASAN

La misma prueba contra auto-merge.yml de admin, backend, frontend y os
  TODOS LOS CASOS PASAN en las cuatro copias

python scripts/chequear-workflows.py <auto-merge.yml de cada repo>
  ok en las cuatro copias

npm run typecheck
  exit 0

npm run test
  No test files found, exiting with code 0

npm run test:e2e (Windows local, primera corrida)
  2 failed, 2 skipped, 24 passed

npm run test:e2e (Windows local, segunda corrida)
  3 failed, 2 skipped, 23 passed
  Hallazgo existente: CosteAR-admin#93
```

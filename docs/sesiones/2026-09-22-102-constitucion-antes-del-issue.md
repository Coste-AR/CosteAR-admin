---
issue: 102
repo: CosteAR-admin
pr: 107
rama: chore/issue-102-constitucion
agente: codex
modelo: gpt-5.6-sol
tanda: B2
inicio: 2026-09-22T15:06-03:00
fin: 2026-09-22T15:13-03:00
minutos: 7
tokens: no-informado
clears: 0
intentos_hasta_verde: 2
rojos_deliberados: 0
rebotes_de_guarda: 0
---

# Constitución antes del issue

## Qué se hizo

- `AGENTS.md` ahora indica leer la Constitución de CosteAR antes de interpretar el issue.
- Se explicita que una contradicción invalida el issue y debe informarse allí sin ejecutar el trabajo.
- Las decisiones tomadas durante la implementación deben citar en la bitácora el principio aplicado.
- El registro de cambios normativos documenta la incorporación de esta regla.

## Recursos

- Tiempo de pared: 7 minutos.
- Tokens: no informado por la herramienta.
- Intentos hasta verde: 2. El primero no pudo ejecutar `tsc` ni `vitest` porque el worktree todavía no tenía las dependencias instaladas; después de `npm ci`, la verificación completa pasó.
- Verificación: `npm run typecheck`, `npm run test`, `npm run test:e2e` y `git diff --check`.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** mantener la indicación en un único párrafo inmediatamente después de `npm run briefing`. **Alternativa:** repartirla en una lista o en otra sección. **Motivo:** conserva el orden obligatorio antes de leer el issue y evita convertir la guía en una copia de la Constitución (`Constitución §7`).
- **Qué decidí:** enlazar la versión de `dev` indicada por el issue. **Alternativa:** usar un enlace sin rama. **Motivo:** deja una fuente verificable y compartida para todo el equipo (`Constitución §7`).

## Dónde el issue no alcanzaba

- No fijaba el texto exacto ni el formato del párrafo; se eligió una formulación imperativa y breve, coherente con el resto de `AGENTS.md` (`Constitución §9`).

## Qué quedó afuera

- No se copió ni resumió la Constitución.
- No se modificaron archivos fuera de `AGENTS.md` y esta bitácora.

## Con qué se verificó

```text
npm run typecheck # verde
npm run test      # 3 tests de briefing en verde; Vitest sin tests de src, exit 0
npm run test:e2e  # 26 passed, 2 skipped
git diff --check  # verde
```

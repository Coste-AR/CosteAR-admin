---
issue: 98
repo: CosteAR-admin
pr: 98
rama: feat/briefing-modo-mensajes
agente: codex
modelo: gpt-5.6-sol
tanda: B2
inicio: 2026-09-13T23:03-03:00
fin: 2026-09-14T09:28-03:00
minutos: 625
tokens: 62273
clears: 0
intentos_hasta_verde: 2
rojos_deliberados: 1
rebotes_de_guarda: 0
---

# Briefing con modo de trabajo y mensajes de la orquestación

## Qué se hizo

- El briefing imprime como primera línea el valor real de `MODO_TRABAJO` y declara explícitamente cuando no puede leerlo.
- Reúne comentarios `/agente` de los últimos siete días en issues `listo` o `bloqueado` y PRs abiertos, los ordena cronológicamente y convierte la hora a Argentina.
- Las consultas fallidas se informan por separado sin abortar el resto del briefing.
- El comportamiento quedó cubierto con `node:test`, incorporado a `npm test` y al CI.
- `AGENTS.md` indica que los mensajes del issue elegido se leen antes de tocar código.

## Recursos

- Tiempo de pared: 625 minutos, incluida la pausa nocturna causada por el límite de uso de Codex.
- Tokens informados por Codex: 62273.
- Intentos hasta verde: 2. El primero fue rojo deliberado porque el módulo de implementación todavía no existía.
- Verificación: `npm test`, `npm run typecheck`, `npm run build`, `npm run test:e2e`, `npm run briefing` y `git diff --check`.

## Decisiones que tomé sobre la marcha

- **Qué decidí:** separar la obtención y el formateo en funciones puras. **Alternativa:** probar el script completo lanzando procesos reales. **Motivo:** permite simular fallas parciales de `gh` y fechas sin depender de red.
- **Qué decidí:** usar `gh api --paginate --slurp` y aplanar sus páginas en Node. **Alternativa:** limitarse a una sola página. **Motivo:** conserva todos los comentarios del período sin combinar opciones incompatibles de `gh`.
- **Qué decidí:** ejecutar el nuevo test con `node:test` antes de Vitest. **Alternativa:** ampliar el include de Vitest. **Motivo:** el hook es ESM de Node y no forma parte de `src`, mientras el límite vigente de Vitest evita levantar specs de Playwright.

## Dónde el issue no alcanzaba

- No definía cómo paginar más de 100 comentarios; se conservaron todas las páginas y se aplanaron antes de filtrar.
- No indicaba dónde ubicar tests de un hook fuera de `src`; se usó el runner nativo de Node y se mantuvo intacto el include de Vitest.

## Qué quedó afuera

- Disparar agentes por evento y responder mensajes `/agente`, expresamente fuera de alcance.
- No se modificaron pantallas ni tests E2E.

## Con qué se verificó

```text
npm test          # 3 tests del briefing en verde; Vitest sin tests de src, exit 0
npm run typecheck # verde
npm run build     # verde
npm run test:e2e  # 26 passed, 2 skipped
npm run briefing  # Modo de trabajo: sprint; muestra el /agente de SantiagoBriz en #98
git diff --check  # verde
```

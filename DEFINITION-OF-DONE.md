# Definition of Done — CosteAR

> **Vinculante para el equipo.** Algo que no cumple *todos* los criterios de su nivel **no está
> terminado**, y no se mueve a "Done" en el tablero. Ante la duda, se pregunta **antes** de
> marcarlo, no después.

Vigente desde el **15 de agosto de 2026**, al entrar el primer cliente real.

Este documento define **cuándo algo está terminado** (proceso). *Qué* tiene que hacer cada cosa
son los criterios de aceptación del issue.

---

## Nivel 1 — Por tarea o issue

### Funcional

- [ ] Todos los criterios de aceptación del issue verificados **en staging**, no solo en tu máquina
- [ ] El flujo feliz anda sin errores reproducibles
- [ ] Los casos de borde del issue están cubiertos, **o diferidos con issue creado y motivo escrito**
- [ ] No rompe nada de lo que ya funcionaba
- [ ] **Si toca UI o un flujo: hay un test de Playwright que lo recorre de punta a punta.**
      Los tests unitarios no alcanzan — ya hubo un caso con 98 tests en verde y el flujo roto.
      Lo que reemplaza a la pasada manual por el navegador es la suite E2E: `npm run test:e2e`
      en verde, con captura adjunta de cada pantalla tocada. Si el flujo no se puede cubrir
      todavía (falta el fixture de sesión, por ejemplo), se difiere **con issue creado**, igual
      que cualquier otro caso de borde

### Código

- [ ] PR abierto contra `dev` con la plantilla completa: qué, por qué, cambios y cómo probarlo
- [ ] **Review pedido a alguien del equipo** — o, si se mergeó sin review, que haya sido una
      decisión consciente y no un olvido. *GitHub no lo bloquea (ver más abajo): depende de vos.*
- [ ] Sin comentarios de review sin resolver
- [ ] `npm run lint` sin errores *(no aplica en admin todavía)*
- [ ] `npm run typecheck` sin errores
- [ ] `npm test` en verde, incluidos los tests nuevos del PR
- [ ] Backend, si tocó RLS, aislamiento o queries: `npm run test:integration` en verde
- [ ] Sin `console.log` de debug ni código comentado
- [ ] Variables de entorno nuevas documentadas en `.env.example`
- [ ] Commits convencionales y atómicos

### Dominio (backend, cuando aplica)

- [ ] Si tocó el motor de cálculo: los fixtures de "Piezas mecánicas de precisión" y los tres
      casos de ITCS de la cátedra dan **exactamente** lo mismo que antes
- [ ] Migraciones **aditivas**, sin `DROP` sobre tablas con datos
- [ ] Las mutaciones nuevas escriben su bitácora en la misma transacción

### Documentación

- [ ] Decisión no trivial registrada en `docs/adr/`
- [ ] `README` o `CONTRIBUTING` actualizados si cambió el setup o la arquitectura
- [ ] Sesión registrada con `/costear-bitacora`

---

## Nivel 2 — Por tanda de trabajo (nuestro "sprint")

Somos tres y no corremos sprints formales de dos semanas. El equivalente es **cada promoción a
`staging`**.

- [ ] Todo lo que entra alcanza el Nivel 1
- [ ] Lo que quedó afuera tiene **motivo escrito** y issue abierto
- [ ] `dev` sin tests en rojo al momento de promover
- [ ] Sin deuda técnica crítica introducida sin issue creado
- [ ] La bitácora está al día: hay entrada de cada sesión de la tanda
- [ ] **Probado en staging antes de promover a `main`** — staging existe para eso, no para mirarlo

---

## Nivel 3 — Por entrega al cliente

El nivel que importa ahora que hay un cliente real.

### Antes de mostrarlo

- [ ] Los flujos críticos probados **con datos reales del cliente**, no con datos de prueba
- [ ] Los números verificados contra el cálculo manual del costista. **Si un número no cierra, no
      se entrega** — se avisa antes de que lo vea el cliente
- [ ] Sin errores nuevos en el monitoreo (Sentry) después del deploy
- [ ] La suite E2E cubre los cuatro viewports configurados (Chrome y Safari de escritorio,
      Pixel 5 e iPhone 12) y está en verde en la rama que se promueve

### Seguridad

- [ ] Sin secretos en el código ni en el historial de git
- [ ] Aislamiento entre empresas verificado con la suite de integración (RLS real, no mocks)
- [ ] Los datos del cliente no salieron del entorno: ni en logs, ni en issues, ni en la bitácora

### Registro

- [ ] Entrada de bitácora de la entrega, con qué se entregó y cómo verificarlo
- [ ] Lo pendiente comunicado por escrito al cliente, no solo de palabra
- [ ] Si hubo un cambio de alcance, quedó aprobado **por escrito** antes de hacerlo

---

## Reglas de proceso que sostienen esto

**Bloqueos.** Intentá solo por **máximo 1 hora**. Después avisá en el canal con tres datos: qué
querés hacer, qué probaste, qué necesitás. *Bloqueo avisado el martes = oportunidad de resolver.
Bloqueo avisado el viernes antes de la demo = problema del equipo.*

**Decisiones.** Chica (< 4 h de impacto): decide quien la está haciendo y la documenta en el PR.
Media (afecta un módulo): se consulta y se escribe en un ADR. Grande (cambia la arquitectura o
afecta al cliente): se decide entre los tres, por escrito. **Si una decisión te bloquea más de
2 horas, escalá.**

**Cambios de alcance.** Nada entra sin aprobación escrita. Acuerdo verbal o de WhatsApp se
confirma por escrito dentro de las 24 h. *Lo que se acuerda por escrito, existe.*

**Review.** Los PRs asignados se revisan dentro de las 24 h hábiles. Los comentarios son sobre el
trabajo, nunca sobre la persona, y se toman como información.

> **El review no está forzado por GitHub** (decisión del 15-08-2026). Cada uno puede aprobar y
> mergear su propio PR. La razón es práctica: somos cuatro y con distintos ritmos, y exigir la
> aprobación de otro frenaba el trabajo más de lo que lo protegía.
>
> **Lo que sí está forzado es el CI**: nada entra a `dev`, `staging` ni `main` con los tests o el
> typecheck en rojo, ni siquiera siendo administrador.
>
> **Dónde sí conviene pedir review igual, aunque nadie te obligue:** cambios en el motor de
> cálculo, migraciones, cualquier cosa que toque plata del cliente, y todo lo que vaya a `main`.
> Ahí el costo de equivocarse lo paga el cliente, no nosotros.

---

## Cómo se cambia este documento

Solo **por acuerdo de los tres**, y se anota acá abajo. No se cambia por conveniencia a mitad de
una entrega.

| Fecha | Qué cambió | Motivo | Acordado por |
| --- | --- | --- | --- |
| 2026-08-15 | Versión inicial | Primer cliente real. Adaptado de la Definition of Done de ASOME (DeWall) a un equipo de 3 sin sprints formales | Santiago |
| 2026-08-30 | Sale la verificación visual manual; entra la suite E2E automatizada | El objetivo pasa a ser volumen: desarrollo y documentación en masa con agentes de Codex. Una pasada manual por el navegador en cada issue no escala a ese ritmo, y además era el único criterio de la DoD que dependía de que una persona específica estuviera disponible. Lo reemplaza Playwright en los tres repos, con captura de pantalla como evidencia adjunta para que la revise un agente | Santiago |

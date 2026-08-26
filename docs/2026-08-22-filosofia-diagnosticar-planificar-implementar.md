# La filosofía: diagnosticar, planificar, recién ahí implementar

> **Este archivo es un espejo.** La fuente canónica vive en el Second Brain de Santiago
> (`Auditorias/2026-08-22-filosofia-diagnosticar-planificar-implementar.md`), fuera de cualquier
> repo de código. Se copia acá, en `CosteAR-admin` (repo git, compartido con el equipo), para que
> cualquiera pueda abrirla sin depender de la máquina de Santiago — el mismo patrón que ya se usa
> para sincronizar la bóveda.
>
> Salió del `CLAUDE.md` de los tres repos de código (sección 0.bis) el 22-08-2026 porque cargaba en
> **todas** las sesiones de Claude sin importar la tarea, y porque esos archivos ya venían pasados de
> las ~200 líneas recomendadas. El resumen operativo de los tres pasos sigue en cada `CLAUDE.md`;
> esto es la versión completa, con el caso que la probó y el porqué de cada trampa.
>
> Si se edita, editar primero el original del Second Brain y después copiar acá — no al revés.
>
> **Esta es la forma de trabajar, no una recomendación.** Vale para código, para infraestructura,
> para procesos y para cualquier problema que aparezca.

## Los tres pasos, en orden, siempre

| Paso | Qué significa | Qué NO es |
|---|---|---|
| **1. Diagnosticar** | Medir qué está pasando, con números y comandos reproducibles. Descartar primero lo que **no** es el problema. | No es opinar, ni suponer, ni empezar a arreglar lo primero que se ve |
| **2. Planificar** | Escribir el plan **antes** de ejecutarlo: fases independientes, con su costo y lo que cierra cada una. Y las **alternativas descartadas, con el motivo**. | No es una lista de tareas: si no dice por qué se eligió eso y no otra cosa, no es un plan |
| **3. Implementar** | Recién acá se toca algo. Y se verifica **en el entorno donde el trabajo va a vivir**, no donde uno está parado. | No es "empiezo y veo" |

**Por qué importa, con el caso que lo probó:** el 20 y 21-08 se arreglaron cinco defectos del motor
de costeo, y en el medio se perdieron horas en re-trabajo. La reacción natural era escribir otra
regla. En vez de eso se midió: **de 24 PRs en tres días, 4 no agregaron nada** — existían solo para
recuperar trabajo ya hecho. Con ese número, la causa apareció sola, y resultó ser **cuatro casillas
de configuración apagadas**, no una falta de disciplina.

**Sin el diagnóstico, se habría arreglado el problema equivocado.**

## Las tres trampas que este orden evita

1. **Arreglar el síntoma.** Los tres primeros incidentes parecían culpa de los PRs apilados. El
   cuarto fue un PR simple: el apilamiento agravaba, no causaba. Prohibir los apilados habría
   costado trabajo y no habría arreglado nada.
2. **Escribir una regla en vez de un control.** REV-08 se escribió el 18-08 por un accidente
   concreto y volvió a pasar tres veces en tres días. **Una regla que hay que recordar en el momento
   exacto no es un control: es una intención.** Si algo tiene que pasar siempre, se automatiza o se
   configura; escribirlo es el último recurso, no el primero.
3. **Verificar donde uno está parado.** Un test que pasaba en la máquina del dev no cargaba en el
   CI. Un instructivo escrito en sintaxis de bash para alguien que usa PowerShell. **Verificar es
   verificar allá, no acá.**

## Cómo se aplica en el día a día

- **Antes de escribir código para un problema nuevo:** medir primero. Un comando que devuelva un
  número vale más que un párrafo de análisis.
- **Todo diagnóstico y todo plan quedan escritos** en el documento consolidado de `CosteAR-admin`
  (`docs/`) o acá en el Second Brain, no en un `.md` nuevo suelto. Con las alternativas descartadas.
- **Lo que salió mal se escribe igual**, y con el mismo detalle que lo que salió bien: es de donde
  sale el diagnóstico siguiente.
- **Al terminar, se anota en la bitácora** (`/costear-bitacora`), en castellano llano.

> Si el trabajo empieza por el paso 3, en algún momento se vuelve al 1 — pero habiendo gastado el
> tiempo dos veces.

## Por qué vive acá y no en el vault de conocimiento (`costear-knowledge-base`)

Se evaluó ponerla en el repo de la bóveda de costeo y se descartó: **ese repo alimenta el RAG del
clasificador de documentos**, y el indexador (`vault-indexer-service.ts`) mete **cualquier** `.md`
que encuentre —solo excluye el `README.md` de la raíz—. Un archivo sobre cómo trabaja el equipo de
ingeniería se habría mezclado, en la búsqueda vectorial, con la doctrina de costeo de la cátedra de
Mirta. Este documento no tiene nada que ver con costeo: no debe entrar a ese índice.

# 2026-08-15 — 61 tests que no corrían en ningún lado

- **Repo(s):** backend
- **Rama:** `fix/tests-de-base-que-no-corrian-en-ci`
- **PRs:** [backend #58](https://github.com/Coste-AR/CosteAR-backend/pull/58)
- **ADRs:** [backend#0001](https://github.com/Coste-AR/CosteAR-backend/blob/dev/docs/adr/0001-tres-suites-de-test-segun-el-rol-de-postgres.md)
- **Estado:** en review, CI en verde

## Qué se hizo

Buscando pendientes apareció algo que no estaba en ninguna lista: **el CI daba verde mientras
61 tests no se ejecutaban en ningún lado.**

Los más importantes eran **34 tests que verifican que una empresa no pueda ver los datos de
otra**. Con el primer cliente cargando información real, esa es la garantía más sensible que
tenemos, y hacía semanas que nadie la estaba comprobando — aunque el tablero de CI dijera que sí.

También estaban sin correr: 9 tests de que la evidencia cargada no se pueda pisar, 10 del
criterio de importe e IVA, y 8 de trazabilidad del cálculo.

Se arregló: **hoy los 66 corren en cada Pull Request y el CI falla si alguno no pasa.**

## Por qué pasaba

Tres decisiones razonables por separado que juntas dejaron un hueco:

1. Esos tests se **saltean solos** cuando no encuentran una base de datos — está bien, así no
   revientan en la máquina de alguien que no levantó Docker.
2. La tanda rápida de tests **no usa base de datos** a propósito, para tardar segundos en vez de
   minutos.
3. La tanda que **sí** levanta una base miraba una sola carpeta, y estos archivos estaban en otra.

Nadie los corría. Y como *saltearse* no cuenta como *fallar*, el semáforo seguía en verde.

> **La lección, que vale más que el arreglo:** un test que se saltea en silencio es peor que no
> tenerlo. Si no está, al menos sabés que no está. Salteado, te da la tranquilidad de creer que
> algo se está verificando cuando no.

## Decisiones que se tomaron sobre la marcha

- Al intentar hacerlos correr apareció un segundo problema: los dos grupos necesitan **permisos
  de base de datos opuestos**. Los de aislamiento tienen que correr con un usuario *restringido*
  (si corrieran con uno todopoderoso darían verde aunque la protección estuviera rota); los otros
  necesitan uno *con permisos* porque crean sus propios datos de prueba. Se separaron en dos
  tandas, cada una con su usuario. Todo el razonamiento y las alternativas descartadas quedaron
  en el ADR 0001.
- Se agregó un **chequeo automático** que hace fallar el CI si alguien escribe un test que
  necesita base y se olvida de anotarlo donde corresponde. Sin eso, el mismo error vuelve en
  tres meses. Se probó en los dos sentidos: pasa cuando está bien y falla cuando falta un archivo.
- El CI ahora **genera claves de firma descartables** en cada corrida, porque uno de los tests
  firma un token de verdad. Son de usar y tirar contra una base descartable: no hay ningún
  secreto nuevo que guardar.

## Qué quedó pendiente

- Los hallazgos 🔴 abiertos de `AUDITORIA-MAXIMA.md` (11-07): la configuración se pisa con
  `UPDATE` en vez de versionarse, y la auditoría se escribe fuera de la transacción. **Son
  violaciones de las reglas duras del proyecto** y merecen su propio plan: tocan el motor.
- Activar el escaneo de secretos y la protección contra pushes con credenciales en GitHub
  (gratis en los repos públicos, hoy desactivado).
- Limpiar las ~100 ramas viejas de los tres repos.
- Nadie usa GitHub Issues: el trabajo vive en Trello y las plantillas nuevas no las ve nadie.

## Cómo verificarlo

1. En el PR #58, el paso **"Run DB-backed security & traceability tests"** reporta
   **66 pasando, 0 salteados**. Si algún día aparecen salteados ahí, la verificación de
   aislamiento dejó de hacerse.
2. La tanda rápida pasó de 65 tests salteados a 4, y esos 4 son a propósito (un banco de
   medición del clasificador que se enciende a mano).
3. `npm run check:tests-base` desde el backend: dice si algún test quedó fuera de las tandas.

## Riesgos abiertos

- **Si alguien vuelve a unificar las dos tandas de base en una**, los tests de aislamiento pasan
  a correr con el usuario todopoderoso y **dan verde aunque la protección esté rota**. Es el modo
  de falla más caro: el test existe, está en verde y no prueba nada. Quedó advertido en el
  ADR 0001 y en los comentarios de los tres archivos de configuración.
- El arreglo hace que el CI tarde un poco más. Es el precio de que verifique de verdad.
- Quedó creada en la base local de Santiago una base `costear_test` y un usuario `costear_app`
  para poder correr esto en su máquina. No molestan y sirven; están documentados en
  `vitest.db.config.ts`.

# Bitácora de desarrollo — CosteAR

Este es el **registro de qué se hizo, cuándo y por qué** en los tres repos de código de CosteAR.
Existe para que dentro de seis meses —o frente a un cliente que pregunta— podamos responder con
precisión en lugar de con memoria.

Se empezó el **15 de agosto de 2026**, al entrar el primer cliente real.

---

## 🔟 Las diez reglas del equipo

> Si de todo esto leés una sola cosa, que sea esta lista. Aplica a los tres repos.

1. **Nunca se pushea directo a `main`, `staging` ni `dev`.** Todo entra por Pull Request.
2. **Las ramas salen de `dev`**, se llaman `<tipo>/<slug-corto>` y viven días, no semanas.
3. **La promoción es `feature → dev → staging → main`**, sin saltear pasos.
4. **Los commits son convencionales:** `tipo(alcance): descripción en imperativo`.
5. **Un commit = una idea.** Si tocaste dos cosas sin relación, son dos commits.
6. **Nada se mergea con el CI en rojo** ni con comentarios de review sin resolver.
7. **Los tableros son la fuente de verdad**, no el chat ni la memoria de nadie.
8. **Lo que se acuerda por escrito, existe.** Decisión que no está en un issue, PR o ADR, no pasó.
9. **Nunca `--no-verify`.** Si un hook te frena, el hook tiene razón.
10. **Ante la duda, frená y preguntá.** No adivines lo que quiso decir un ticket ambiguo.

**Y la que las sostiene a todas:** los tests unitarios en verde **no** significan que el flujo
funcione. Pasó en un proyecto real: 98 tests verdes y el flujo roto en dos lugares distintos.
Nada que toque UI o flujo se pushea sin haberlo abierto y probado.

---

## Cómo está organizado

```
bitacora/
├── README.md      ← este archivo
├── INDICE.md      ← tabla maestra: una fila por sesión, más reciente arriba
└── sesiones/
    └── AAAA-MM-DD-<repo>-<slug>.md
```

Y en **cada repo de código** (`CosteAR-backend`, `CosteAR-frontend`, `CosteAR-admin`):

```
docs/adr/NNNN-slug.md   ← una decisión técnica por archivo, junto al código que la implementa
```

**Por qué separado:** la bitácora cuenta *qué pasó* y la lee cualquiera del equipo, sea o no
programador. Los ADR explican *por qué el código es así* y viven al lado del código, donde el
que lo lea los va a encontrar.

---

## Cómo se escribe una entrada

**No se escribe a mano.** Al cerrar una sesión de trabajo, en cualquiera de los repos:

```
/costear-bitacora
```

La skill lee el `git log` y los PRs reales, redacta la entrada, la guarda en `sesiones/` y agrega
la fila al `INDICE.md`. Se hace en el mismo commit.

Para una decisión técnica puntual, desde el repo donde vive el código:

```
/costear-adr
```

## Las reglas de la bitácora

1. **Una entrada por sesión de trabajo**, no por commit.
2. **Se escribe para quien no programa.** Alan y Lauti tienen que poder leerla. Término técnico
   que no se pueda evitar, se aclara entre paréntesis.
3. **Toda entrada linkea a PRs y ADRs reales.** Una entrada sin links no sirve como trazabilidad.
4. **Nunca se edita una entrada vieja para corregir la historia.** Si algo cambió, es una entrada
   nueva que referencia a la anterior.
5. **Nada de credenciales, tokens ni datos del cliente**, aunque este repo sea privado.
6. **Lo que salió mal también se escribe.** Una bitácora donde todo salió bien es una bitácora
   que nadie va a creer, y la parte útil justamente es lo que se aprendió.

---

## Documentos relacionados

| Dónde | Qué |
| --- | --- |
| `CLAUDE.md` (en cada repo) | Reglas duras que la IA carga sola en cada sesión |
| `CONTRIBUTING.md` (en cada repo) | Guía para una persona: setup, flujo, convenciones |
| `DEFINITION-OF-DONE.md` (este repo) | Cuándo algo está realmente terminado |
| `docs/adr/` (en cada repo) | Decisiones técnicas, una por archivo |

---

## Estado de las reglas por repo

| Repo | Visibilidad | Protección de ramas | CI |
| --- | --- | --- | --- |
| `CosteAR-backend` | pública | ✅ forzada por GitHub | lint · build · tests · integración |
| `CosteAR-frontend` | pública | ✅ forzada por GitHub | lint · build · tests |
| `CosteAR-admin` | privada | ⚠️ **acuerdo, no forzada** | typecheck · build |
| `costear-knowledge-base` | privada | ⚠️ **acuerdo, no forzada** | — |

> La protección de ramas de GitHub solo funciona en repos públicos con el plan Free de la
> organización. En los repos privados las reglas valen igual: son un acuerdo del equipo.
> Si en algún momento pasamos a GitHub Team, se pueden forzar también ahí.

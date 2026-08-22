---
paths:
  - "bitacora/**"
---

# La bitácora — cómo se mantiene

> Extraído de `CLAUDE.md` el 22-08-2026 (Pieza 1: partir el archivo raíz por rutas). Carga solo
> cuando el trabajo toca `bitacora/`, que es cuando estas reglas importan.

```
bitacora/
├── README.md      ← cómo funciona (y las 10 reglas de oro del equipo)
├── INDICE.md      ← tabla maestra, una fila por entrada, más reciente arriba
└── sesiones/
    └── YYYY-MM-DD-<repo>-<slug>.md
```


|ID|Regla|
|---|---|
|**BIT-01**|**Una entrada por sesión de trabajo.** La escribe `/costear-bitacora`, no se hace a mano.|
|**BIT-02**|**Se escribe para Alan y Lauti, que no son devs.** Nada de jerga sin explicar. Si hace falta un término técnico, se aclara entre paréntesis.|
|**BIT-03**|**Toda entrada linkea a los PRs y ADRs reales.** Una entrada sin links no sirve como trazabilidad.|
|**BIT-04**|**Nunca se edita una entrada vieja para "corregir la historia".** Si algo cambió, es una entrada nueva que referencia a la anterior.|
|**BIT-05**|El `INDICE.md` se actualiza en el mismo commit que la entrada.|
|**BIT-06**|**Nada de credenciales, tokens ni datos del cliente en la bitácora.** Aunque el repo sea privado.|

---

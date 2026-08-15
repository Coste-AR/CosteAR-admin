---
titulo: "Manual de las skills de CosteAR"
area: "001 - Costear"
tipo: manual
actualizado: 2026-08-15
para: "Todo el equipo — Alan, Lauti, Santi, Giuli"
---

# Manual de las skills de CosteAR

> **Qué es una skill.** Una instrucción guardada que Claude Code ya conoce. La llamás
> escribiendo `/` y su nombre, y hace un trabajo del equipo siempre igual, siguiendo nuestras
> reglas. No hay que instalar nada: aparecen solas con un `git pull` en cualquiera de los repos.

Son **seis**. Cinco las usan los devs; **`/costear-issue` la usa todo el equipo.**

---

## Antes de empezar (una sola vez por máquina)

1. Tener **Claude Code** abierto en la carpeta de alguno de los repos de CosteAR.
2. Tener **`gh`** (la herramienta de GitHub) instalada y con **tu propia cuenta** iniciada:

   ```bash
   gh auth status     # si dice que no estás logueado:
   gh auth login
   ```

   Esto importa: el issue o el PR queda **a nombre tuyo**, y así el resto sabe a quién
   preguntarle.

3. Solo para devs, y solo una vez por repo — decirle dónde está el repo de admin, que es donde
   vive la bitácora:

   ```bash
   git config costear.adminPath "<ruta absoluta a CosteAR-admin>"
   ```

---

## La foto completa

```
 ALGO FALTA / ALGO ESTÁ MAL
            │
            ▼
     /costear-issue          ← Alan y Lauti (y quien sea)
            │
            │   el dev toma el issue y programa
            ▼
     /costear-commit         ← guardar el trabajo en pedazos ordenados
            │
     /costear-adr            ← si se tomó una decisión no obvia (mismo PR)
            │
     /costear-pr             ← pedir que entre al proyecto
            │
     /costear-review         ← revisar antes de aprobar
            │
          merge
            │
     /costear-bitacora       ← contarle al equipo qué pasó
```

---

# 1. `/costear-issue` — cargar algo pendiente

**Quién:** Alan y Lauti principalmente. Cualquiera puede.

**En qué momento:** apenas lo ves. Auditando el producto, en una reunión con un cliente,
probando una pantalla, o cuando se te ocurre una mejora. **El momento es "ahora", no "después
lo anoto"** — lo que se anota después, no se anota.

**Qué hacés vos:** contarle el problema como se lo contarías a un compañero. Nada más.

**Qué hace ella:**

1. Te **pregunta lo que falta** (qué esperabas, qué pasó, cómo verlo de nuevo, si lo está
   sufriendo un cliente).
2. **Elige sola en qué repositorio va.** No tenés que saber qué es "backend".
3. **Revisa que no esté cargado ya.** Si está, agrega tu info al issue que existe.
4. Redacta el issue con nuestro formato y le pone las etiquetas.
5. **Te muestra el borrador y espera tu OK.** Recién ahí lo crea y te pasa el link.

**Lo que tenés que saber:**

- **El issue describe el PROBLEMA, no la solución.** Vos contás qué pasa y a quién le afecta;
  cómo se arregla lo decide quien lo programa mirando el código. Si igual se te ocurre una
  solución, decila: queda anotada como sugerencia.
- **"No sé" es una respuesta válida.** Es mejor que un dato inventado: le dice al dev por dónde
  empezar a mirar.
- **La prioridad la ponés vos**, no el dev. Es una decisión de negocio:
  - **alta** — un cliente está bloqueado, o hay un número de plata mal calculado
  - **media** — molesta, pero se puede trabajar igual
  - **baja** — mejora, prolijidad, nadie está esperando
- **El issue nace sin dueño.** Los devs lo toman según su carga. Si algo es urgente de verdad,
  ponelo en alta **y avisale a Santi o a Giuli por fuera** — una etiqueta no despierta a nadie.
- **Un hallazgo = un issue.** Si de una revisión te salen ocho cosas, son ocho issues chicos. Uno
  solo con ocho puntos no se cierra nunca.
- **Los repos de backend y frontend son públicos**: cualquiera en internet lee lo que escribas.
  Nada de contraseñas ni datos reales de clientes.

> **Cuándo NO usarla:** para una pregunta ("¿esto se puede?"), preguntá y listo. Para algo que se
> arregla en cinco minutos y ya está alguien haciéndolo, tampoco. El issue es para lo que **no**
> se va a hacer ahora mismo.

---

# 2. `/costear-commit` — guardar el trabajo

**Quién:** devs.

**En qué momento:** cada vez que terminás **un pedazo** de trabajo que tiene sentido solo. No al
final del día con todo junto.

**Qué hace:** mira lo que cambiaste, lo **separa por concepto** y hace un commit por cada cosa,
con el formato del equipo (`tipo(area): descripción`).

**Lo que tenés que saber:**

- Un commit = un cambio lógico. Si tocaste dos cosas sin relación, van separadas.
- Antes de guardar corre el chequeo de tipos **de todo el repo**. Si el repo ya venía con un
  error de otro, te frena igual: hay que arreglarlo, no saltearlo.
- **Nunca `--no-verify`.** Si el chequeo te frena, tiene razón.
- En backend, si tocaste `prisma/schema.prisma`, corré `npx prisma generate` antes o vas a ver
  errores que no existen.

---

# 3. `/costear-adr` — anotar una decisión

**Quién:** devs (a veces con Santi).

**En qué momento:** cuando elegiste entre dos caminos y la elección no es obvia. **Regla
práctica: si lo pensaste más de diez minutos o lo discutiste con alguien, es un ADR.** También
cuando hiciste algo "mal a propósito" por una restricción real (tiempo, plata, límite de una
herramienta).

**Qué hace:** escribe un documento numerado en `docs/adr/` del repo, con el contexto, **las
alternativas que descartaste** y lo que aceptamos pagar por la decisión.

**Lo que tenés que saber:**

- Va **en el mismo PR** que implementa la decisión.
- Un ADR **nunca se borra ni se reescribe.** Si cambiamos de opinión, se escribe uno nuevo y el
  viejo queda marcado como superado. La historia de por qué cambiamos es la parte más útil.
- **Si todavía estás explorando, no es un ADR** — es una investigación. El ADR se escribe cuando
  ya se decidió.
- **No confundir con la bitácora:** el ADR explica *por qué el código es así* y lo lee un dev; la
  bitácora cuenta *qué pasó en la sesión* y la lee todo el equipo.

---

# 4. `/costear-pr` — pedir que el trabajo entre al proyecto

**Quién:** devs.

**En qué momento:** cuando terminaste **y ya lo probaste a mano**. No cuando "debería andar".

**Qué hace:** corre los tests, el lint y el chequeo de tipos; crea la rama si falta; la sube y
abre el Pull Request con la plantilla completa, apuntando siempre a `dev`.

**Lo que tenés que saber:**

- **Siempre apunta a `dev`.** Las promociones a `staging` y a `main` (lo que ve el cliente) las
  decide Santi aparte.
- Si algo está en rojo, **frena y pregunta**. Pedir revisión con el CI roto le hace perder el
  tiempo a otro.
- `Closes #N` solo si el PR cierra el issue **entero**. Si quedan cosas, `part of #N`: cerrar un
  issue a medias esconde trabajo pendiente.
- **Nadie te bloquea el merge, pero eso no significa que no haya que revisar.** Pedí revisión sí
  o sí si tocaste el motor de cálculo, migraciones, o algo que afecte plata del cliente.

---

# 5. `/costear-review` — revisar antes de aprobar

**Quién:** devs. También sirve para revisarte a vos mismo antes de mergear.

**En qué momento:** antes de mergear cualquier PR. **Obligatorio** si el cambio toca el motor de
cálculo, migraciones de base de datos, o plata del cliente.

**Qué hace:** revisa el PR contra las reglas duras del producto y los errores que ya nos pasaron,
y devuelve tres listas:

- **CRITICAL** — bloquea el merge
- **WARNING** — habría que arreglarlo
- **SUGGESTION** — opcional

**Lo que tenés que saber:**

- Revisa cosas que a ojo se pasan: que no se pise ningún dato cargado, que toda modificación deje
  su rastro, que no se le muestre un error crudo al usuario, que las migraciones no borren nada, y
  que la matemática del costeo siga dando **exactamente** lo mismo.
- **Los tests en verde no prueban que el flujo ande.** Ya nos pasó: 98 tests verdes y el flujo
  roto en dos lugares.
- Un cambio "solo de formato" también se mira crudo: ya se coló lógica adentro de uno.

---

# 6. `/costear-bitacora` — contarle al equipo qué pasó

**Quién:** el dev que trabajó. **La leen Alan y Lauti.**

**En qué momento:** al cerrar la sesión de trabajo, después de mergear.

**Qué hace:** lee los commits y los PRs **reales** (no escribe de memoria), redacta la entrada en
castellano llano y la guarda en `CosteAR-admin/bitacora/`, actualizando el índice.

**Lo que tenés que saber:**

- Se escribe **para quien no programa**. Si hace falta un término técnico, se aclara entre
  paréntesis.
- **Una entrada por sesión**, no por commit. Si no, es un `git log` con más pasos.
- **Lo que salió mal también se escribe.** Una bitácora donde todo salió bien no le sirve a nadie.
- Nada de contraseñas ni datos de clientes, aunque el repo sea privado.
- Es nuestra memoria frente al cliente: dentro de seis meses tenemos que poder responder qué se
  cambió, cuándo y por qué, sin depender de la memoria de nadie.

---

## Resumen en una tabla

| Skill | Quién | Cuándo |
| --- | --- | --- |
| `/costear-issue` | **Todos** | Apenas encontrás algo que falta o está mal |
| `/costear-commit` | Devs | Cada vez que terminás un pedazo de trabajo |
| `/costear-adr` | Devs | Cuando tomaste una decisión que no es obvia |
| `/costear-pr` | Devs | Cuando terminaste **y lo probaste a mano** |
| `/costear-review` | Devs | Antes de mergear. Obligatorio si toca cálculo o plata |
| `/costear-bitacora` | Devs | Al cerrar la sesión, después del merge |

---

## Preguntas frecuentes

**¿Y si me equivoco al cargar un issue?**
No pasa nada: se edita o se cierra. Es mucho peor el issue que nunca se cargó.

**¿Tengo que saber en qué repositorio va mi problema?**
No. La skill lo decide. Si de verdad es ambiguo, lo manda al backend y lo aclara adentro.

**¿Puedo escribir en castellano?**
Sí, todo. Los mensajes de commit, los issues y la bitácora van en castellano a propósito.

**¿Qué pasa si Claude se equivoca?**
Todo lo importante te lo muestra antes de hacerlo. Si el borrador está mal, decíselo y lo
corrige. Y ninguna skill mergea nada: eso lo decide una persona.

**¿Dónde están escritas las reglas completas?**
En el `CLAUDE.md` de cada repo. Este manual es el resumen para usarlas, no la fuente.

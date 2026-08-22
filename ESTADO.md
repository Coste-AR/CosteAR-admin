<!--
  EL MENSAJE DEL ORQUESTADOR — repo de ADMIN.

  Se inyecta entero al principio de cada sesión de Claude en este repo. Vale más
  corto que completo.

  Reglas para mantenerlo:
   - Máximo 20 líneas. Si no entra, es que algo de acá ya no está pasando.
   - Solo lo que cambia lo que alguien va a hacer HOY. Lo histórico va a docs/.
   - "No tocar" siempre con el motivo al lado: una prohibición sin razón se
     ignora o se pregunta, y las dos cuestan.
   - Cada repo tiene el suyo: lo que no hay que tocar en el backend no es lo
     mismo que acá.

  El hook saca los comentarios HTML como éste antes de inyectar: son para
  nosotros, no gastan contexto de la sesión.
-->

**Actualizado: 22-08-2026**

- ⚠️ **El flujo cambió**: el PR nace en draft. **Acá no hay auto-merge** —el repo es privado y el
  plan Free no lo incluye—, así que el merge se hace a mano con el CI en verde.
  Manual: https://github.com/Coste-AR/CosteAR-backend/blob/dev/docs/manual-de-flujo-de-trabajo.md
- 🔴 **Issue #18 abierto**: quedaron datos comerciales de un cliente en los repos **públicos**
  (backend y frontend). El historial de git es permanente: lo barato es no volver a escribirlos.
- 📌 **Este repo es privado y es donde va lo que no puede ser público**: el caso real de un cliente,
  la bitácora del desarrollo y los números que identifican a alguien.
- ✅ El sync de skills ya no publica datos del cliente (PR #35).

**En curso:** Santiago — infraestructura y flujo, en el backend.

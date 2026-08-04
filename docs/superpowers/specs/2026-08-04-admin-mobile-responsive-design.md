---
title: "Adaptar las secciones del admin a mobile"
fecha: 2026-08-04
estado: "Aprobado, en implementación"
---

# Adaptar el admin a mobile

## Contexto

El `AppShell` (sidebar, topbar, nav inferior) ya está adaptado a mobile —
tiene un bottom nav (`lg:hidden`) y un menú de usuario colapsable. Lo que
falta es el **contenido** de cada pantalla: tablas anchas que hoy solo
scrollean horizontalmente, y un layout de dos columnas fijo en la Consola IA
que no cabe en una pantalla de celular.

## Alcance

Las 6 pantallas del admin logueado (`/admin/*`). **No incluye** login,
registro, recuperar/cambiar contraseña — son formularios pre-login simples,
no "secciones de admin", y ya son razonablemente responsive.

Breakpoint: el que ya usa el resto de la app (Tailwind `sm`/`md`/`lg`; mobile
= debajo de `sm`, ~640px).

## Por pantalla

1. **Resumen** (`AdminOverview.tsx`) — ya responsive (`grid-cols-1
   md:grid-cols-2`). Solo ajustes menores de spacing.
2. **Staff** (`AdminUsers.tsx`) — la tabla de usuarios (`<table>` con
   `overflow-x-auto`) se convierte en una lista de tarjetas en mobile: una
   tarjeta por usuario con avatar, nombre, email, rol y fecha apilados. El
   modal de alta ya es responsive, sin cambios.
3. **Bóveda** (`VaultProposals.tsx`) — ya es tarjetas. Los headers
   (`flex justify-between`) y filas de botones de acción pasan a apilarse
   (`flex-col sm:flex-row`) en vez de recortarse en pantallas chicas.
4. **Consola IA** (`RagChat.tsx`) — el cambio más grande. Hoy el sidebar de
   sesiones (288px fijo) y el panel de chat conviven siempre
   (`flex h-[calc(100vh-12rem)]`). En mobile el sidebar se oculta por
   default, se abre con un botón (patrón tipo WhatsApp Web: lista de chats ↔
   chat activo, uno a la vez en pantallas chicas).
5. **Alertas** (`SystemAlertsPage.tsx`) — misma conversión de tabla a
   tarjetas que Staff. El detalle expandible (`AlertDetail`) se mantiene
   igual de funcional, solo cambia el contenedor que lo dispara.
6. **Términos** (`TermsAdminPage.tsx`) — ya colapsa a una columna
   (`lg:grid-cols-[1fr_280px]`). Se cambia el padding fijo (`p-8` →
   `p-4 sm:p-8`) para aprovechar mejor el ancho en pantallas chicas.

## Fuera de alcance

Lógica de negocio, llamadas a la API, textos, colores/branding. Es
exclusivamente estructura de layout responsivo.

## Verificación

`resize_window` a preset mobile (375×812) sobre cada una de las 6 pantallas
en el navegador, confirmando que no hay scroll horizontal y que el contenido
es usable (texto legible, botones con área de toque razonable).

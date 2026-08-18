# Los datos de Augusto, los repos públicos y dónde va a vivir CosteAR

**Para:** Giuli, Alan, Lauti
**De:** Santi
**Fecha:** 18-08-2026 · *versión 2, corregida*
**Para qué:** contar qué pasó con los datos de nuestro betatester, qué hicimos, y decidir juntos dos cosas — la visibilidad de los repos y dónde va a vivir CosteAR cuando empecemos a facturar.

---

## 1. Qué pasó

Trabajando en el vertical avícola subimos al repositorio del backend un archivo de tests con la **estructura de costos completa de nuestro betatester**: su costo por unidad, su costo fijo mensual, su precio de venta, su punto de equilibrio y el hecho de que hoy opera a pérdida. Con su nombre al lado.

**`CosteAR-backend` y `CosteAR-frontend` son públicos.** Cualquiera en internet los lee.

No es un dato técnico. Es información comercial de una persona real, que no eligió publicarla y a la que nunca le preguntamos.

**Y hay un agravante:** Augusto **no es cliente todavía, es betatester**. Nos prestó sus números reales para ayudarnos a probar si el producto sirve. Publicar los datos de alguien que te está haciendo un favor es peor que publicar los de alguien que te paga.

### Lo que hay que decir completo

La práctica de nombrarlo en el repo público **ya venía de antes**: el archivo de vocabulario avícola y hasta un ejemplo en nuestras propias reglas de equipo lo nombraban. No es que alguien hizo algo raro; es que **nadie había puesto la regla**.

Lo que sí pasó esta vez es que la exposición saltó de "un nombre suelto" a "la economía completa del negocio".

### Por qué importa de verdad

Ponelo del otro lado: si un competidor pudiera leer tu costo unitario y tu margen, ¿te daría lo mismo?

Nosotros vendemos un producto de **costos**. La información de costos de quien nos la confía es lo más sensible que tocamos. Si no la cuidamos nosotros, el producto entero pierde sentido.

Y es lo primero que va a preguntar el próximo betatester al que le pidamos sus números.

---

## 2. Qué hicimos ya

### Anonimizar

Reemplazamos los datos reales por **datos ficticios** en todos los archivos, y renombramos hasta la rama que llevaba su nombre en la URL.

**Los tests siguen probando exactamente lo mismo.** Eso es lo importante: lo que un test verifica es la *matemática* — que el punto de equilibrio se derive bien, que proyectar con la métrica equivocada infle el resultado. Esa matemática es idéntica con 6.300 aves o con 5.000. Los números reales no aportaban nada al test; solo aportaban riesgo.

Verificado: buscar su nombre en la rama principal no devuelve nada.

> Las cifras reales **no se perdieron**: van al repositorio privado. Sin ellas nadie puede volver a comprobar que nuestro motor reproduce su planilla, que es lo que las hacía valiosas.

### Escribir la regla

Sección nueva en las reglas de los tres repos, **CLI-01 a CLI-04**:

- Los datos de un cliente no entran a un repositorio público. Ni en tests, ni en seeds, ni en comentarios, ni en descripciones de PR, ni en mensajes de commit.
- Un test que necesita números realistas usa datos inventados.
- Antes de abrir un PR de un vertical: buscar el nombre del cliente o betatester en el repo. Si aparece, no se abre.
- Esto incluye la estructura económica: costo unitario, punto de equilibrio, margen y escala.

### Lo que la anonimización NO resuelve

**Git guarda todo.** Cambiar el archivo hoy crea una versión nueva; la vieja sigue ahí y se puede ver entrando al historial de cualquier PR.

Eso es lo que queda por decidir.

---

## 3. Decisión 1 — Qué hacemos con el historial

### El dato que cambia todo

| Métrica de `CosteAR-backend` | Valor |
|---|---|
| Forks (copias que hizo otra gente) | **0** |
| Watchers | **0** |
| Stars | 2 |
| Público desde | mayo 2026 |

Cero forks significa que **no hay copias fuera de nuestro control**.

### Las tres opciones

| | Qué es | Costo | Qué tapa |
|---|---|---|---|
| **A** | No hacer nada | 0 | Nada. Queda accesible para siempre |
| **B** | Reescribir el historial y forzar el repo | Medio día, todos re-clonan, hay que pedirle a GitHub que purgue su caché | **Solo lo que auditamos** |
| **C** | **Hacer los repos privados** | Un clic | **Todo el historial**, incluido lo que nadie revisó |

### Recomendación: C

Es **más barato y más completo** que B.

El argumento decisivo no es el precio: revisamos lo de esta semana, pero **nadie miró los 380 commits anteriores**. Reescribir da la sensación de haberlo resuelto habiendo limpiado solo la parte que conocemos.

**La pregunta previa no es técnica: ¿para qué son públicos nuestros repos?** Con 2 stars, 0 forks y 0 watchers, no parece que estén cumpliendo ninguna función.

### Qué se rompe si los ponemos privados

**El deploy sigue funcionando.** Railway y Vercel se conectan con permisos sobre el repo; los repos privados son el caso normal, no la excepción.

Lo único que cambia: los **minutos de CI** (los tests automáticos) dejan de ser ilimitados y pasan a consumir cuota del plan.

⚠️ **Verificar antes de apretar el botón:** el plan Hobby de Vercel es **solo para uso no comercial** y **no permite desplegar desde repositorios de una organización**. `Coste-AR` es una organización. Puede que ya estemos fuera de esas condiciones **hoy**, independientemente de la visibilidad.

---

## 4. Aclaración de vocabulario: "hosting" son tres cosas distintas

Antes de la decisión 2 hay que despejar esto, porque los tres se llaman "hosting" y solo uno sirve.

| Qué | Qué es | ¿Sirve para CosteAR? |
|---|---|---|
| **Hosting compartido** | Alquilás un pedacito de un servidor con otros cien. Es lo de WordPress | ❌ **No** |
| **VPS / Cloud Server** | Un servidor en la nube que alquilás y es tuyo. Root, tu sistema, tus recursos | ✅ **Es esto** |
| **Servidor dedicado** | Una máquina física entera | Sobra y es caro |

**VPS y "servidor en la nube" son el mismo producto.** DonWeb incluso vende el suyo como *"Cloud Server (mejor que VPS)"* — es marketing sobre la misma categoría.

### Por qué el compartido no sirve, con motivos de nuestro stack

No es purismo. Son cuatro cosas que nos romperían:

1. **No soporta conexiones persistentes.** Los proxies del compartido las cortan. Nuestro **webhook de WhatsApp** necesita un proceso escuchando todo el tiempo.
2. **No compila módulos nativos.** Prisma necesita binarios compilados. En compartido no instala.
3. **Competís por RAM con decenas de procesos ajenos.** Una fuga de memoria de otro cliente nos tira la app.
4. **PostgreSQL** rara vez está disponible: el compartido asume MySQL.

---

## 5. Decisión 2 — Dónde va a vivir CosteAR

### Dónde estamos hoy

```
GitHub (código)  →  Railway  →  el backend
                 →  Vercel   →  el frontend
```

Ninguno es "el servidor": son plataformas que agarran nuestro código y lo hacen correr. Nos cobran por hacer fácil algo que también podríamos hacer nosotros.

### Los números reales (agosto 2026)

| Opción | Costo |
|---|---|
| Railway Hobby | US$ 5/mes |
| Railway Pro | US$ 20/mes por persona |
| Vercel Pro (el que nos correspondería) | US$ 20/mes por persona |
| **DonWeb Cloud Server** (Rosario) | **desde AR$ 4.621/mes** |
| Hetzner CX22 (Alemania, 2 núcleos / 4 GB) | ~€4,35/mes |
| Coolify o Dokploy (panel de despliegue) | **Gratis** |
| Certificados SSL (Let's Encrypt) | **Gratis** |

### La corrección importante: pagar en pesos

La versión 1 de este documento recomendaba Hetzner porque **es lo que recomienda todo el contenido de startups tecnológicas**. Pero ese contenido está escrito para gente que paga en dólares o euros. Nosotros no.

| | Hetzner (Alemania) | DonWeb (Rosario) |
|---|---|---|
| Moneda | Euros, tarjeta internacional | **Pesos**, MercadoPago o Pago Fácil |
| Percepciones por compra en USD | Sí | **No** |
| Factura | Del exterior | **Factura A** — crédito fiscal |
| Soporte | Inglés / alemán | Castellano |
| Latencia a Tucumán | Cruzando el Atlántico | Local |

Con el dólar donde está, esos €4,35 son bastante más que AR$ 4.621 **antes** de percepciones. **El proveedor local puede terminar siendo más barato en plata real**, no solo más cómodo.

> **Lo honesto:** AR$ 4.621 es el plan de entrada y no sabemos qué máquina trae. El CX22 son 2 núcleos y 4 GB. Hay que comparar equivalentes antes de decidir — es lo primero que hay que preguntarle a DonWeb.

### Lo que sí cambia la ecuación: un subdominio por cliente

**Un subdominio por cliente** es el estándar de la industria para productos como el nuestro:

```
picodeoro.costear.app     →  el tenant avícola
otrocliente.costear.app   →  el que venga
app.costear.app           →  la app general
```

Cómo funciona, en criollo:

1. **Un solo registro DNS comodín** — `*.costear.app` apunta a nuestro servidor. **No hay que configurar nada cuando entra un cliente nuevo.**
2. **Un solo certificado comodín**, gratis con Let's Encrypt.
3. **El servidor mira el subdominio** y sabe de qué cliente es el pedido.

**Dar de alta un cliente pasa a ser una fila en la base de datos.** Cero configuración, cero costo marginal. Con las plataformas gestionadas, los dominios comodín piden planes superiores y el costo crece con cada cliente.

**Los límites del comodín**, para no llevarnos sorpresas:

- Cubre **un solo nivel**: `*.costear.app` cubre `picodeoro.costear.app` pero no `api.picodeoro.costear.app`.
- **Una sola llave para todos.** Si se compromete, afecta a todos los clientes.
- **No se puede revocar un cliente solo** revocando su certificado.

Para nuestra escala ninguno bloquea. A veinte clientes, se revisa.

### El nombre

Hay que decidir **el dominio**, porque es lo que los clientes van a ver en la barra del navegador y no se cambia gratis después.

- **`.com.ar`** — dice de dónde somos, es barato y es lo natural para clientes argentinos.
- **`.app` o `.com`** — más caro, pero no ata el producto a un país.

Sea cual sea, **es el gasto más chico de toda la lista**. La decisión es de marca, no de plata.

---

## 6. Cómo lo hacen las startups sin caja

Acá está la parte que más nos sirve, y arranca con una corrección de foco.

### El error de optimizar lo que no importa

Nuestro hosting cuesta entre **US$ 5 y US$ 40 por mes**. Discutir si pagamos 5 o 20 es discutir una diferencia de US$ 180 al año.

**Ahí no está la plata.** En una empresa de software la plata está en **los sueldos y los impuestos sobre los sueldos**. Optimizar el servidor mientras ignorás una reducción del 70 % en contribuciones patronales es optimizar el renglón equivocado.

Con eso en la cabeza, tres palancas, de mayor a menor impacto.

### Palanca 1 — Régimen de Economía del Conocimiento (la grande)

Es la que más plata mueve y es exactamente para lo que hacemos.

| Beneficio | Cuánto |
|---|---|
| Reducción de contribuciones patronales | **Hasta 70 %** |
| Bono de crédito fiscal transferible | **1,6×** las contribuciones sobre el mínimo no imponible — sirve para pagar IVA o Ganancias |
| Reducción de Impuesto a las Ganancias | **60 %** para micro y pequeñas empresas |

**Qué piden:**

- Ser persona jurídica constituida en Argentina y estar al día con las obligaciones fiscales y previsionales.
- Acreditar que **el 70 % de la facturación** del último año viene de las actividades promovidas. Software está adentro.
- Acreditar mejoras continuas de calidad e **invertir en capacitación**: 1 % para microempresas.

> **Ese 70 % de facturación es el requisito que hay que mirar de entrada**, porque condiciona cómo facturamos desde ahora, no cuando nos acordemos.

### Palanca 2 — IDEP Tucumán (la que tenemos al lado)

No es teoría lejana: el IDEP **ya prestó plata a 17 empresas de la provincia** en Economía del Conocimiento, de las cuales **7 son de software**, a través del Fondo para el Fomento Productivo.

Y hay algo más concreto todavía:

> **Programa INSERTAR** — el IDEP garantizó un cupo provincial de **$400.000.000** que le da a las PyMEs tucumanas **un salario mínimo por mes por cada trabajador nuevo** contratado en funciones de Economía del Conocimiento, hasta 12 meses.

Si en algún momento incorporamos a alguien, eso vale muchísimo más que cualquier ahorro de infraestructura.

**Acción concreta:** ya tenemos contacto con el IDEP por el radar de convocatorias. Preguntar directamente por el FFP y por INSERTAR.

### Palanca 3 — Créditos de nube, con los números reales

Acá hay que separar el marketing de lo que realmente se consigue **sin inversores**:

| Programa | Sin VC ni aceleradora | Con VC o aceleradora |
|---|---|---|
| **AWS Activate** | US$ 1.000 + US$ 350 de soporte | Hasta US$ 100.000 |
| **Microsoft Founders Hub** | Hasta US$ 5.000 (se endureció en 2025) | Hasta US$ 150.000, repartidos en ~4 años |
| **Google Cloud for Startups** | Hasta US$ 2.000, con 2 años para usarlos | Hasta US$ 350.000 (perfil IA) |

**La lectura honesta:** sin inversor, hablamos de **US$ 1.000 a 5.000**. Está bien, pero no es transformador — cubre uno o dos años de infraestructura chica y después se acaba.

**Y tiene una trampa conocida:** los créditos te empujan a diseñar sobre servicios propietarios de ese proveedor. Cuando se agotan, mudarte cuesta más que lo que ahorraste. Si los usamos, que sea sobre cosas estándar (una máquina, una base Postgres), no sobre servicios que solo existen ahí.

> **El atajo real para los montos grandes:** los tramos de US$ 100.000+ piden estar en una **aceleradora reconocida**. Entrar a una aceleradora te da los créditos *y* la red. Es más rentable perseguir eso que perseguir el crédito solo.

### Palanca 4 — Capas gratuitas, y cuáles son trampa

| Servicio | Capa gratuita | ¿Sirve en producción? |
|---|---|---|
| **Neon** (Postgres) | 0,5 GB por proyecto, se apaga sola sin uso y arranca al primer pedido | ✅ **Sí** para empezar |
| **Supabase** | 500 MB, 1 GB de archivos, 2 proyectos | ⚠️ **Ojo:** el proyecto **se pausa si nadie lo toca 7 días**. Para un cliente real, eso lo descarta |
| **Cloudflare** | DNS, proxy y certificados | ✅ Sí |
| **Let's Encrypt** | Certificados, incluido comodín | ✅ Sí |

Lo de Supabase es el ejemplo perfecto de por qué hay que leer la letra chica: si un cliente entra un lunes después de una semana tranquila, se encuentra la app caída.

### Palanca 5 — La mentalidad, que es gratis

Hay startups argentinas que llevan **más de cinco años creciendo y contratando sin levantar una sola ronda**. Autoinspector lo resume así:

> *"O generamos ganancia desde el día uno, o morimos."*

Validar rápido, vender antes de tener todo resuelto, y sostenerse con el flujo de caja.

**Nosotros todavía no estamos ahí, y conviene decirlo sin adornos.** Tenemos un **betatester**, no un cliente: alguien que nos prestó sus datos para ver si el producto sirve. Eso es valiosísimo —es validación real, no una encuesta— pero **no es facturación**.

Lo que significa para esta discusión: mientras no haya nadie pagando, **cada peso de infraestructura sale de nuestro bolsillo**. Por eso la respuesta correcta hoy no es mudarse a un servidor propio ni perseguir créditos de nube: es **quedarse en lo más barato que funcione** y poner la energía en convertir al betatester en cliente.

El primer cliente que paga cambia todo lo demás. Antes de eso, optimizar infraestructura es entretenimiento.

---

## 7. Recomendación, en orden

| # | Qué | Cuándo | Quién |
|---|---|---|---|
| 1 | **Verificar en qué plan de Vercel estamos.** Puede que ya estemos fuera de sus condiciones | Esta semana | Santi o Giuli |
| 2 | **Poner los repos en privado.** Un clic, resuelve la exposición pasada y futura | Esta semana | Los cuatro |
| 3 | **Averiguar Economía del Conocimiento + IDEP.** Es donde está la plata de verdad | Este mes | Alan o Lauti |
| 4 | **Decidir el dominio.** Es la marca y condiciona lo demás | Este mes | Los cuatro |
| 5 | **Evaluar Cloud Server local con subdominio por cliente** | **Cuando haya un cliente pagando**, no antes | Santi y Giuli |

**No mezclar la 2 con la 5.** La visibilidad de los repos es una decisión de hoy y de un clic. Mudarse de infraestructura es un proyecto de semanas y no tiene nada que ver con la exposición de datos.

**Y ojo con la 5: hoy no tenemos ningún cliente pagando.** Mudarse de infraestructura sin facturación es gastar tiempo en un problema que todavía no tenemos.

**No invertir el orden de la 3 y la 5.** Un mes de servidor son unos pocos miles de pesos. Un punto de contribuciones patronales, o un salario mínimo por 12 meses del programa INSERTAR, son órdenes de magnitud más.

---

## 8. Lo que decidimos que NO vamos a hacer

**No le vamos a avisar.** Alan y Lauti tienen el contacto con Augusto y van a tener las respuestas si el tema aparece.

Queda escrito acá para que conste que fue **una decisión que se tomó**, no algo que se olvidó.

---

## Fuentes

**Infraestructura y precios**

- [Railway — planes y precios](https://docs.railway.com/pricing/plans)
- [Vercel — plan Hobby y sus restricciones](https://vercel.com/docs/plans/hobby)
- [DonWeb — Cloud Servers en Argentina](https://donweb.com/es-ar/hosting-cloud-servers-vps)
- [Comparativa de hosting en Argentina 2026](https://hostinglab360.com.ar/)
- [Hetzner Cloud CX22 — precios 2026](https://vpsfor.dev/posts/hetzner-cx22-pricing-2026/)
- [Node.js en hosting compartido y sus límites](https://www.youstable.com/es/blog/host-node-js-on-shared-hosting/)
- [Coolify vs Dokploy (2026)](https://contabo.com/blog/blog-coolify-vs-dokploy-comparison/)

**Subdominios y certificados**

- [TLS comodín en sistemas multi-cliente](https://www.skeptrune.com/posts/wildcard-tls-for-multi-tenant-systems/)
- [Let's Encrypt — tipos de desafío](https://letsencrypt.org/docs/challenge-types/)
- [Dominios y subdominios en SaaS multi-cliente](https://www.dchost.com/blog/en/custom-domains-and-subdomains-for-multi-tenant-saas/)

**Financiamiento y beneficios**

- [Régimen de Promoción de la Economía del Conocimiento](https://www.argentina.gob.ar/economia/igualdadygenero/regimen-de-promocion-de-la-economia-del-conocimiento)
- [Cómo acceder a los beneficios del régimen](https://www.argentina.gob.ar/servicio/acceder-los-beneficios-del-regimen-de-promocion-de-la-economia-del-conocimiento)
- [IDEP — Economía del Conocimiento en Tucumán](https://idep.gov.ar/economias-del-conocimiento/)
- [IDEP — Programa INSERTAR Tucumán](https://idep.gov.ar/programa-insertar-tucuman/)
- [IDEP — Créditos para inversión productiva](https://idep.gov.ar/noticias/creditos-para-inversion-productiva/)
- [Comparativa de programas de créditos cloud 2026](https://securityboulevard.com/2026/06/aws-activate-vs-microsoft-for-startups-vs-google-for-startups-2026-who-each-one-is-actually-for/)
- [Capas gratuitas de bases de datos 2026](https://agentdeals.dev/database-free-tier-comparison-2026)
- [Forbes — startups argentinas que crecen sin capital](https://www.forbesargentina.com/negocios/crecer-capital-fenomeno-startups-argentinas-prueban-todo-lo-valioso-necesita-inversor-n73320)

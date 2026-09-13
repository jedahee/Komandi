# 🥙 Komandi

> La comanda de tu negocio, en el móvil que ya tienes.

Este repositorio contiene la **web de presentación de Komandi**: la landing y
la **demo gratuita** de la app. Es la página pública del producto, publicada en
**<https://jedahee.github.io/Komandi/>**.

---

## ¿Qué es Komandi?

Komandi es una **app de comandas para comida para llevar** que funciona en el
móvil, la tablet o el PC que ya tienes: nada que instalar, nada que comprar.

- **El camarero toma el pedido en su móvil.** Carta por categorías con un
  asistente paso a paso que calcula el total al momento, sin sumar de cabeza.
- **La cocina lo ve al instante.** La comanda sale en vivo en otro dispositivo:
  por hacer, en marcha, hecha, con sonido de aviso.
- **Gestión completa del negocio.** Cobro por comensal, propinas, envío a
  domicilio con repartos, estadísticas por día con exportación a CSV y cierre
  de día.
- **Hecha para comercios de barrio.** Kebab, hamburgueserías, pizzerías,
  pollos, bocadillerías, tacos, food trucks… y cualquier local que tome el
  pedido en el mostrador y lo pase a cocina.

**Sin terminales. Sin comisiones por pedido. Sin permanencia. En marcha en 10 minutos.**

---

## Lo que ofrece esta web

- **Explica el producto**: cómo funciona, qué incluye, precios, comparativa y
  preguntas frecuentes.
- **Incluye una demo de la app de verdad**, con un menú de ejemplo, gratuita,
  sin registro, sin PIN y sin caducidad.
- **Se comparte bien**: metadatos Open Graph, Twitter y JSON-LD preparados para
  que enlaces y redes sociales muestren una previsualización correcta.

---

## 🚀 Probar la demo

La demo es **Komandi real con un menú de ejemplo**: toma un pedido en la carta
y mira cómo llega a la cocina al momento.

- Desde la web: botón **«Probar gratis»**.
- Enlace directo: [`demo/index.html`](demo/index.html)

> La demo nunca pide PIN y no debe aparecer en buscadores: `robots.txt`
> excluye `/demo/` y su HTML lleva `noindex`.

---

## 📸 Así se ve

| | | |
|:-:|:-:|:-:|
| **Carta por categorías**<br>![Carta por categorías](assets/capturas/01-carta.webp) | **Asistente de pedido**<br>![Asistente de pedido](assets/capturas/02-wizard.webp) | **Resumen con total**<br>![Resumen con total](assets/capturas/03-resumen.webp) |
| **Comanda en vivo en cocina**<br>![Cocina con comandas en vivo](assets/capturas/04-cocina.webp) | **Editar precios desde el móvil**<br>![Edición de precios](assets/capturas/05-admin.webp) | **Acceso protegido por PIN**<br>![Pantalla de PIN](assets/capturas/06-pin.webp) |

---

## 💶 Planes

| | 📅 Mensual | 🗓 Anual | 🛠 A medida |
|:-:|:-:|:-:|:-:|
| **Precio** | **14,99 €/mes** | **149,99 €/año** | Presupuesto aparte |
| **Alta** | 29,99 € (una vez) | ✅ Incluida | — |
| **Permanencia** | Sin permanencia | Sin permanencia | — |
| **Extra** | Primer mes gratis | 12 meses al precio de 10 | Calculadora de presupuesto en la web |

Todos los planes incluyen la **app completa** (carta, asistente de pedido,
cocina en vivo, cobro por comensal, propinas, envíos a domicilio, estadísticas
con CSV y cierre de día), protección por PIN, configuración en colaboración
contigo, gestión de dispositivos y soporte por email e Instagram de
**10:00 a 20:00**.

> Sin comisión por pedido. Sin contrato. Primer mes gratis.

---

## 📬 Contacto

- Email: **komandiapp@gmail.com**
- Instagram: **@komandiapp** (<https://www.instagram.com/komandiapp>)
- Horario de soporte: **10:00 a 20:00**

---

## 🛠 Repositorio: detalles técnicos

La web es **estática, sin frameworks** y se sirve desde GitHub Pages:

- `index.html` · `styles.css` · `app.js` — la landing.
- `sw.js` · `manifest.webmanifest` — PWA (network-first con soporte offline).
- `assets/` — logo, capturas en `webp`, vídeo de demostración e imagen
  Open Graph `og-1200x630.jpg`.
- `demo/index.html` + `build-demo.js` — la demo de la app en un solo archivo
  (se regenera con `node build-demo.js` a partir del código de la app).
- SEO: canonical, Open Graph/Twitter, JSON-LD (`WebSite`, `Organization`,
  `SoftwareApplication`, `Product` y `FAQPage`), `robots.txt` y `sitemap.xml`.

**Despliegue:** cualquier `git push` a `main` publica la nueva versión en
<https://jedahee.github.io/Komandi/> automáticamente.

---

## 📄 Licencia

Uso protegido © 2026 jedahee (Komandi). Todos los derechos reservados.

Puedes **ver** este repositorio y **contribuir** (issues y pull requests). **No
está permitido copiar, republicar, redistribuir, revender ni reutilizar el
código o los recursos** (diseño, capturas, vídeo, marca, textos) fuera de
Komandi. Para usarlo en tu negocio, el único canal es **contratar el servicio**:
`komandiapp@gmail.com` · `@komandiapp`.

Términos completos en [`LICENSE`](LICENSE).
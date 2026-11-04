# Sistema visual (DESIGN.md)

Registro del sistema construido. El razonamiento y las alternativas están en
`docs/DIRECCION-ARTISTICA.md`; esto es el contrato para futuras ediciones.

## Mundo

Una página blanca, una sola columna y una escena mínima: dos conejos ilustrados
que se miran, cada uno con tres globos, y un cielo de estrellas de papel. El título
«Niño / Niña» aparece como una pareja de palabras escritas a mano, unidas por la
conjunción «o». Debajo, la invitación, los datos del evento y la votación.

El mundo no es un carrusel ni una tarjeta: es una lámina de celebración. La
ligereza se consigue con aire, escala y movimiento lento, no con capas, sombras
fuertes ni decoración acumulada.

## Tokens

Definidos en `src/index.css` dentro de `@theme` (Tailwind v4). Nombres y valores
son la fuente de verdad; no se usan hex sueltos en los componentes.

| Token | Valor | Rol |
|---|---|---|
| `--color-paper` | `#FFFFFF` | Fondo único de página |
| `--color-ink` | `#2B2E2A` | Texto de sistema, foco, contraste máximo |
| `--color-ink-soft` | `#5B6057` | Texto secundario del sistema |
| `--color-rose` | `#E8928A` | Rosa pastel de la paleta y los materiales |
| `--color-blue` | `#A9BFE8` | Azul pastel de la paleta y los materiales |
| `--color-rose-deep` | `#B9645B` | Nombres y pregunta del voto (4,17:1) |
| `--color-blue-deep` | `#5A72A8` | Borde del campo y texto secundario (4,77:1) |
| `--color-balloon-pink` | `#F0A0A8` | Globo rosa principal |
| `--color-balloon-pink-soft` | `#F6BCC1` | Globo rosa claro |
| `--color-balloon-blue` | `#A8C0E8` | Globo azul principal |
| `--color-balloon-blue-soft` | `#BFD2F2` | Globo azul claro |
| `--color-star-pink` | `#F6C9CC` | Estrellas rosadas |
| `--color-star-blue` | `#C9D6F0` | Estrellas azules y sombras de los conejos |
| `--color-cloud` | `#E4EBF7` | Nubes azules de fondo |
| `--color-cloud-rose` | `#F7E8E9` | Nubes rosadas de fondo |
| `--color-pink` | `#F5B3AA` | Botón «Niña» |
| `--color-sky` | `#A9BFE8` | Botón «Niño» |
| `--color-pink-ink` | `#7A2E28` | Etiqueta de «Niña» sobre rosa (5,3:1) |
| `--color-sky-ink` | `#334B7A` | Etiqueta de «Niño» sobre azul (4,7:1) |
| `--color-gold` | `#F2C46D` | Filetes y favicon. Único metal |
| `--color-gold-deep` | `#B8862F` | La «o» entre Niño y Niña (3,2:1) |
| `--color-beige` | `#E7D9C3` | Muestra del código de vestimenta; nunca en texto |
| `--color-blue-ink` | `#4F679C` | Invitación, datos, etiquetas y ayudas (5,6:1) |
| `--color-rose-ink` | `#B25A51` | Errores y texto funcional rosa (4,7:1) |
| `--color-blue-display` | `#7190CF` | «Niño» a 58 px (3,1:1) |
| `--color-rose-display` | `#D3786E` | «Niña» a 58 px (3,1:1) |

El foco no usa dorado: `#F2C46D` no alcanza 3:1 sobre blanco. El anillo de foco
es tinta `#2B2E2A`; el oro queda en los filetes y el favicon.

Proporción buscada: blanco como campo casi total; rosa y azul en los materiales,
el título, los datos y las opciones; el texto funcional en sus variantes
profundas; dorado por debajo del 1 % del área. No hay campos de página rosas ni
azules, ni dos mitades.

## Tipografía

| Voz | Fuente | Uso | Reglas |
|---|---|---|---|
| Display | **Sacramento** 400 | «Niño», «Niña», «Danna y Oscar», «Yo digo que será:» | Sólo ≥ 24 px. Interletra normal. Nunca en textos funcionales ni en versalitas. |
| Texto | **Montserrat** 400 | Invitación, datos del evento, ayuda, estados | `letter-spacing: 0.04em`. 14-18 px. |
| Texto medio | **Montserrat** 500 | Botones, fechas y nombres de opción | `letter-spacing: 0.04em`. |

Escala:

- «Niño» / «Niña»: 58 px, interlineado 0.82, centrados; la «o» de 40 px en
  `gold-deep` se posiciona de forma absoluta entre las dos, 40 px a la derecha,
  centrada en el hueco, en `blue-display` / `rose-display` (3,1:1).
- Nombres de los padres: 40 px, Sacramento, `rose-deep`.
- Pregunta del voto: 27 px, Sacramento, `rose-deep`.
- Texto de invitación: 18 px, Montserrat 400, `blue-ink`, interlineado 1.65.
- Datos del evento: fecha 17 px Montserrat 500 en `blue-ink`; hora 15 px en
  `blue-deep`; lugar 16 px 500 en `blue-ink`; dirección 14,5 px en `blue-deep`,
  enlazada a Google Maps.
- Etiquetas, ayudas y avisos: 12-13 px, Montserrat 400/500, `blue-deep` o
  `blue-ink`. Mínimo 12 px.

Las fuentes se cargan desde Google Fonts en `index.html` (Sacramento y Montserrat
400/500). No se autoalojan ni se instalan como paquetes.

## Composición

- Una sola columna centrada, `max-w-[420px]`, con 24 px de margen lateral.
- `min-h-[100svh]`; el contenido puede crecer y desplazarse en vertical.
- Orden: conejos → título → invitación → padres → filete dorado → datos → voto →
  cierre.
- Los conejos forman una pareja con `justify-between` y flanquean el título: los
  cuerpos quedan a los lados y las palabras en el hueco central.
- El título es un bloque de dos líneas centrado: «Niño» arriba y «Niña» abajo,
  separadas 18 px. La «o» de 40 px en `gold-deep` va posicionada de forma absoluta
  entre ambas, 40 px a la derecha del centro y centrada en el hueco; no altera la
  altura ni la posición de las palabras.
- El bloque sube 130 px sobre la fila de conejos y termina a la altura de las
  patas, no debajo de ellas.
- El filete antes de los datos es una línea de 1 px con un punto central dorado.
- Los datos se agrupan por proximidad, sin etiquetas: fecha y hora juntas, lugar
  y dirección juntos, y el código de vestimenta al final. La fecha lleva el peso;
  la dirección es la línea menor y es el enlace a Google Maps.
- La votación vive al final; el formulario y la confirmación no son tarjetas
  anidadas. La única superficie con borde es la tarjeta de confirmación.
- La página cierra con «Con cariño, Danna y Oscar» en Sacramento 30 px
  `rose-deep`.

## Ilustración y assets

- `public/assets/conejo-izq.png` y `public/assets/conejo-der.png`: recortes
  transparentes de 600 × 1200 px, generados desde los SVG originales con
  `viewBox` `20 75 320 620` (izquierdo) y `460 65 320 620` (derecho). Los SVG
  fuente viven en `docs/assets/` y no se publican.
- Cada conejo trae tres globos e hilos curvos. La proporción se conserva con
  `width: 100%`, `height: auto` y un ancho máximo de 140 px. La sombra de contacto
  es un SVG radial aparte, bajo las patas, no parte del PNG.
- Las estrellas son SVG de cinco puntas y destellos, 6-16 px, en dos tonos y con
  opacidad 0.46-0.74. Son 76 en dos capas y se distribuyen en los márgenes de una
  banda de 640 px para no pisar la columna de lectura.
- Encima del cielo fijo caen 20 estrellas de 4-7,5 px, muy lentas y con opacidad
  0.35-0.65; el desplazamiento es de 112vh, cada una en su franja horizontal y
  con un desfase propio.
- Cuatro nubes SVG de 180-250 px, con tres siluetas distintas, en `cloud` y
  `cloud-rose`, opacidad 0.3-0.55 y deriva lateral de ±36 px. Viven detrás de la
  columna y nunca reciben punteros.
- El favicon es una marca mínima: papel blanco, anillo dorado, punto central.

## Movimiento

| Momento | Comportamiento |
|---|---|
| Globos y conejos | `translateY` de ±4 px, 4-6 s, `ease-in-out`, desfases distintos por lado. Sólo transform. |
| Estrellas | Opacidad y escala 1 → 0.88, 4-6 s, desfases repartidos; nunca parpadeo rápido. |
| Lluvia de estrellas | 20 estrellas de 4-7,5 px caen 112vh en 18-28 s, con deriva lateral de ±14 px y opacidad 0.35-0.65. |
| Nubes | Deriva lateral de ±36 px y −8 px vertical en 68-84 s, alternando; opacidad fija. |
| Entrada | Las estrellas aparecen en 1,6 s; los conejos se asientan (opacidad 0 → 1, `y` 26 → 0, escala 0.97 → 1) y el título sube 18 px y crece de 0,98 a 1 en 0,95 s. |
| Scroll | Parallax corto con Motion: conejos −48 px, título −20 px y estrellas +56 px entre 0 y 600-700 px de scroll. Sólo `transform`. |
| Selección de voto | Escala 1 → 1.05 y elevación de 2 px con muelle; anillo dorado, check y el globo que se infla y estalla. |
| Confeti | 20 partículas desde el globo pulsado, 0.8-1.1 s, en rosa/azul, destello y oro; no bloquea la lectura. |
| Formulario / confirmación | Aparición suave de 0.45 s; el estado cambia sin recargar. |
| Revelación | La cuenta atrás se actualiza cada segundo sin animación; al confirmar el servidor, el título y la lista entran con 0.7 s de opacidad y `y`. |

Con `prefers-reduced-motion: reduce`: no hay flotación, parpadeo, lluvia, confeti,
parallax ni entradas animadas; las nubes quedan quietas, el globo no estalla y el
contenido está visible desde el inicio. La composición sigue completa.

## Componentes

- **Pareja de conejos**: dos imágenes decorativas `aria-hidden`, con sombra de
  contacto en degradado radial bajo las patas y flotación independiente.
- **Título Niño / Niña**: bloque de dos líneas centrado, con las palabras
  Sacramento en su color y la conjunción «o» de 40 px en `gold-deep` entre ambas,
  40 px a la derecha, sin moverlas. El `h1` real es `sr-only` y describe la
  invitación completa.
- **Texto de invitación**: cuatro líneas cortas, Montserrat 18 px `blue-ink`.
- **Nombres**: Sacramento 40 px `rose-deep`.
- **Datos del evento**: fecha y lugar en Montserrat 500 `blue-ink`; hora y
  dirección en `blue-deep`. La dirección es el enlace a Google Maps. Todos salen
  de `src/config/event.ts`.
- **Código de vestimenta**: etiqueta de 12 px en versalitas `blue-deep`, dos
  muestras de 14 px (papel y `beige`) y el valor en `blue-ink` 15 px 500.
- **Botones de predicción**: píldoras de hasta 146 × 50 px, radio 999 px,
  etiqueta Montserrat 500 14,5 px en `pink-ink` / `sky-ink` sobre el relleno pastel
  («Niña» `#F5B3AA`; «Niño» `#A9BFE8`), con un globo de 15 × 20 px del mismo tono
  en el borde izquierdo, fuera del flujo para que la etiqueta quede centrada. Al
  elegir, el globo se infla y estalla en 0,32 s: flash blanco, confeti desde su
  posición y la píldora suma un check a la derecha, un anillo `gold-deep` de 2 px
  con 2 px de aire y la elevación de 2 px. Sin borde ni brillo interior. El blanco
  sólo volvería si se oscurece el relleno.
- **Formulario**: debajo del título de la votación, «Elige una y escribe tu
  nombre»; al elegir, «Vas a votar por Niña/Niño» en `blue-deep` 13 px. Etiqueta
  «Tu nombre» en `blue-ink` 13 px, campo redondeado de 48 px con borde
  `rose-deep` / `blue-deep` (3:1), ayuda de 12 px en `blue-deep` y botón de 48 px
  «Confirmar Niña» / «Confirmar Niño».
- **Confirmación**: tarjeta de radio 16 px con borde del color elegido, check,
  texto de gracias y aviso de un voto por navegador. Sólo en desarrollo aparece
  «Reiniciar prueba», que borra el voto de ese navegador para repetir los estados.
- **Resultados**: sólo cifras agregadas, dos barras y porcentajes; nunca nombres
  en los resultados agregados. Cero votos muestra un estado vacío, no datos de
  ejemplo. Los nombres tienen su propia sección de revelación.
- **Revelación**: al final de la página. Antes de la hora, candado dorado, título
  Sacramento 28 px `rose-deep`, la fecha `domingo 15 de noviembre · 3:00 p. m.
  (Colombia)` y una cuenta atrás en `blue-deep` 12,5 px; no se muestra ningún
  nombre. Después, «Quién votó qué», subtítulo con el total y la frase «en orden
  alfabético», y una tarjeta blanca con una fila por invitado: nombre en
  `blue-ink` 15 px y píldora «Niña» / «Niño» en los tonos de la votación. La
  vista de prueba local lleva un aviso dorado «Vista de prueba» y, si no hay
  votos reales, seis nombres de ejemplo claramente marcados.
- **Error**: mensaje de indisponibilidad y botón «Reintentar» de 44 px; no
  inventa resultados.

## Estados de la votación

`loading` → `open` → `selected` → `submitting` → `recorded`; `closed` cuando la
votación está cerrada; `error` como estado técnico de indisponibilidad. La
recuperación al recargar consulta `GET /api/vote-status` y muestra `recorded` con
`already: true` si este navegador ya votó. Cada estado tiene texto propio y se
anuncia por `aria-live`; ninguno depende sólo del color.

## Superficies y foco

- Selección de texto: `star-pink` con tinta.
- Foco: contorno de tinta de 2 px, separación 3 px. El dorado no se usa como
  foco porque sólo alcanza 1,63:1 sobre blanco.
- Scrollbar: 10 px, pulgar `star-blue` con borde blanco.
- `color-scheme: light` fijo.
- Sin gradientes como recurso gráfico; la sombra de los conejos es un degradado
  radial de contacto, no un fondo. Sin glassmorphism ni sombras de tarjeta salvo
  la elevación puntual del botón elegido.

## Accesibilidad

- Enlace de salto a la votación.
- Foco visible en todos los controles; el campo tiene etiqueta, ayuda y
  `aria-invalid` cuando falla. Al registrar, el foco pasa a la confirmación.
- Arte decorativo (`conejos`, estrellas, filete, confeti) con
  `aria-hidden`.
- La confirmación, el cierre y los errores se anuncian por `role="status"` /
  `role="alert"`; los resultados se suman al anuncio.
- La revelación usa `role="status"` para anunciar el cambio de bloqueada a
  disponible; los nombres son una lista semántica y la cuenta atrás no se anuncia
  cada segundo. Antes de la hora no hay nombres en el DOM.
- El contenido se entiende sin animaciones y sin WebGL.
- **Contraste medido:** invitación y datos principales, 5,6:1; datos
  secundarios, ayuda y avisos, 4,77:1; títulos grandes, 3,1:1; la «o» de oro,
  3,2:1 (texto grande); etiquetas del formulario, 5,6:1; foco, 13,75:1; etiquetas
  de las píldoras, 5,3:1 (rosa) y 4,7:1 (azul). El pastel original
  (`#A9BFE8` / `#E8928A`) se conserva en globos, estrellas y rellenos de botón, no
  en el texto funcional.

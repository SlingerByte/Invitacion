# Dirección artística

Documento de trabajo del equipo de diseño. Explica **por qué** la invitación se ve
como se ve, qué alternativas se evaluaron y qué se descartó. Si algo del código
contradice este documento, el error está en el código.

La dirección completa (mundo visual, paleta, tipografía, composición, movimiento)
se fija en `docs/DESIGN.md`; aquí queda el razonamiento y la decisión.

---

## 1. El problema de diseño

Una invitación de revelación de género tiene tres trampas conocidas:

1. **La mitad rosa / mitad azul.** Convierte la página en un formulario de dos
   casillas y anticipa la respuesta.
2. **La tarjeta con animaciones encima.** Fondo crema, serif alta, pétalos que
   caen: lo que produce cualquier modelo cuando se le pide «elegante y tierno».
3. **El espectáculo WebGL.** Un globo que explota, confeti infinito, cero
   contenido.

El encargo actual pide otra cosa: una lámina pastel, tierna y directa, que se abra
desde WhatsApp en un teléfono, se entienda en menos de un minuto y permita dejar
una predicción con el nombre. La regla de oro sigue siendo la misma: **el secreto
se mantiene entero**. Cada decisión visual debe funcionar igual para las dos
respuestas.

---

## 2. La dirección elegida: *Dos conejos, tres globos*

> Una página blanca. Dos conejos ilustrados se miran, cada uno con tres globos.
> Entre ellos, «Niño» y «Niña» escritos a mano, unidos por la conjunción «o».
> Debajo, la invitación, los datos y la votación. Las estrellas acompañan en los
> márgenes.

**Por qué funciona.** El conejo es un símbolo de ternura que no codifica género.
Los dos conejos son simétricos: uno con cinta rosa y otro con cinta azul, pero
ambos con el mismo gesto, el mismo tamaño y la misma importancia. La página no se
parte en dos mitades: el blanco manda y los dos tonos aparecen juntos en el
título, en los globos y en las opciones. El secreto se mantiene porque el diseño
trata a «Niño» y «Niña» exactamente igual.

**Riesgo honesto.** Los globos y el rosa/celeste son el cliché más previsible de
la categoría. Se controla con cuatro decisiones: una sola columna, blanco en el
92 % de la superficie, cero degradados y una ilustración de línea suave en lugar
de emojis o stock. La estrellita es el único motivo repetido; no hay corazones,
confeti permanente ni lluvia de nada.

**Lo que el objeto no hace.** No revela nada, no cambia de color y no reacciona al
voto. Los conejos son escenografía; el contenido y la votación son el actor.

---

## 3. La dirección anterior: *El carrusel de papel* (archivada)

La versión previa construyó un carrusel de sobremesa en 3D, con papel, latón y luz
de amanecer, y una portada que se descubría al arrastrar. Fue una exploración
valiosa: fijó la disciplina de geometría exacta, el respaldo en papel y el
cuidado de la luz. Pero el encargo cambió: la nueva dirección pide una lámina
pastel, no un objeto 3D; y un carrusel de 321 kB de Three.js no se justifica para
una lectura de un minuto desde WhatsApp.

El código de la escena y las dependencias de Three se eliminaron al cerrar esta
dirección: no quedan archivos muertos en el repositorio. La exploración queda
documentada aquí, no en `src/`.

---

## 4. Decisiones que sostienen la dirección

1. **Una sola columna de 420 px.** La invitación se lee como una tarjeta vertical,
   no como una landing. En escritorio queda aire a los lados; en móvil ocupa el
   ancho útil.
2. **Blanco, no crema.** El fondo blanco hace que los pasteles respiren y evita el
   aspecto de «tarjeta de baby shower» sobre papel viejo.
3. **Sacramento sólo en la voz emocional.** «Niño», «Niña», los nombres y la
   pregunta del voto. El resto es Montserrat 400/500 con 0.04em: legible y
   contemporáneo.
4. **Centro con un guiño.** «Niño» y «Niña» comparten el eje central y quedan a
   18 px; la «o» se asoma entre ambas, 40 px a la derecha, sin moverlas. El bloque
   sube 130 px sobre los conejos.
5. **Un solo metal.** La «o» que se asoma entre las palabras y el filete de los
   datos son dorados. No hay más dorado en la página.
6. **Estrellas en los márgenes.** 76 estrellas de 6-16 px en dos capas, repartidas
   en una banda de 640 px, con opacidad 0.46-0.74. No compiten con el texto.
7. **Movimiento lento y con propósito.** Los globos flotan ±4 px; las estrellas
   respiran; la entrada es una sola coreografía. El confeti sólo aparece al
   elegir y dura menos de un segundo.
8. **La votación es el final, no un añadido.** Botones grandes, nombre, confirmar,
   gracias y resultados. Sin cuenta, sin login, sin segundo formulario.

---

## 5. Alternativas evaluadas con el nuevo encargo

| Alternativa | Veredicto | Qué se quedó |
|---|---|---|
| **Carrusel 3D** (dirección anterior) | Descartada para esta pieza: pesa, compite con el texto y no es lo que pide el brief | La disciplina de proporciones y el respaldo en papel |
| **Arco de globos único** | Descartada: un solo arco obliga a elegir un color protagonista y roza la pista | La idea de los globos como material, no como fondo |
| **Fotografía de bebé / stock** | Descartada: no hay fotografía propia y el stock rompe la intimidad | Nada; se prohíbe |
| **Tarjeta centrada con script y sobre** | Descartada: es la respuesta por defecto de la categoría | La calidez de la script, limitada a cuatro palabras |
| **Cielo de estrellas a pantalla completa** | Descartada: ruido y peor rendimiento | Las estrellas pequeñas en los márgenes |
| **Dos columnas rosa/azul** | Prohibida: parte la página y anticipa la respuesta | Nada |

La dirección elegida combina lo mejor de las alternativas sin copiar su forma:
la ternura del arco de globos, la calidez de la script y la calma del cielo, en
una sola columna blanca.

---

## 6. Sistema visual

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `paper` | `#FFFFFF` | Fondo |
| `ink` | `#2B2E2A` | Texto de sistema y foco |
| `rose` | `#E8928A` | «Niña», nombres, pregunta |
| `blue` | `#A9BFE8` | «Niño», invitación, datos |
| `rose-deep` | `#B9645B` | Errores y texto funcional |
| `blue-deep` | `#6079AD` | Ayudas y estados |
| `balloon-pink` | `#F0A0A8` | Globo rosa |
| `balloon-pink-soft` | `#F6BCC1` | Globo rosa claro |
| `balloon-blue` | `#A8C0E8` | Globo azul |
| `balloon-blue-soft` | `#BFD2F2` | Globo azul claro |
| `star-pink` | `#F6C9CC` | Estrellas rosadas |
| `star-blue` | `#C9D6F0` | Estrellas azules y sombras |
| `pink` | `#F5B3AA` | Botón «Niña» |
| `sky` | `#A9BFE8` | Botón «Niño» |
| `gold` | `#F2C46D` | Filete |

No hay degradados. El rosa y el azul nunca son campos de página ni mitades; son
materiales del objeto, el título y las opciones.

### Tipografía

- **Sacramento** para «Niño», «Niña», «Danna y Oscar» y «Yo digo que será:». Nunca
  por debajo de 24 px ni en textos funcionales.
- **Montserrat 400** para la invitación y los datos; **500** para botones y
  fechas. Interletra 0.04em.
- El texto de invitación mide 18 px y vive en 320 px de ancho; los datos, 16 px.

### Composición

- Columna de 420 px como máximo, 24 px de margen, `min-h-100svh`.
- Conejos arriba, título solapado 16 px con su base, invitación, padres, filete,
  datos y votación.
- Nada de retícula de 12 columnas: la pieza es una sola lectura vertical.

### Movimiento

Una coreografía: entrada suave por bloques (0.85 s, 0.1 s de desfase), globos que
flotan ±4 px en 4-6 s, estrellas que respiran, selección con muelle y confeti
breve. Con `prefers-reduced-motion`, todo queda quieto y visible.

---

## 7. Accesibilidad como decisión de arte

- Los conejos, globos, estrellas, filete y confeti son decorativos y van
  `aria-hidden`. La información nunca depende de ellos.
- Enlace de salto a la votación.
- Foco de tinta de 2 px con 3 px de separación (el dorado no alcanza 3:1 sobre
  blanco y se reserva para los filetes).
- Formulario con etiqueta, ayuda, `aria-invalid` y errores con `role="alert"`.
- Confirmación y cambios de estado por `aria-live`; ningún estado se comunica sólo
  por color.
- La página funciona sin WebGL, sin animaciones y sin API.
- **Contraste:** la paleta literal del brief es muy clara. El arte conserva sus
  hex; el texto funcional usa variantes que pasan AA (5,6:1 y 4,77:1), el título
  grande sube a 3,1:1 y las etiquetas de las píldoras van en un tono profundo de
  su propia familia sobre el relleno pastel.

---

## 8. Lo que se evita deliberadamente

| Descartado | Motivo |
|---|---|
| Gradiente rosa→azul | Anticipa la respuesta y es el cliché de la categoría |
| Mitad rosa / mitad azul | Convierte la invitación en un formulario |
| Glassmorphism y tarjetas translúcidas | Compten con la lámina y ensucian el blanco |
| Tarjetas anidadas | La única superficie con borde es la confirmación |
| Emojis como iconos | Nunca |
| Lluvia de corazones o confeti infinito | Ruido; el confeti sólo celebra la elección |
| Música automática | Sólo si se pide; siempre opcional |
| Script en textos funcionales | Sacramento sólo en la voz emocional, ≥ 24 px |

---

## 9. Contrato de dirección (copia canónica)

Esta sección es la fuente de verdad del contrato de dirección. **Si hay
divergencia con cualquier copia, manda este archivo.**

**THESIS** — Una lámina blanca de celebración: dos conejos ilustrados se miran con
tres globos cada uno, «Niño» y «Niña» escritos a mano se equilibran alrededor de
se unen con la «o», y debajo se leen la invitación, los datos y la votación. Rechaza
la página partida en rosa y azul y rechaza la tarjeta centrada con serif alta
sobre crema.

**OWN-WORLD** — Blanco `#FFFFFF` como campo; tinta `#2B2E2A` para el sistema;
rosa `#E8928A` y azul `#A9BFE8` en globos, estrellas y rellenos de botón; el
título usa `#D3786E` / `#7190CF` y el texto funcional `#B25A51` / `#4F679C`;
globos `#F0A0A8`, `#F6BCC1`, `#A8C0E8`, `#BFD2F2`; estrellas `#F6C9CC` y
`#C9D6F0`; dorado `#F2C46D` en el filete y oro de texto `#B8862F` en la «o»
(el foco es tinta).
Sacramento para la voz emocional y Montserrat 400/500 para todo lo demás, con
0.04em de interletra. Sin gradientes, sin glassmorphism y sin más sombras que la
elipse de los conejos y la elevación del botón elegido.

**STORY** — El invitado abre desde WhatsApp, ve a los conejos y entiende que hay
una celebración y un secreto. Lee la invitación, reconoce a Danna y Oscar, apunta
la fecha, el lugar y la hora, y deja su predicción con su nombre. Al volver,
recupera su voto; si la votación cerró, ve los resultados agregados. Nunca se
revela el género.

**FIRST VIEWPORT** — Móvil: los conejos ocupan la parte superior, el título
«Niño / Niña» se solapa suavemente con su base y la invitación empieza antes del
primer scroll. Una sola columna de 420 px como máximo, 24 px de margen, fondo
blanco, estrellas pequeñas en los márgenes. La acción principal (elegir y
confirmar) está al final de la lectura, no flotando.

**FORM** — Dirección propia del encargo: ilustración de conejos y globos,
tipografía script para la emoción, Montserrat para la información, una sola
columna, movimiento lento. El centro del título y la «o» que se asoma entre las dos
palabras son la firma.

**FINISH** — Un build sin revisión visual no está terminado: se comprueba a 390 px
y 1440 px, con movimiento reducido y sin API, y se documenta el resultado real.

### Herramientas de agente

Ninguna decisión de este documento depende de una herramienta concreta. La
dirección se sostiene con el contrato anterior y con `docs/DESIGN.md`.

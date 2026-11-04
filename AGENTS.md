# AGENTS.md

Instrucciones compartidas del proyecto. **Este archivo es la fuente principal para
cualquier agente** (Claude Code, Codex, Cursor, Copilot, OpenCode, Gemini, un
asistente humano). Si algo contradice este documento, manda este documento; si el
código contradice la documentación, el error está en el código.

El proyecto es agnóstico respecto del agente: las decisiones de producto, diseño,
arquitectura y convención viven en este archivo y en `docs/`. Las instalaciones de
herramientas no se versionan.

## 1. Qué es

Invitación web interactiva para una celebración de revelación de género. Se comparte
como **un único enlace público de WhatsApp**. El invitado, desde el móvil, ve a los
conejos con globos, lee la invitación, consulta la fecha, el lugar y la hora, y deja
una predicción con su nombre. Tono: ternura, emoción, expectativa, elegancia,
cercanía. El género del bebé nunca se revela ni se insinúa. No hay RSVP por
WhatsApp hasta que el organizador facilite un número real.

## 2. Documentos y su autoridad

| Documento | Qué manda |
|---|---|
| `AGENTS.md` | Convenciones, stack, comandos, reglas no negociables, estado del proyecto |
| `PRODUCT.md` | Verdad del producto: usuarios, propósito, restricciones, principios |
| `docs/DIRECCION-ARTISTICA.md` | Decisiones de arte: las 7 direcciones evaluadas, la elegida, alternativas, contrato de dirección |
| `docs/DESIGN.md` | Sistema visual construido: tokens, tipografía, espaciado, movimiento, componentes |
| `docs/ARQUITECTURA.md` | Capas, contrato de API, modelo de datos, seguridad, votos duplicados, despliegue |
| `README.md` | Puesta en marcha, configuración del evento, Neon, Vercel, procedimientos |
| `src/config/event.ts` | Los datos reales del evento (Danna y Oscar, 15/11/2026, Finca mis sueños DJ) |

## 3. Stack fijado (no actualizar a ciegas)

Node ≥ 20.19, npm. React 19.3.1 · Vite 7.3.7 · `@vitejs/plugin-react` 5.2.0 ·
TypeScript 5.9.3 · Tailwind CSS 4.3 (config CSS-first con `@theme`) · Motion 14.9
(`motion/react`) · Lucide React · `@neondatabase/serverless` 1.2 · clsx +
tailwind-merge. ESLint 10 + `typescript-eslint` 8, Prettier 3. Fuentes: Google
Fonts (Sacramento y Montserrat 400/500) en `index.html`; ya no se usa Fontsource.

Motivos de los topes — **verifícalos antes de subir versiones**:

- `typescript-eslint` 8 declara `typescript <6.1`; TypeScript 7 no es compatible.
- `@vitejs/plugin-react` 6 (para Vite 8) añade peers oxc/rolldown/babel; Vite 7 +
  plugin-react 5 es la combinación estable mientras no se evalúe la migración.

Backend: funciones serverless de Vercel en `api/` (Runtime Node, Web `Request`/
`Response`, sin framework) + Neon PostgreSQL vía HTTP. No hay servidor permanente.
No agregues dependencias sin una razón concreta; no dupliques funciones entre
librerías (Motion para la interfaz, nunca GSAP por defecto).

## 4. Comandos

```bash
npm install
npm run dev            # Vite + /api local contra Neon en :5173
npx vercel dev         # opcional, paridad con Vercel en :3000
npm run build          # tsc --noEmit && vite build
npm run typecheck
npm run lint
npm run format
npm run db:migrate     # aplica db/migrations/ contra Neon (requiere .env)
npm run poll:status | poll:results | poll:close | poll:open
```

`npm run dev` carga `.env` y sirve `/api/*` con las funciones reales; no se
inventan resultados. `npx vercel dev` queda para comprobar paridad antes de
desplegar.

## 5. Estructura

```
api/            funciones serverless (votación); _lib/ es interna
db/migrations/  SQL versionado (001 base, 002 nombre del invitado)
scripts/        administración de la votación, migraciones y tarjeta OG
shared/         tipos y validación compartidos frontend ↔ API
src/config/     event.ts — todos los datos editables del evento
src/sections/   Invitation.tsx (composición) y VoteSection.tsx (seis estados)
src/components/ StarField, SkyWeather, ConfettiBurst y VoteResults
src/hooks/      useVote.ts (estado de la votación)
src/lib/        voteApi.ts, cn y enlaces
src/index.css   tokens del sistema visual (@theme)
docs/           dirección de arte, sistema de diseño, arquitectura; docs/assets con los SVG fuente
public/assets/  conejos recortados en PNG
```

## 6. Convenciones de código

- TypeScript estricto, sin `any`; `exactOptionalPropertyTypes` y
  `noUncheckedIndexedAccess` activos.
- Importa con alias `@/` (src) y `@shared/` (shared). Importa tipos con
  `import type`.
- Configuración, presentación y lógica separadas: los textos y datos viven en
  `src/config/event.ts`; las secciones no contienen datos del evento.
- Estilos con Tailwind y **tokens** de `src/index.css`. No escribas hex sueltos en
  los componentes; usa `paper`, `ink`, `ink-soft`, `rose`, `blue`, `rose-deep`,
  `blue-deep`, `rose-ink`, `blue-ink`, `rose-display`, `blue-display`, `pink`,
  `sky`, `pink-ink`, `sky-ink`, `gold`, `gold-deep`.
- Utilidades de clase con `cn()`; nunca concatenes strings de clases a mano.
- Componentes con nombre exportado, props tipadas, sin `default` excepto en las
  páginas.
- Comentarios en español, sólo donde explican una decisión (no lo que el código ya
  dice).
- ESLint incluye reglas del React Compiler: no mutes props ni refs de otros
  componentes, no hagas `setState` sincrónico dentro de un efecto.
- Accesibilidad obligatoria: foco visible, etiquetas, `aria-live` para estados,
  arte decorativo `aria-hidden`, contenido comprensible sin animaciones.

## 7. Sistema visual (resumen operativo)

Mundo: una lámina blanca con dos conejos que se miran, tres globos cada uno, una
lluvia lenta de 20 estrellas, cuatro nubes apenas rosadas/azules y estrellas
pequeñas en los márgenes. Paleta: papel `#FFFFFF`; tinta `#2B2E2A`;
rosa `#E8928A` y azul `#A9BFE8` para los materiales y los rellenos pastel; el
texto funcional usa `rose-ink` `#B25A51` y `blue-ink` `#4F679C`, y el título
`rose-display` `#D3786E` / `blue-display` `#7190CF`; globos `#F0A0A8`, `#F6BCC1`,
`#A8C0E8`, `#BFD2F2`; estrellas `#F6C9CC` / `#C9D6F0`; dorado `#F2C46D` sólo en
filetes y favicon, y `gold-deep` `#B8862F` en la «o» (el foco es tinta).
Tipografía: Sacramento para «Niño», «Niña»,
«Danna y Oscar» y «Yo digo que será:» (≥24 px); Montserrat 400/500 para todo lo
demás, con 0.04em de interletra. Una sola columna centrada de 420 px como máximo,
24 px de margen. Una coreografía de entrada, globos flotando ±4 px, nubes que se
mecen, estrellas que respiran y caen, y el globo del voto que estalla en confeti;
easing `cubic-bezier(.22,1,.36,1)`. Detalle en `docs/DESIGN.md`.

Prohibido: gradientes como sustituto de dirección de arte, glassmorphism, tarjetas
anidadas, emojis como iconos, dibujos tipo boceto, animaciones sin propósito,
partir la página en rosa/azul, script en textos funcionales.

## 8. Reglas no negociables

1. No revelar ni insinuar el género del bebé.
2. No inventar información del evento, teléfonos, direcciones, coordenadas ni
   dominios. Los marcadores `[ASÍ]` se mantienen hasta que el organizador los
   sustituya.
3. `DATABASE_URL` y `VOTE_HASH_PEPPER` nunca en el frontend, nunca con prefijo
   `VITE_`, nunca en el repositorio, logs ni respuestas de API.
4. El navegador nunca escribe en Neon: sólo habla con `/api/*`.
5. Un voto por navegador se garantiza en Postgres en producción (índice `UNIQUE`,
   `ON CONFLICT DO NOTHING` y respuesta `409 already_voted`), no en React ni en
   `localStorage`. La única excepción es local y del servidor:
   `NODE_ENV=development` + `VOTE_DEV_MODE=true` + `VERCEL_ENV` distinto de
   production/preview. En producción el flag se ignora, el reset responde 404 y
   ningún parámetro del navegador puede habilitarla.
6. El nombre que escribe el invitado se guarda en `votes.guest_name` sólo para
   acompañar su predicción. **No es autenticación ni verificación de identidad**, no
   se usa para identificar a nadie y nunca se devuelve en resultados públicos. No se
   recogen teléfonos, correos ni IP; en la base sólo vive además el HMAC del
   identificador de la cookie.
7. La votación se cierra sólo desde el servidor (`npm run poll:close` o SQL). No
   existe endpoint ni botón público para eso.
8. Resultados: sólo cifras reales y agregadas. Cero = estado vacío, nunca datos de
   ejemplo ni nombres.
9. Sin despliegues, sin crear proyectos externos y sin publicar nada sin
   autorización explícita.
10. La página debe funcionar sin WebGL, con `prefers-reduced-motion` y sin API.
11. Prioridad móvil: 390 px primero, sin scroll horizontal, botones cómodos.

## 9. Verificación mínima antes de dar algo por terminado

```bash
npx tsc --noEmit && npx eslint . && npm run build
```

Además, según el cambio: mirar la invitación en móvil (390×844) y escritorio
(1440); comprobar que los conejos y los globos entran completos, que el título no
se solapa con el texto y que nada se sale del viewport. Probar los estados de la
votación (abierta, seleccionada, registrada, ya votada, cerrada, error), el nombre
vacío/corto, el nombre válido y el movimiento reducido. En desarrollo se usa
`VOTE_DEV_MODE` para repetir todos los estados; en producción se comprueba que el
duplicado responde 409 y que `/api/dev/reset` responde 404. Los cambios de backend
se prueban con `npm run dev` contra la base real y, antes de desplegar, se repiten
con `npx vercel dev` para comprobar paridad: navegador sin votar, navegador que ya
votó, dos solicitudes simultáneas, predicción inválida, nombre inválido, votación
cerrada, base inaccesible. No declares probado lo que sólo compiló.

## 10. Estado actual

- **Hecho:** infraestructura (Vite/TS/Tailwind/ESLint/Prettier), dirección de arte
  de conejos y globos, sistema visual, composición de una columna, datos reales del
  evento, votación con nombre y seis estados, resultados agregados, cierre desde el
  servidor, migraciones 001 y 002, API y herramienta de administración. Revisión
  visual hecha a 390 px y 1440 px, con movimiento reducido y con API simulada.
  Pasada de legibilidad (tokens de texto AA, foco en tinta, botones con etiqueta
  profunda sobre el pastel), tarjeta `public/og-image.png` con metadatos, dirección
  enlazada a Google Maps, código de vestimenta, confirmación que nombra la opción,
  timeout de envío y foco en la confirmación. Base de Neon creada, migraciones 001
  y 002 aplicadas y flujo de voto verificado contra Neon: nuevo, duplicado con
  `409` en producción, estado, resultados, nombre inválido, simultáneos, cerrada,
  reapertura y excepción local de pruebas con reset. Añadidos lluvia de estrellas,
  nubes, botones con globo que estalla en confeti y el modo de pruebas del servidor.
- **Pendiente:** revisar en navegador la pasada actual (título, cielo, botones de
  voto y estados), convertir `og:image` a URL absoluta al fijar el dominio y
  confirmar si se quiere RSVP por WhatsApp o un enlace de Maps verificado.
- **No hecho:** ningún despliegue.

Trabaja por etapas y no reescribas la dirección de arte sin una razón explícita del
usuario: los conejos, los globos, la paleta y las tipografías son decisiones
cerradas en `docs/DIRECCION-ARTISTICA.md`.

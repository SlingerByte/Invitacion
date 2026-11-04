# Arquitectura

Tres capas separadas, sin servidor permanente:

```
Navegador (React + Vite)
        │  fetch mismo origen, cookie HttpOnly
        ▼
Vercel Functions  /api/*   (Node, sin framework)
        │  @neondatabase/serverless (HTTP, sin pool que mantener)
        ▼
Neon PostgreSQL
```

El frontend **nunca** importa `@neondatabase/serverless` ni conoce `DATABASE_URL`.
Sólo habla con `/api/*`.

---

## 1. Versiones y compatibilidad

Se verificaron las peer dependencies reales antes de fijar el conjunto:

| Paquete | Versión | Razón |
|---|---|---|
| React / React DOM | 19.3.1 | Fijado por el proyecto |
| Vite | 7.3.7 | La 8 existe, pero `@vitejs/plugin-react@6` añade peers opcionales (oxc/rolldown/babel); 7 + plugin-react 5 es la combinación estable |
| @vitejs/plugin-react | 5.2.0 | Soporta Vite 7 y 8 |
| TypeScript | 5.9.3 | `typescript-eslint` 8 exige `<6.1`; TypeScript 7 todavía no es compatible |
| Tailwind CSS | 4.3.4 + `@tailwindcss/vite` | Configuración CSS-first vía `@theme`, sin `tailwind.config.js` |
| motion | 14.9.1 | Animación de interfaz y transiciones (import `motion/react`) |
| @neondatabase/serverless | 1.2.0 | Driver HTTP; `sql.query(texto, params)` (en v1 el genérico es `arrayMode`, no el tipo de fila) |
| ESLint | 10 + `typescript-eslint` 8.72 | Incluye las reglas del React Compiler |

Dependencias de desarrollo únicamente: ESLint, Prettier, TypeScript, tipos. No se
añadió ninguna librería de UI, de estado ni de formularios.

## 2. Estructura

```
api/                     funciones serverless (Vercel las publica como /api/*)
  votes.ts               POST  registrar predicción
  vote-status.ts         GET   estado del navegador actual
  results.ts             GET   resultados agregados
  reveal.ts              GET   nombres y predicciones después de la hora
  dev-reset.ts           POST  sólo desarrollo: reiniciar la prueba
  _lib/                  (Vercel ignora las carpetas con _)
    db.ts → poll.ts      cliente Neon, lectura de resultados y estado
    voter.ts             cookie, identificador, HMAC
    http.ts              JSON, errores, control de origen
db/migrations/001_init.sql
db/migrations/002_guest_name.sql
scripts/poll.ts          herramienta administrativa (status | results | close | open)
shared/vote-contract.ts  tipos, validación y normalización de nombre, frontend ↔ API
shared/reveal.ts         fecha, etiqueta y tipos de la revelación
src/
  config/event.ts        todos los datos editables del evento
  sections/Invitation.tsx  composición principal (conejos, título, datos, voto)
  sections/VoteSection.tsx máquina de estados visual de la votación
  sections/RevealSection.tsx bloqueo, vista previa y lista revelada
  components/            StarField, SkyWeather, ConfettiBurst y VoteResults
  hooks/useVote.ts       estados de la votación y llamadas a /api
  hooks/useReveal.ts     sondeo y hora de la revelación
  lib/voteApi.ts         cliente de /api/vote-status, /api/results, /api/reveal y /api/votes
  lib/                   utilidades (cn, enlaces)
  index.css              tokens del sistema visual (@theme)
public/assets/           conejos recortados en PNG (los SVG fuente viven en docs/assets)
```

## 3. Contrato de la API

Todas las respuestas son JSON, `Cache-Control: no-store`.

Las funciones de `api/` son ESM (`"type": "module"`); por eso todos sus imports
relativos llevan extensión `.js` (`./_lib/http.js`, `../shared/vote-contract.js`).
Vercel resuelve esas rutas al empaquetar las funciones; sin la extensión, Node
falla con `ERR_MODULE_NOT_FOUND` en producción aunque `tsc` pase.

### `GET /api/vote-status`

Asigna cookie si el navegador aún no la tiene.

```json
{ "hasVoted": false, "prediction": null, "pollOpen": true, "devMode": false }
```

`devMode` lo calcula el servidor; el navegador no puede activarlo.

### `POST /api/votes`

```json
{ "prediction": "girl", "name": "María José" }
```

El nombre se normaliza en `shared/vote-contract.ts` (NFC, espacios colapsados,
2-40 caracteres, letras/marcas/espacio/punto/apóstrofo/guion). No es
autenticación: sólo acompaña la predicción.

| Situación | HTTP | Cuerpo |
|---|---|---|
| Voto nuevo | 200 | `{ "status": "recorded", "prediction": "girl", "results": {...} }` |
| Ya había votado | 409 | `{ "status": "already_voted", "prediction": "boy", "results": {...} }` |
| Votación cerrada | 200 | `{ "status": "closed", "results": {...} }` |
| Predicción inválida | 400 | `{ "error": "invalid_prediction" }` |
| Nombre inválido | 400 | `{ "error": "invalid_name" }` |
| Cuerpo inválido | 400 | `{ "error": "invalid_body" }` |
| Origen ajeno | 403 | `{ "error": "forbidden_origin" }` |
| Faltan variables de entorno | 503 | `{ "error": "not_configured" }` |
| Fallo de base de datos | 500 | `{ "error": "server_error" }` (el detalle sólo va al log) |

«Ya había votado» devuelve **409**: la API rechaza el intento nuevo y el cuerpo
sigue siendo un `VoteOutcome` para que el frontend muestre la predicción guardada.
«Cerrada» devuelve **200** porque no es un error, es un estado de la interfaz.

### `POST /api/dev/reset`

Sólo existe en desarrollo local. Borra el voto del navegador actual y responde
`{ "reset": true }`. En producción responde **404**; no depende de nada que envíe
el cliente. Se usa desde el botón «Reiniciar prueba» de la confirmación.

### `GET /api/results`

```json
{ "girl": 12, "boy": 9, "total": 21, "updatedAt": "2026-11-04T18:22:31.004Z" }
```

Sólo agregados. La lista nominal vive en `/api/reveal`, no aquí.

### `GET /api/reveal`

La fecha se decide en el servidor con `shared/reveal.ts`:
`2026-11-15T15:00:00-05:00` (3:00 p. m. Colombia). Antes de esa hora:

```json
{
  "revealed": false,
  "preview": false,
  "revealAt": "2026-11-15T15:00:00-05:00",
  "revealLabel": "domingo 15 de noviembre de 2026 · 3:00 p. m.",
  "results": { "girl": 12, "boy": 9, "total": 21, "updatedAt": "..." },
  "entries": []
}
```

Después, `entries` trae `{ "name": "María José", "prediction": "girl" }` ordenado
por nombre. En desarrollo (`isDevMode`) se permite la vista previa antes de la
hora con `preview: true`; en producción y preview de Vercel siempre es `false`.
El endpoint no consulta ni devuelve nombres antes de la hora. No hay parámetro del
navegador que cambie la fecha.

## 4. Modelo de datos

```sql
poll_settings (id smallint PK = 1, is_open boolean, updated_at timestamptz)
votes (id uuid PK, voter_hash text UNIQUE, prediction text CHECK,
       guest_name text NULL CHECK (2-40), created_at timestamptz)
```

- `voter_hash` es `HMAC-SHA256(VOTE_HASH_PEPPER, id_aleatorio)` en hexadecimal. La
  base no guarda la cookie, así que un volcado de la tabla no permite identificar
  ni seguir a nadie, y cambiar el pepper invalida los hashes anteriores.
- `guest_name` es el nombre que escribe la persona. Es nullable para no invalidar
  las filas anteriores a la migración 002; la API exige nombre en todo voto nuevo.
  No es autenticación. Sólo se devuelve, junto a la predicción, en `/api/reveal`
  cuando el servidor confirma la hora de revelación.
- `votes_voter_hash_key` (índice único) es la garantía de un voto por navegador.
- `votes_prediction_allowed` limita los valores a `girl`/`boy` también en la base.
- `votes_guest_name_length` limita el nombre a 2-40 caracteres si está presente.
- `poll_settings_singleton` impide más de una fila de configuración.

Índices: `votes_prediction_idx` y `votes_created_at_idx` para los agregados.

## 5. Registro atómico

Una sola sentencia, sin ventana de carrera:

```sql
with settings as (select is_open from poll_settings where id = 1),
inserted as (
  insert into votes (voter_hash, prediction, guest_name)
  select $1, $2, $3 from settings where settings.is_open
  on conflict (voter_hash) do nothing
  returning prediction
)
select ... coalesce((select prediction from inserted),
                    (select prediction from votes where voter_hash = $1)) ...
```

Dos solicitudes simultáneas del mismo navegador: la primera inserta, la segunda
choca con el índice único, `DO NOTHING` la deja pasar y la consulta devuelve el
voto que ya existía. El resultado es `already_voted` con **409**, nunca un
duplicado ni un error 500. La transacción implícita de Postgres garantiza que el
estado de la votación y el `insert` se evalúan juntos.

**Excepción de desarrollo:** si `isDevMode()` es verdadero, el `ON CONFLICT` se
cambia por `DO UPDATE` y el mismo navegador puede repetir la prueba; la fila se
actualiza, no se duplica, y la respuesta es `recorded`. `isDevMode()` exige
`NODE_ENV=development` + `VOTE_DEV_MODE=true` + `VERCEL_ENV` distinto de
`production`/`preview`; ninguna de esas condiciones viene del navegador. En
producción el `DO UPDATE` no se usa y el 409 es obligatorio.

## 6. Cookie y limitaciones reales

La cookie `reveal_voter` es `HttpOnly`, `SameSite=Lax`, `Path=/`, un año, y
`Secure` cuando la petición llega por HTTPS. El identificador son 18 bytes
aleatorios en base64url. El navegador no puede leerla ni falsificarla desde
JavaScript, y la API siempre verifica en la base antes de aceptar un voto. En
producción la unicidad es obligatoria; la excepción local nunca se publica.

**Lo que esto no puede impedir:** un enlace público sin identificación personal no
puede garantizar un voto por familia. Alguien puede votar desde otro dispositivo,
usar una ventana privada o borrar las cookies. La solución evita duplicados en el
uso normal, que es el objetivo declarado, sin rastreo invasivo. No se guardan
teléfonos, correos ni direcciones IP. El único dato personal es el nombre que la
persona escribe voluntariamente para acompañar su predicción; permanece oculto
hasta la revelación programada del 15/11/2026 a las 3:00 p. m. Colombia y entonces
se muestra junto a su predicción. No se usa para identificar ni autenticar a nadie.

## 7. Cerrar la votación

Sólo desde el servidor, nunca desde la interfaz:

```bash
npm run poll:close     # update poll_settings set is_open = false
npm run poll:open
npm run poll:status
npm run poll:results
```

`scripts/poll.ts` se conecta con `DATABASE_URL` desde tu máquina. La operación
equivalente en el SQL Editor de Neon:

```sql
update poll_settings set is_open = false where id = 1;
```

No existe ningún endpoint que cambie `is_open`. Si en el futuro se quisiera un
panel, debería ir con autenticación propia y fuera de este repositorio.

## 8. Entorno y despliegue

| Variable | Dónde vive | Se expone al navegador |
|---|---|---|
| `DATABASE_URL` | Vercel → Settings → Environment Variables; `.env` local | No |
| `VOTE_HASH_PEPPER` | Igual | No |

Nunca deben llevar prefijo `VITE_`: Vite inyecta esas en el bundle público.

- `npm run dev` — Vite sirve el frontend y monta `/api/*` con las funciones reales
  y `.env` en el servidor de desarrollo. La votación funciona contra Neon sin CLI
  de Vercel.
- `npx vercel dev` — paridad opcional con Vercel antes de desplegar, en el puerto
  3000.
- `npm run build` — `tsc --noEmit` + build de producción.

## 9. Rendimiento

- La página no usa WebGL: el bundle es React + Motion + la interfaz.
- Los dos conejos son PNG transparentes de 600 × 1200; se muestran a 140 px de
  ancho, por lo que cubren pantallas de alta densidad sin reescalar en exceso.
- Las animaciones usan sólo `transform` y `opacity`; no hay `box-shadow` animado ni
  cambios de layout. El confeti son 20 partículas locales y breves.
- Con `prefers-reduced-motion` no hay flotación, parpadeo ni entradas animadas.

## 10. Decisiones que se dejaron fuera

- **Sin panel de administración**: sólo cerrar/abrir y consultar desde la CLI.
- **Sin tiempo real**: los resultados se leen al cargar y después de votar; no hay
  polling ni websockets. Es suficiente para una celebración.
- **Sin GSAP**: Motion cubre toda la animación de la interfaz.
- **Sin mapas embebidos**: un enlace profundo a Google Maps evita iframes pesados
  y problemas de cookies de terceros.
- **Sin analítica**: no se recopila nada.

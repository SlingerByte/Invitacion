# Invitación · revelación de género

Una invitación web de una sola columna, pensada para abrirse desde WhatsApp en un
teléfono. Dos conejos con globos presentan la celebración; debajo están la fecha,
el lugar, la hora y una votación para dejar una predicción con el nombre.

- Dirección de arte y alternativas evaluadas: [`docs/DIRECCION-ARTISTICA.md`](docs/DIRECCION-ARTISTICA.md)
- Sistema visual construido: [`docs/DESIGN.md`](docs/DESIGN.md)
- Arquitectura, contrato de API y modelo de datos: [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)
- Contexto del producto: [`PRODUCT.md`](PRODUCT.md)
- **Instrucciones para cualquier agente: [`AGENTS.md`](AGENTS.md)**

El proyecto es agnóstico respecto del agente. `AGENTS.md` reúne stack, versiones
fijadas, convenciones, reglas no negociables y estado actual; `docs/` guarda las
decisiones de arte, diseño y arquitectura. Las herramientas de apoyo no forman
parte del repositorio.

## Estado del proyecto

La página principal está construida: conejos y globos, título «Niño o Niña»,
invitación, datos reales del evento y votación completa con nombre, seis estados,
resultados agregados, cierre desde el servidor y revelación programada de nombres.

La app está desplegada en Vercel y el flujo de voto funciona. La base de Neon tiene
las migraciones 001 y 002 aplicadas; el voto se probó contra Neon real (nuevo,
duplicado, estado, resultados, nombre inválido, simultáneos, cerrada y reapertura)
y la revelación se probó con el reloj del servidor antes y después de la hora,
además de la vista previa local. Falta desplegar este último cambio.

## Requisitos

Node.js 20.19 o superior (probado con 24) y npm. No hay servidor permanente.

```bash
npm install
npm run dev        # http://localhost:5173  (frontend + /api local)
```

Vite levanta las funciones reales de `api/` en el mismo puerto y carga `.env` en el
servidor de desarrollo, así que la votación funciona contra Neon sin la CLI de
Vercel. `npx vercel dev` queda como comprobación opcional de paridad antes de
desplegar:

```bash
npx vercel dev     # http://localhost:3000  (frontend + /api, paridad Vercel)
```

## Configurar el evento

Todo lo editable está en **`src/config/event.ts`**: nombres de los padres, fecha,
hora, lugar, dirección, enlaces opcionales y textos de la invitación. Los datos
actuales son:

- Danna y Oscar
- Domingo 15 de noviembre de 2026, 2:30 p. m.
- Finca mis sueños DJ
- Corregimiento Borrero Ayerbe / KM 30
- Código de vestimenta: blanco o beige

`mapsUrl` y `rsvp.whatsappNumber` están vacíos porque no se ha facilitado un
enlace ni un número verificados. No se inventan: la dirección es el enlace a
Google Maps (búsqueda con el nombre y la dirección reales, sin coordenadas
inventadas). Si se rellena `mapsUrl`, el enlace usa ese destino verificado; si se
rellena el número, `whatsappUrl()` ya arma el RSVP.

## Poner en marcha la votación (Neon)

1. Crea un proyecto en [Neon](https://neon.tech) (el plan gratuito es suficiente)
   y copia la cadena de conexión **pooled**, que termina en `?sslmode=require`.
2. Ejecuta las dos migraciones, en orden, con `psql` o pegando cada archivo en el
   SQL Editor del panel de Neon:

   ```bash
   psql "$DATABASE_URL" -f db/migrations/001_init.sql
   psql "$DATABASE_URL" -f db/migrations/002_guest_name.sql
   ```

   O, con `.env` ya configurado (paso 3), las dos de una vez:

   ```bash
   npm run db:migrate
   ```

   La primera crea `votes`, `poll_settings`, sus restricciones, índices y el
   trigger de `updated_at`. La segunda añade `votes.guest_name` (nullable para no
   invalidar filas anteriores) y su comprobación de longitud.

3. Crea `.env` a partir de `.env.example` y rellena:

   ```
   DATABASE_URL=postgresql://...
   VOTE_HASH_PEPPER=<32 bytes aleatorios en hex>
   VOTE_DEV_MODE=true
   ```

   `VOTE_DEV_MODE` es sólo para desarrollo local; en Vercel no se configura.

   Genera el pepper con:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   El pepper no se guarda en la base y no debe compartirse. Si se cambia, todos
   los hashes anteriores dejan de coincidir: los navegadores que ya votaron
   podrían votar otra vez.

4. Comprueba:

   ```bash
   npm run poll:status
   npm run poll:results
   ```

## Cerrar la votación

Nunca hay un botón público ni un endpoint para esto. Sólo desde el servidor:

```bash
npm run poll:close    # cerrar
npm run poll:open     # reabrir
npm run poll:status   # ver estado
npm run poll:results  # totales y porcentajes
```

Equivalente en el SQL Editor de Neon:

```sql
update poll_settings set is_open = false where id = 1;
```

Cuando está cerrada, la invitación muestra los resultados y un mensaje de que ya
no se reciben predicciones.

## Un voto por navegador y nombre del invitado

1. La API emite una cookie `reveal_voter` `HttpOnly`, `SameSite=Lax`, `Secure` en
   HTTPS, con 18 bytes aleatorios.
2. En Postgres sólo se guarda `HMAC-SHA256(pepper, id)`, nunca el identificador.
3. `voter_hash` tiene un índice `UNIQUE` y, en producción, el registro usa
   `INSERT ... ON CONFLICT DO NOTHING` en una sola sentencia: dos solicitudes
   simultáneas no pueden crear dos filas. En desarrollo se usa `DO UPDATE` para
   repetir la prueba, nunca en producción.
4. Si el navegador ya votó, la API responde **409** con `already_voted` y la
   predicción guardada; el frontend la recupera al cargar (`GET /api/vote-status`)
   y también entiende ese 409 al enviar.
5. El nombre que escribe la persona se normaliza en el cliente y en el servidor
   (NFC, 2-40 caracteres) y se guarda en `votes.guest_name`. No es autenticación,
   no verifica identidad y no aparece en los resultados agregados. Permanece
   oculto hasta la revelación programada; desde ese momento se muestra junto a su
   predicción en `/api/reveal`.

### Modo desarrollo

`npm run dev` con `VOTE_DEV_MODE=true` permite repetir la prueba desde el mismo
navegador: el voto se actualiza en la misma fila y la confirmación muestra
**Reiniciar prueba**. Así se pueden ver todos los estados sin quedar bloqueado.

La excepción sólo se activa si el servidor cumple las tres condiciones:
`NODE_ENV=development`, `VOTE_DEV_MODE=true` y `VERCEL_ENV` distinto de
`production`/`preview`. En producción el flag se ignora: el índice `UNIQUE`, el
`409 already_voted` y `POST /api/dev/reset` respondiendo `404` siguen activos. No
hay ningún parámetro del navegador que pueda habilitarla.

**Limitación honesta:** al compartirse un único enlace público, sin cuentas ni
lista de invitados, no es posible garantizar matemáticamente un voto por familia.
Alguien puede votar desde otro dispositivo o navegador, o borrar sus datos. El
sistema evita duplicados en el uso normal sin rastrear a nadie. No se guardan
teléfonos, correos ni direcciones IP; el nombre es voluntario y se revela en la
fecha programada.

## Revelación de nombres

El **domingo 15 de noviembre de 2026 a las 3:00 p. m.** se publican los
nombres y la predicción de cada invitado, en orden alfabético. La hora vive en
`shared/reveal.ts` (`2026-11-15T15:00:00-05:00`) y la decide el **reloj del
servidor**; antes de esa hora `/api/reveal` devuelve `revealed:false` y
`entries:[]`, sin consultar ni enviar nombres. Ni el reloj del navegador ni un
parámetro de la URL pueden adelantarla.

Con `npm run dev` y `VOTE_DEV_MODE=true` se ve la **vista previa** antes de la
hora: si hay votos reales muestra esos nombres; si no hay ninguno, muestra datos
de ejemplo marcados como tales. En producción y en preview de Vercel la vista
previa no existe.

La página abierta consulta `/api/reveal` cada 15 s y tiene un temporizador para la
hora exacta; cuando el servidor confirma la revelación, la lista aparece sin
recargar.

## Variables de entorno en Vercel

En el proyecto de Vercel → Settings → Environment Variables, para Production y
Preview:

| Nombre | Valor |
|---|---|
| `DATABASE_URL` | cadena pooled de Neon |
| `VOTE_HASH_PEPPER` | el mismo valor de tu `.env` |

No configures `VOTE_DEV_MODE` en Vercel. Si se colara, el servidor lo ignora
porque `NODE_ENV`/`VERCEL_ENV` son de producción o preview.

No uses prefijos `VITE_` para ninguna de las dos: Vite las incrustaría en el
bundle público. `.env` está en `.gitignore` y no debe subirse al repositorio.

## Desplegar

La app está desplegada en Vercel. Cuando el dominio definitivo esté decidido:

1. Importa el repositorio en Vercel. El preset es **Vite**: build `npm run build`,
   salida `dist`. Las funciones de `api/` se publican automáticamente.
2. Añade las dos variables de entorno.
3. Actualiza `event.meta.siteUrl` y descomenta la etiqueta `canonical` en
   `index.html`.
4. `public/og-image.png` ya existe (1200×630, generado con
   `python scripts/generate-og-image.py`). Al fijar el dominio, cambia el
   `og:image` relativo por la URL absoluta.
5. Comprueba la vista previa con el Sharing Debugger de Facebook, que es el
   rastreador que WhatsApp suele respetar.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo de Vite |
| `npm run build` | typecheck + build de producción |
| `npm run preview` | sirve `dist/` localmente |
| `npm run typecheck` | TypeScript en modo estricto |
| `npm run lint` | ESLint (incluye reglas del React Compiler) |
| `npm run format` | Prettier |
| `npm run db:migrate` | aplica `db/migrations/` contra Neon (requiere `.env`) |
| `npm run poll:*` | administración de la votación |

## Accesibilidad

- Enlace de salto a la votación; foco visible de tinta de 2 px.
- Conejos, globos, estrellas, filete y confeti son decorativos
  (`aria-hidden`); la información no depende de ellos.
- La página no usa WebGL.
- `prefers-reduced-motion` detiene flotación, parpadeo, confeti y entradas; el
  contenido está visible desde el inicio.
- La confirmación, el cierre y los errores se anuncian con `aria-live` /
  `role="alert"`, y los resultados se suman al anuncio. Al registrar, el foco pasa
  a la confirmación.
- **Contraste:** el texto funcional pasa AA sobre blanco (`#4F679C` 5,6:1;
  `#5A72A8` 4,77:1; `#B25A51` 4,7:1), el título grande llega a 3,1:1 (`#7190CF` /
  `#D3786E`) y el foco es tinta (13,75:1). El pastel original se queda en la
  ilustración, las estrellas y los rellenos de los botones, con la etiqueta en un
  tono profundo de su propia familia (`#7A2E28` / `#334B7A`).

## Licencia y créditos

Los conejos son recortes transparentes derivados de los SVG suministrados; los SVG
fuente se guardan en `docs/assets/` y no se publican. Las estrellas, el filete y el
favicon se crearon en este proyecto. No hay fotografías ni
ilustraciones de terceros. Fuentes: Sacramento y Montserrat, servidas por Google
Fonts, licencia SIL Open Font.

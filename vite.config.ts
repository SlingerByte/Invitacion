import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

type ApiHandler = (request: Request) => Promise<Response>;
type ApiModule = Partial<Record<'GET' | 'POST', ApiHandler>>;

const API_ROUTES: Record<string, { module: string; methods: ('GET' | 'POST')[] }> = {
  '/api/votes': { module: '/api/votes.ts', methods: ['POST'] },
  '/api/vote-status': { module: '/api/vote-status.ts', methods: ['GET'] },
  '/api/results': { module: '/api/results.ts', methods: ['GET'] },
  '/api/reveal': { module: '/api/reveal.ts', methods: ['GET'] },
  '/api/dev/reset': { module: '/api/dev-reset.ts', methods: ['POST'] },
};

function readBody(request: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

async function handleApi(
  server: ViteDevServer,
  route: (typeof API_ROUTES)[string],
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const method = (request.method ?? 'GET').toUpperCase();
  if (!route.methods.includes(method as 'GET' | 'POST')) {
    sendJson(response, 405, { error: 'method_not_allowed' });
    return;
  }

  const host = request.headers.host ?? 'localhost:5173';
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (value === undefined) continue;
    if (['host', 'connection', 'content-length', 'transfer-encoding'].includes(name)) continue;
    headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }
  if (request.headers.host) headers.set('x-forwarded-host', request.headers.host);

  const body = method === 'GET' || method === 'HEAD' ? undefined : await readBody(request);

  const webRequest = new Request(`http://${host}${request.url ?? '/'}`, {
    method,
    headers,
    ...(body && body.length > 0 ? { body: body.toString('utf8') } : {}),
  });

  const api = (await server.ssrLoadModule(route.module)) as ApiModule;
  const handler = api[method as 'GET' | 'POST'];
  if (!handler) {
    sendJson(response, 405, { error: 'method_not_allowed' });
    return;
  }

  const webResponse = await handler(webRequest);
  response.statusCode = webResponse.status;
  webResponse.headers.forEach((value, name) => {
    if (name.toLowerCase() !== 'set-cookie') response.setHeader(name, value);
  });

  const getSetCookie = (webResponse.headers as Headers & { getSetCookie?: () => string[] })
    .getSetCookie;
  const cookies = getSetCookie
    ? getSetCookie.call(webResponse.headers)
    : [webResponse.headers.get('set-cookie')].filter((value): value is string =>
        Boolean(value),
      );
  if (cookies.length > 0) response.setHeader('set-cookie', cookies);

  response.end(Buffer.from(await webResponse.arrayBuffer()));
}

/** Sirve `/api/*` con las funciones reales, sin Vercel, sólo en desarrollo. */
function localApi(): Plugin {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = (request.url ?? '').split('?')[0] ?? '';
        if (!path.startsWith('/api/')) {
          next();
          return;
        }

        const route = API_ROUTES[path];
        if (!route) {
          sendJson(response, 404, { error: 'not_found' });
          return;
        }

        void handleApi(server, route, request, response).catch((error: unknown) => {
          console.error('[local-api]', error);
          if (!response.headersSent) sendJson(response, 500, { error: 'server_error' });
          else response.end();
        });
      });
    },
  };
}

export default defineConfig(({ mode, command }) => {
  if (command === 'serve') process.env.NODE_ENV ??= 'development';

  // Sólo el servidor de desarrollo lee estas variables; nunca se exponen al
  // cliente porque no llevan prefijo VITE_.
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['DATABASE_URL', 'VOTE_HASH_PEPPER', 'VOTE_DEV_MODE'] as const) {
    const value = env[key];
    if (value && !process.env[key]) process.env[key] = value;
  }

  return {
    plugins: [react(), tailwindcss(), localApi()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    build: {
      target: 'es2022',
    },
  };
});

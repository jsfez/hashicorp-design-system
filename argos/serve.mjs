/**
 * Static server for the built showcase.
 *
 * `showcase/config/environment.js` sets `locationType: 'history'`, so every
 * route has to fall back to `index.html` instead of 404ing. That is the only
 * thing this needs to do beyond serving files, which is why it is 40 lines of
 * `node:http` rather than a dependency.
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../showcase/dist', import.meta.url));
const port = Number(process.env.ARGOS_PORT ?? 4217);

const MIME = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const resolve = async (pathname) => {
  // `normalize` collapses any `..` a request could use to climb out of `dist`.
  const candidate = join(root, normalize(pathname));

  if (!candidate.startsWith(root)) return null;

  const stats = await stat(candidate).catch(() => null);

  return stats?.isFile() ? candidate : null;
};

createServer(async (request, response) => {
  const { pathname } = new URL(request.url, `http://127.0.0.1:${port}`);
  const file = (await resolve(pathname)) ?? join(root, 'index.html');

  response.writeHead(200, {
    'content-type': MIME[extname(file)] ?? 'application/octet-stream',
    // The showcase is rebuilt for every run; a cached asset would be a stale one.
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`showcase served on http://127.0.0.1:${port}`);
});

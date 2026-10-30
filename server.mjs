import http from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT ?? 10000);

const backends = [
  {
    prefix: '/api/services/inventory',
    target: process.env.INVENTORY_URL ?? 'https://jenilarper-proxy-inventory.onrender.com',
  },
  {
    prefix: '/api/services/orders',
    target: process.env.ORDERS_URL ?? 'https://jenilarper-proxy-orders.onrender.com',
  },
  {
    prefix: '/api/services/payments',
    target: process.env.PAYMENTS_URL ?? 'https://jenilarper-proxy-payments.onrender.com',
  },
  {
    prefix: '/api/metrics',
    target: process.env.AUDIT_URL ?? 'https://jenilarper-proxy-audit.onrender.com',
  },
];

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function json(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

async function proxy(request, response, route) {
  const target = new URL(request.url, route.target);
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);
  const headers = { ...request.headers, host: target.host };
  delete headers['content-length'];
  if (body.length > 0) {
    headers['content-length'] = String(body.length);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: body.length > 0 ? body : undefined,
      redirect: 'manual',
      signal: controller.signal,
    });

    const payload = Buffer.from(await upstream.arrayBuffer());
    const responseHeaders = Object.fromEntries(upstream.headers);
    delete responseHeaders['content-encoding'];
    delete responseHeaders['content-length'];
    delete responseHeaders['transfer-encoding'];

    response.writeHead(upstream.status, responseHeaders);
    response.end(payload);
  } catch (error) {
    json(response, 502, {
      error: 'upstream_unavailable',
      detail: error instanceof Error ? error.message : String(error),
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(dist, path.normalize(pathname));
  if (!filePath.startsWith(dist)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) {
      throw new Error('directory');
    }
    const extension = path.extname(filePath).toLowerCase();
    const immutable = extension !== '.html';
    response.writeHead(200, {
      'Content-Type': mime[extension] ?? 'application/octet-stream',
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    createReadStream(filePath).pipe(response);
  } catch {
    try {
      const html = await readFile(path.join(dist, 'index.html'));
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
      response.end(html);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  }
}

const server = http.createServer(async (request, response) => {
  const url = request.url ?? '/';

  if (url === '/health') {
    json(response, 200, { status: 'ok' });
    return;
  }

  const route = backends.find((candidate) => url.startsWith(candidate.prefix));
  if (route) {
    await proxy(request, response, route);
    return;
  }

  await serveStatic(request, response);
});

server.listen(port, () => {
  console.log(`MIRU gateway listening on ${port}`);
  for (const route of backends) {
    console.log(`${route.prefix} -> ${route.target}`);
  }
});

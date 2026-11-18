import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createApp } = require('./server.js');

async function startTestServer() {
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const addr = server.address();
  if (!addr || typeof addr === 'string') {
    throw new Error('Failed to bind test server');
  }
  return {
    baseUrl: `http://127.0.0.1:${addr.port}`,
    close: () => new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

test('public/data.json contains core GEB dataset fields', () => {
  const raw = fs.readFileSync(path.join(process.cwd(), 'public', 'data.json'), 'utf8');
  const data = JSON.parse(raw);
  assert.equal(typeof data.subjects, 'object');
  assert.ok(Object.keys(data.subjects).length > 0, 'subjects should be non-empty');
  assert.ok(Array.isArray(data.papers), 'papers should be an array');
  assert.ok(Array.isArray(data.curriculum) && data.curriculum.length > 0, 'curriculum should be non-empty');
  assert.ok(data.details && Object.keys(data.details).length > 0, 'details should be non-empty');
  assert.ok(Array.isArray(data.notices), 'notices should be an array');
});

test('server serves index.html, /api/data, /data.json, and /api/grade-status cleanly', async () => {
  const srv = await startTestServer();
  try {
    const homeRes = await fetch(`${srv.baseUrl}/`);
    assert.equal(homeRes.status, 200);
    const homeHtml = await homeRes.text();
    assert.match(homeHtml, /GENESIS 22/);

    const apiDataRes = await fetch(`${srv.baseUrl}/api/data`);
    assert.equal(apiDataRes.status, 200);
    assert.equal(apiDataRes.headers.get('cache-control'), 'no-cache');
    const apiData = await apiDataRes.json();
    assert.ok(apiData.subjects && apiData.papers);

    const staticDataRes = await fetch(`${srv.baseUrl}/data.json`);
    assert.equal(staticDataRes.status, 200);
    assert.equal(staticDataRes.headers.get('cache-control'), 'no-cache');

    const gradeRes = await fetch(`${srv.baseUrl}/api/grade-status`);
    assert.equal(gradeRes.status, 200);
    const gradeJson = await gradeRes.json();
    assert.deepEqual(gradeJson, { on: false });

    const missingApiRes = await fetch(`${srv.baseUrl}/api/does-not-exist`);
    assert.equal(missingApiRes.status, 404);
    const missingApiJson = await missingApiRes.json();
    assert.equal(missingApiJson.error, 'API route not found');

    const refs = new Set<string>();
    for (const m of homeHtml.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
      refs.add(m[1]);
    }
    const manifestRaw = fs.readFileSync(path.join(process.cwd(), 'public', 'manifest.webmanifest'), 'utf8');
    const manifest = JSON.parse(manifestRaw);
    for (const icon of manifest.icons || []) {
      if (icon.src && icon.src.startsWith('/')) refs.add(icon.src);
    }
    for (const ref of refs) {
      const r = await fetch(`${srv.baseUrl}${ref}`);
      assert.equal(r.status, 200, `Expected 200 for referenced asset ${ref}, got ${r.status}`);
    }
  } finally {
    await srv.close();
  }
});

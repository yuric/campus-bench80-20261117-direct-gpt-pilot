import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = new URL('../', import.meta.url);

test('the page main heading announces pilot readiness', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.match(html, /<main\b[^>]*>\s*<h1>Benchmark pilot ready<\/h1>/);
});

test('the real build emits health for the current full git revision', async () => {
  await run('npm', ['run', 'build'], { cwd: root });
  const { stdout } = await run('git', ['rev-parse', 'HEAD'], { cwd: root });
  const health = JSON.parse(await readFile(new URL('dist/assets/pilot-health.json', root), 'utf8'));
  assert.deepEqual(health, { status: 'ok', revision: stdout.trim() });
  assert.equal(
    await readFile(new URL('dist/index.html', root), 'utf8'),
    await readFile(new URL('index.html', root), 'utf8'),
  );
});

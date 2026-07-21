import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

// A port of its own, so a server already listening on a common one is never
// mistaken for this showcase.
const port = process.env.ARGOS_PORT ?? '4217';

export default defineConfig({
  testDir: '.',
  testMatch: 'showcase.spec.ts',
  timeout: 120_000,
  retries: process.env.CI ? 2 : 0,
  // Two on CI rather than four. These pages mount widgets that measure
  // themselves as they appear, and four browsers competing for two cores make
  // that measurement land differently from one run to the next: a handful of
  // pixels in a CodeMirror line-number gutter moved between builds of the same
  // commit. The run takes longer and reports the same thing twice in a row.
  workers: process.env.CI ? 2 : 6,
  fullyParallel: true,
  reporter:
    process.env.ARGOS_TOKEN || process.env.CI
      ? [['list'], ['@argos-ci/playwright/reporter']]
      : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    contextOptions: { reducedMotion: 'reduce' },
  },
  webServer: {
    command: `node argos/serve.mjs`,
    // `cwd` is explicit because Playwright runs `command` from the folder
    // holding this config, and the server resolves `showcase/dist` from the
    // repository root.
    cwd: repoRoot,
    env: { ARGOS_PORT: port },
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});

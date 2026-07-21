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
  workers: process.env.CI ? 4 : 6,
  fullyParallel: true,
  reporter:
    process.env.ARGOS_TOKEN || process.env.CI
      ? [['list'], ['@argos-ci/playwright/reporter']]
      : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    contextOptions: { reducedMotion: 'reduce' },
  },
  // Argos prefixes every screenshot with the project name. Naming the project
  // keeps the captures under `showcase/`; leaving it out would prefix them with
  // an empty segment and name them `/Accordion - 1280`.
  projects: [{ name: 'showcase' }],
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

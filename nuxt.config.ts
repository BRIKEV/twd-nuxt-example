import chokidar from 'chokidar';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';
import { twd } from 'twd-js/vite-plugin';
import { twdRemote } from 'twd-relay/vite';

// Full-reload the browser when a TWD test file changes.
//
// Why a custom plugin is needed on Nuxt 4 / Vite 7:
//  - The bundled `twdHmr` plugin relies on Vite's legacy `handleHotUpdate`
//    hook, which Vite 7 no longer calls (it uses the per-environment
//    `hotUpdate` hook instead), so it never fires here.
//  - TWD test files are loaded via `import.meta.glob` inside a detached
//    virtual module, so they're never part of Vite's module graph. Vite 7
//    only watches files that are in the graph, so neither `hotUpdate` nor
//    Vite's own `server.watcher` ever sees a test-file change.
//
// The robust fix: run our own watcher over the test files and tell the
// browser to reload when one changes.
function twdTestHmr(): Plugin {
  const isTestFile = (file: string) => /\.twd\.test\.tsx?$/.test(file);
  return {
    name: 'twd-test-hmr',
    apply: 'serve',
    configureServer(server) {
      // Note: under Nuxt, Vite's `config.root` is the app/ srcDir (not the
      // project root), which is exactly where twd-tests live.
      const watcher = chokidar.watch(server.config.root, {
        ignored: (path) => /node_modules|\.nuxt|\.output|\.git/.test(path),
        ignoreInitial: true,
      });
      const reload = (file: string) => {
        if (!isTestFile(file)) return;
        // Vite caches the transformed test module and never invalidates it,
        // because the file isn't in its watched module graph. Without this,
        // a reload just re-serves the STALE cached module. Drop it from the
        // graph so the reload re-transforms the file from disk.
        const graph = server.environments?.client?.moduleGraph ?? server.moduleGraph;
        for (const mod of graph.getModulesByFile(file) ?? []) {
          graph.invalidateModule(mod);
        }
        server.ws.send({ type: 'full-reload', path: '*' });
      };
      watcher.on('change', reload).on('add', reload).on('unlink', reload);
      server.httpServer?.once('close', () => void watcher.close());
    },
  };
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Global stylesheet that pulls in Tailwind (see app/assets/css/main.css).
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      // Tailwind v4 integrates via its Vite plugin — no tailwind.config.js needed.
      tailwindcss(),
      twd({ testFilePattern: '/**/*.twd.test.ts' }),
      // Reloads the browser on test-file edits (see twdTestHmr above).
      twdTestHmr(),
      twdRemote({ autoConnect: false }) as Plugin,
    ],
  },
});

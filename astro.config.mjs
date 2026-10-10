import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { buildTokens } from './scripts/build-tokens.mjs';
import { inlineTokenVars } from './src/inline-token-vars.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const tokensJson = path.join(root, 'src', 'styles', 'tokens.json');

await buildTokens();

function projectFromImporter(importer) {
  if (!importer) return null;
  const match = importer.split(path.sep).join('/').match(/\/projects\/([^/]+)\//);
  return match?.[1] ?? null;
}

function resolveExisting(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function componentResolver() {
  return {
    name: 'wf-component-resolver',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source.startsWith('@c/')) {
        const name = source.slice('@c/'.length);
        const project = projectFromImporter(importer);
        const local = project
          ? path.join(root, 'projects', project, 'components', name, 'Component.astro')
          : null;
        const shared = path.join(root, 'library', 'components', name, 'Component.astro');
        return resolveExisting([local, shared].filter(Boolean));
      }
      if (source.startsWith('@layouts/')) {
        const name = source.slice('@layouts/'.length);
        return resolveExisting([path.join(root, 'library', 'layouts', name, 'Layout.astro')]);
      }
      return null;
    },
  };
}

function tokenWatcher() {
  return {
    name: 'wf-token-watcher',
    configureServer(server) {
      const tokensDir = path.join(root, 'tokens');
      server.watcher.add(tokensDir);
      server.watcher.on('change', (file) => {
        if (!file.split(path.sep).includes('tokens')) return;
        void buildTokens().then(() => {
          server.ws.send({ type: 'full-reload' });
        });
      });
    },
  };
}

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  vite: {
    css: {
      postcss: {
        plugins: [inlineTokenVars(tokensJson)],
      },
    },
    plugins: [componentResolver(), tokenWatcher()],
  },
});

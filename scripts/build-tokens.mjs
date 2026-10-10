import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'src', 'styles');

/**
 * Semantic tokens keep the names in tokens/base.json.
 * Style Dictionary's default name transform would prefix the group.
 */
function registerSemanticFormat(dictionaryApi) {
  const register = dictionaryApi.registerFormat?.bind(dictionaryApi);
  if (!register || dictionaryApi.__wfFormat) return;
  register({
    name: 'css/semantic-variables',
    format: ({ dictionary }) => {
      const lines = dictionary.allTokens
        .filter((token) => token.path[0] === 'semantic')
        .map((token) => {
          const name = token.path.at(-1);
          const value = formatValue(token.$value ?? token.value);
          return `  --${name}: ${value};`;
        });
      return `/* Generated from tokens/. Do not edit. */\n:root {\n${lines.join('\n')}\n}\n`;
    },
  });
  dictionaryApi.__wfFormat = true;
}

function formatValue(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function applySkin(tokens, skinName) {
  if (!skinName) return tokens;
  const skinFile = path.join(root, 'tokens', 'skins', `${skinName}.json`);
  if (!fs.existsSync(skinFile)) {
    throw new Error(`Unknown skin "${skinName}". Expected ${skinFile}`);
  }
  const skin = readJson(skinFile);
  const next = structuredClone(tokens);
  for (const [name, token] of Object.entries(skin)) {
    if (!next.semantic[name]) {
      throw new Error(`Skin "${skinName}" sets unknown semantic token "${name}"`);
    }
    next.semantic[name] = token;
  }
  return next;
}

export async function buildTokens(options = {}) {
  const skin = options.skin ?? process.env.SKIN ?? '';
  const tokens = applySkin(readJson(path.join(root, 'tokens', 'base.json')), skin || null);
  const tokenFile = path.join(outDir, '.tokens.generated.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));

  const Dictionary = StyleDictionary.default ?? StyleDictionary;
  registerSemanticFormat(Dictionary);

  const config = {
    usesDtcg: true,
    source: [tokenFile],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: `${outDir}${path.sep}`,
        files: [
          {
            destination: 'tokens.css',
            format: 'css/semantic-variables',
            filter: (token) => token.path[0] === 'semantic',
          },
        ],
      },
    },
  };

  const sd = new Dictionary(config);
  if (sd.hasInitialized) await sd.hasInitialized;
  await sd.buildAllPlatforms();
  fs.rmSync(tokenFile, { force: true });

  const css = fs.readFileSync(path.join(outDir, 'tokens.css'), 'utf8');
  const agentTokens = {};
  for (const match of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    agentTokens[match[1]] = { value: match[2].trim() };
  }
  fs.writeFileSync(path.join(outDir, 'tokens.json'), `${JSON.stringify(agentTokens, null, 2)}\n`);
  return agentTokens;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  await buildTokens();
}

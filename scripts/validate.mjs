import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import stylelint from 'stylelint';
import { buildTokens } from './build-tokens.mjs';
import { buildRegistry } from './build-registry.mjs';
import { listProjects, readProject, repoRoot } from './lib/projects.mjs';

const root = repoRoot();
const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(dir, accept) {
  if (!fs.existsSync(dir)) return [];
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full, accept));
    else if (accept(full)) found.push(full);
  }
  return found;
}

function frontmatter(file) {
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return { source, script: match?.[1] ?? '', template: match ? source.slice(match[0].length) : source };
}

function propsFromSource(file, script) {
  const sourceFile = ts.createSourceFile(file, script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  /** @type {{ name: string, optional: boolean }[] | null} */
  let props = null;
  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'Props') {
      props = node.members.filter(ts.isPropertySignature).map((member) => ({
        name: member.name.getText(sourceFile),
        optional: Boolean(member.questionToken),
      }));
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return props;
}

function componentDirs() {
  const dirs = walk(path.join(root, 'library', 'components'), (file) => file.endsWith(`${path.sep}Component.astro`));
  for (const project of listProjects()) {
    dirs.push(
      ...walk(path.join(root, 'projects', project, 'components'), (file) =>
        file.endsWith(`${path.sep}Component.astro`),
      ),
    );
  }
  return dirs;
}

function checkProps() {
  for (const file of componentDirs()) {
    const manifestFile = path.join(path.dirname(file), 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    const { source, script } = frontmatter(file);
    const props = propsFromSource(file, script);
    if (!props) {
      fail(`${file} is missing a Props interface`);
      continue;
    }
    if (!source.includes(`data-component="${manifest.name}"`)) {
      fail(`${file} must set data-component="${manifest.name}"`);
    }
    const codeNames = new Set(props.map((prop) => prop.name));
    const manifestNames = new Set(Object.keys(manifest.props));
    for (const name of manifestNames) {
      if (!codeNames.has(name)) fail(`${file} manifest prop "${name}" is missing from Props`);
    }
    for (const prop of props) {
      if (prop.name === 'note') continue;
      if (!manifestNames.has(prop.name)) fail(`${file} Props.${prop.name} is missing from the manifest`);
      const spec = manifest.props[prop.name];
      const required = spec.required === true;
      if (required && prop.optional) fail(`${file} prop "${prop.name}" is required in the manifest and optional in Props`);
      if (!required && !prop.optional) fail(`${file} prop "${prop.name}" is optional in the manifest and required in Props`);
    }
    const note = props.find((prop) => prop.name === 'note');
    if (note && !note.optional) fail(`${file} note must stay optional`);
  }
}

function checkPages() {
  const library = JSON.parse(fs.readFileSync(path.join(root, 'library', 'registry.json'), 'utf8'));
  const status = new Map();
  for (const manifests of Object.values(library.groups)) {
    for (const manifest of manifests) status.set(manifest.name, manifest.status);
  }
  const banned = /<\/?([a-z][a-z0-9-]*)\b/g;
  for (const project of listProjects()) {
    const pages = walk(path.join(root, 'projects', project, 'pages'), (file) => file.endsWith('.astro'));
    for (const file of pages) {
      const { template } = frontmatter(file);
      if (/<style[\s>]/.test(template)) fail(`${file} has a style block. Pages are composition only.`);
      for (const match of template.matchAll(banned)) {
        fail(`${file} contains <${match[1]}>. Pages may only compose components.`);
      }
      for (const match of template.matchAll(/@c\/([a-z0-9-]+)/g)) {
        if (status.get(match[1]) === 'deprecated') {
          fail(`${file} imports deprecated component ${match[1]}`);
        }
      }
    }
  }
}

function checkGaps() {
  for (const project of listProjects()) {
    const specs = walk(path.join(root, 'projects', project, 'specs'), (file) => file.endsWith('.gaps.json'));
    for (const file of specs) {
      const gaps = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!Array.isArray(gaps.gaps)) fail(`${file} is missing a gaps array`);
      for (const gap of gaps.gaps ?? []) {
        if (!['variant', 'new-component', 'compose'].includes(gap.proposal)) {
          fail(`${file} has an unknown proposal "${gap.proposal}"`);
        }
        if (!['proposed', 'approved'].includes(gap.status)) {
          fail(`${file} has an unknown status "${gap.status}"`);
        }
        if (!gap.section || !gap.approach) fail(`${file} has a gap without a section and approach`);
      }
    }
  }
}

function checkTokenUse() {
  const tokens = JSON.parse(fs.readFileSync(path.join(root, 'src', 'styles', 'tokens.json'), 'utf8'));
  const files = [
    ...walk(path.join(root, 'library'), (file) => file.endsWith('.astro')),
    ...walk(path.join(root, 'src'), (file) => file.endsWith('.astro')),
    ...walk(path.join(root, 'projects'), (file) => file.endsWith('.astro')),
  ];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/var\(--([a-z0-9-]+)\)/g)) {
      if (!tokens[match[1]]) fail(`${file} uses unknown token --${match[1]}`);
    }
  }
}

async function checkStylelint() {
  const configFile = path.join(root, 'stylelint.config.mjs');
  const project = await stylelint.lint({
    configFile,
    files: ['library/**/*.astro', 'projects/**/*.astro', 'src/**/*.astro'],
    allowEmptyInput: true,
  });
  for (const result of project.results) {
    for (const warning of result.warnings) {
      fail(`${result.source}:${warning.line} ${warning.text}`);
    }
  }

  const bad = await stylelint.lint({
    configFile,
    code: '.probe { color: #fff; width: 1px; background: rgb(0, 0, 0); }',
    codeFilename: path.join(root, 'library', 'probe.css'),
  });
  const badRules = new Set(bad.results.flatMap((result) => result.warnings.map((warning) => warning.rule)));
  for (const rule of ['color-no-hex', 'unit-disallowed-list', 'function-disallowed-list']) {
    if (!badRules.has(rule)) fail(`stylelint did not reject ${rule}`);
  }

  const good = await stylelint.lint({
    configFile,
    code: '.probe { color: var(--text); display: flex; width: 50%; flex-basis: 1fr; margin: 0; }',
    codeFilename: path.join(root, 'library', 'probe.css'),
  });
  if (good.results.some((result) => result.warnings.length > 0)) {
    fail(`stylelint rejected legal CSS: ${good.results[0].warnings.map((warning) => warning.text).join('; ')}`);
  }
}

async function checkSkin() {
  const plain = await buildTokens({ skin: '' });
  const harbor = await buildTokens({ skin: 'harbor' });
  if (!plain.accent || !harbor.accent) fail('tokens.css is missing --accent');
  if (plain.accent?.value === harbor.accent?.value) {
    fail('building with the harbor skin did not change --accent');
  }
  await buildTokens({ skin: '' });
}

function checkProjects() {
  for (const name of listProjects()) readProject(name);
}

buildRegistry();
await buildTokens({ skin: '' });
checkProjects();
checkProps();
checkPages();
checkGaps();
checkTokenUse();
await checkStylelint();
await checkSkin();

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('validate: ok');

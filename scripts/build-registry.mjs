import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import { repoRoot, listProjects } from './lib/projects.mjs';
import schema from './lib/manifest-schema.json' with { type: 'json' };

const root = repoRoot();
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

function readManifests(dir, source) {
  if (!fs.existsSync(dir)) return [];
  const names = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  return names.map((folder) => {
    const file = path.join(dir, folder, 'manifest.json');
    if (!fs.existsSync(file)) {
      throw new Error(`Missing manifest: ${file}`);
    }
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!validate(manifest)) {
      const details = ajv.errorsText(validate.errors, { separator: '\n' });
      throw new Error(`${file}\n${details}`);
    }
    if (manifest.name !== folder) {
      throw new Error(`${file} name "${manifest.name}" does not match folder "${folder}"`);
    }
    if (source === 'library') {
      if (manifest.status === 'draft') {
        throw new Error(`${file} is a draft. Drafts belong in a project.`);
      }
      if (manifest.overrides) {
        throw new Error(`${file} overrides a component. Overrides belong in a project.`);
      }
    }
    if (source === 'project' && manifest.status !== 'draft') {
      throw new Error(`${file} must stay draft until it is promoted.`);
    }
    return manifest;
  });
}

function groupManifests(manifests) {
  const groups = {};
  for (const manifest of manifests) {
    groups[manifest.category] ??= [];
    groups[manifest.category].push(manifest);
  }
  return groups;
}

function writeRegistry(dir, manifests) {
  fs.mkdirSync(dir, { recursive: true });
  const groups = groupManifests(manifests);
  fs.writeFileSync(path.join(dir, 'registry.json'), `${JSON.stringify({ groups }, null, 2)}\n`);
  const lines = manifests.map(
    (manifest) => `${manifest.name}\t${manifest.category}\t${manifest.description}`,
  );
  fs.writeFileSync(path.join(dir, 'registry.txt'), lines.length ? `${lines.join('\n')}\n` : '');
}

export function buildRegistry() {
  const libraryDir = path.join(root, 'library');
  const libraryManifests = readManifests(path.join(libraryDir, 'components'), 'library');
  writeRegistry(libraryDir, libraryManifests);

  for (const project of listProjects()) {
    const projectDir = path.join(root, 'projects', project);
    const manifests = readManifests(path.join(projectDir, 'components'), 'project');
    writeRegistry(projectDir, manifests);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildRegistry();
}

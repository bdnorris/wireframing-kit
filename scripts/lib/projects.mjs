import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function repoRoot() {
  return root;
}

export function listProjects() {
  const dir = path.join(root, 'projects');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function readProject(name) {
  const file = path.join(root, 'projects', name, 'project.json');
  const project = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (project.name !== name) {
    throw new Error(`${file} name "${project.name}" does not match folder "${name}"`);
  }
  return project;
}

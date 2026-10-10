import fs from 'node:fs';
import path from 'node:path';
import { listProjects, readProject, repoRoot } from './lib/projects.mjs';

const root = repoRoot();
const projectName = process.argv[2] ?? process.env.PROJECT;

if (!projectName) {
  console.error('Usage: node scripts/leak-check.mjs <project>');
  process.exit(1);
}

const project = readProject(projectName);
const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist/ is missing. Build the project first.');
  process.exit(1);
}

function htmlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...htmlFiles(full));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

const html = htmlFiles(dist).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const failures = [];

if (!html.includes(project.title)) failures.push(`built HTML is missing "${project.title}"`);
if (!html.includes(project.fixtureCopy)) failures.push(`built HTML is missing "${project.fixtureCopy}"`);

for (const otherName of listProjects()) {
  if (otherName === projectName) continue;
  const other = readProject(otherName);
  if (html.includes(other.title)) failures.push(`built HTML contains ${otherName} title "${other.title}"`);
  if (html.includes(other.fixtureCopy)) failures.push(`built HTML contains ${otherName} fixture "${other.fixtureCopy}"`);
}

if (!project.includeGallery && fs.existsSync(path.join(dist, '_gallery'))) {
  failures.push('gallery was included in a build that sets includeGallery false');
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`leak-check: ${projectName} ok`);

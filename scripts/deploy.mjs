import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readProject, repoRoot } from './lib/projects.mjs';

const root = repoRoot();
const projectName = process.argv[2];
const preview = process.argv.includes('--preview');
const publish = process.argv.includes('--publish');

if (!projectName) {
  console.error('Usage: node scripts/deploy.mjs <project> [--preview] [--publish]');
  process.exit(1);
}

const project = readProject(projectName);
const env = {
  ...process.env,
  PROJECT: project.name,
  SKIN: project.skin ?? '',
};

const build = spawnSync('npm', ['run', 'build'], { cwd: root, env, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);

const leak = spawnSync('node', ['scripts/leak-check.mjs', project.name], { cwd: root, stdio: 'inherit' });
if (leak.status !== 0) process.exit(leak.status ?? 1);

if (project.access === 'basic') {
  const middleware = `export async function onRequest(context) {
  const expected = context.env.BASIC_AUTH_PASSWORD;
  if (!expected) {
    return new Response('BASIC_AUTH_PASSWORD is not set', { status: 500 });
  }
  const header = context.request.headers.get('Authorization') || '';
  const [scheme, encoded] = header.split(' ');
  let password = '';
  if (scheme === 'Basic' && encoded) {
    const decoded = atob(encoded);
    password = decoded.slice(decoded.indexOf(':') + 1);
  }
  if (password && password === expected) return context.next();
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="wireframe", charset="UTF-8"' },
  });
}
`;
  const functionsDir = path.join(root, 'dist', 'functions');
  fs.mkdirSync(functionsDir, { recursive: true });
  fs.writeFileSync(path.join(functionsDir, '_middleware.js'), middleware);
  console.log(`Set the password with: npx wrangler pages secret put BASIC_AUTH_PASSWORD --project-name ${project.pagesProject}`);
}

if (project.access === 'access') {
  const hosts = [
    project.domain,
    `${project.pagesProject}.pages.dev`,
    `*.${project.pagesProject}.pages.dev`,
  ].filter(Boolean);
  console.log('Cloudflare Access checklist (not applied by Wrangler):');
  for (const host of hosts) console.log(`- Cover ${host}`);
  console.log(`- Allow ${project.allowedEmails.join(', ') || '(no emails listed)'}`);
  console.log('- Include preview deployments. An uncovered hostname bypasses protection.');
}

if (project.access === 'none') {
  console.log(`${project.name} is public.`);
}

if (project.access !== 'basic' && project.access !== 'access' && project.access !== 'none') {
  console.error(`Unknown access "${project.access}". Expected none, basic, or access.`);
  process.exit(1);
}

if (!publish) {
  console.log('Dry run complete. Pass --publish to upload with Wrangler.');
  process.exit(0);
}

const args = ['wrangler', 'pages', 'deploy', 'dist', '--project-name', project.pagesProject];
if (preview) args.push('--branch', 'preview');
const upload = spawnSync('npx', args, { cwd: root, stdio: 'inherit' });
process.exit(upload.status ?? 1);

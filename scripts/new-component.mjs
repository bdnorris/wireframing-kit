import fs from 'node:fs';
import path from 'node:path';
import { buildRegistry } from './build-registry.mjs';
import { repoRoot } from './lib/projects.mjs';

const root = repoRoot();
const args = process.argv.slice(2);

function option(name) {
  const index = args.indexOf(name);
  if (index === -1 || !args[index + 1]) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
  return args[index + 1];
}

const project = option('--project');
const page = option('--page');
const name = option('--name');
const gapsFile = path.join(root, 'projects', project, 'specs', `${page}.gaps.json`);

if (!fs.existsSync(gapsFile)) {
  console.error(`No gaps file at ${gapsFile}. new-page writes one before a component can be scaffolded.`);
  process.exit(1);
}

const gaps = JSON.parse(fs.readFileSync(gapsFile, 'utf8'));
const approved = (gaps.gaps ?? []).filter(
  (gap) => gap.status === 'approved' && (gap.proposal === 'new-component' || gap.proposal === 'variant'),
);

if (approved.length === 0) {
  console.error(`No approved component gap in ${gapsFile}. Set status to "approved" before scaffolding.`);
  process.exit(1);
}

const destination = path.join(root, 'projects', project, 'components', name);
if (fs.existsSync(destination)) {
  console.error(`${destination} already exists.`);
  process.exit(1);
}

const reason = approved[0].approach.replace(/"/g, "'");
fs.mkdirSync(destination, { recursive: true });
fs.writeFileSync(
  path.join(destination, 'manifest.json'),
  `${JSON.stringify(
    {
      name,
      title: name,
      description: reason,
      category: 'section',
      tags: [],
      status: 'draft',
      props: {
        heading: { type: 'string', required: true },
      },
      slots: ['default'],
      since: '0.1.0',
    },
    null,
    2,
  )}\n`,
);
fs.writeFileSync(
  path.join(destination, 'Component.astro'),
  `---
interface Props {
  heading: string;
  note?: string;
}

const { heading, note } = Astro.props;
---

<section data-component="${name}" data-note={note}>
  <h2>{heading}</h2>
  <slot />
</section>

<style>
  section {
    display: grid;
    gap: var(--space-stack);
    padding: var(--space-section) var(--space-gutter);
  }

  h2 {
    font-size: var(--heading-lg);
  }
</style>
`,
);
fs.writeFileSync(
  path.join(destination, 'example.astro'),
  `---
import Component from './Component.astro';
---

<Component heading="${name}" />
`,
);

buildRegistry();
console.log(`Drafted ${path.relative(root, destination)} from an approved gap.`);

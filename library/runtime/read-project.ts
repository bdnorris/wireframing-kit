import fs from 'node:fs';
import path from 'node:path';

export interface ProjectNavItem {
  label: string;
  href: string;
}

export interface ProjectConfig {
  name: string;
  title: string;
  access: 'none' | 'basic' | 'access';
  pagesProject: string;
  domain: string | null;
  allowedEmails: string[];
  nav: ProjectNavItem[];
  skin: string | null;
  includeGallery: boolean;
  annotations: boolean;
  fixtureCopy: string;
}

export function readProject(name: string): ProjectConfig {
  const file = path.join(process.cwd(), 'projects', name, 'project.json');
  const project = JSON.parse(fs.readFileSync(file, 'utf8')) as ProjectConfig;
  return project;
}

import fs from 'node:fs';
import path from 'node:path';

/** Custom properties work in declarations. Media and container queries need the resolved length. */
export function inlineTokenVars(tokensFile) {
  return {
    postcssPlugin: 'wf-inline-token-vars',
    Once(root) {
      if (!fs.existsSync(tokensFile)) return;
      const tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
      root.walkAtRules((atRule) => {
        if (atRule.name !== 'media' && atRule.name !== 'container') return;
        atRule.params = atRule.params.replace(/var\(--([A-Za-z0-9-]+)\)/g, (match, name) => {
          const token = tokens[name];
          if (!token) {
            throw new Error(`Unknown token var(--${name}) in @${atRule.name}`);
          }
          return token.value;
        });
      });
    },
  };
}

inlineTokenVars.postcss = true;

export function tokensStylesheet(root) {
  return path.join(root, 'src', 'styles', 'tokens.json');
}

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Storybook syntax highlighting compatibility', () => {
  it('does not apply the UI tag utility to Prism JSX tokens', () => {
    const css = readFileSync(resolve(__dirname, '../base-components.css'), 'utf8');

    expect(css).toContain('.tag:not(.token)');
    expect(css).not.toMatch(/(^|[},]\s*)\.tag\s*\{/m);
  });

  it('stops explicit motion surfaces when reduced motion is requested', () => {
    const css = readFileSync(resolve(__dirname, '../base-components.css'), 'utf8');

    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*?\.mdl-motion[\s\S]*?animation:none!important/);
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*?\.mdl-motion[\s\S]*?transition:none!important/);
  });
});

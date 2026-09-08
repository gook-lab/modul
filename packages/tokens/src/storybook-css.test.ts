import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Storybook syntax highlighting compatibility', () => {
  it('does not apply the UI tag utility to Prism JSX tokens', () => {
    const css = readFileSync(resolve(__dirname, '../base-components.css'), 'utf8');

    expect(css).toContain('.tag:not(.token)');
    expect(css).not.toMatch(/(^|[},]\s*)\.tag\s*\{/m);
  });

  it('reduces animation and scrolling across every motion surface', () => {
    const css = readFileSync(resolve(__dirname, '../base-components.css'), 'utf8');

    expect(css).toMatch(/prefers-reduced-motion:reduce[\s\S]*?\*,\*::before,\*::after/);
    expect(css).toContain('animation-iteration-count:1!important');
    expect(css).toContain('transition-duration:.01ms!important');
  });
});

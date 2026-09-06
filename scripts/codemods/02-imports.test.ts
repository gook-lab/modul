import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import jscodeshift from 'jscodeshift';
import transform, { MOVE_TO_MALT } from './02-imports';

const run = (src: string) =>
  transform({ source: src, path: 'x.tsx' }, { jscodeshift: jscodeshift.withParser('tsx'), j: jscodeshift, stats: () => {}, report: () => {} } as never);

describe('02-imports — 변환 자체', () => {
  it('malt-ui 대상만 옮기고 나머지는 남긴다', () => {
    const out = run("import { Button, Rule, ChipGroup, Toggle } from '@malt/ui-web'");
    expect(out).toContain("import { ChipGroup, Toggle } from '@gook-lab/malt-ui'");
    expect(out).toContain("import { Button, Rule } from '@malt/ui-web'");
    expect(out).not.toContain('@gook-lab/ui');
  });

  it('대상이 없으면 손대지 않는다', () => {
    const src = "import { Button, Skeleton } from '@malt/ui-web'";
    expect(run(src)).toBe(src);
  });

  it('type import 도 종류를 보존한다', () => {
    const out = run("import type { StepBarProps } from '@malt/ui-web'");
    expect(out).toBe("import type { StepBarProps } from '@malt/ui-web'");
  });
});

/** MODUL 실물과 대조 — 옮기는 이름이 malt-ui 에 실제로 export 돼 있어야 합니다. */
describe('02-imports — malt-ui 실물과 대조', () => {
  const index = readFileSync(new URL('../../packages/malt-ui/src/index.ts', import.meta.url), 'utf8');
  it('MOVE_TO_MALT 전원이 malt-ui 에 있다', () => {
    for (const name of MOVE_TO_MALT) {
      expect(index, `${name} 이 malt-ui index 에 없습니다`).toContain(`./${name}`);
    }
  });
});

const BOTTLING = join(homedir(), 'sonix/shared/bottling/packages/ui-web/src/index.ts');
describe.runIf(existsSync(BOTTLING))('02-imports — bottling 실물과 대조', () => {
  it('MOVE_TO_MALT 전원이 ui-web 에 실존한다 — 이름이 바뀌면 여기서 잡힌다', () => {
    const index = readFileSync(BOTTLING, 'utf8');
    for (const name of MOVE_TO_MALT) {
      expect(index, `${name} 이 bottling ui-web 에 없습니다`).toContain(name);
    }
  });
});

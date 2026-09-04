import { injectAxe, checkA11y, configureAxe } from 'axe-playwright';
import type { TestRunnerConfig } from '@storybook/test-runner';

/**
 * 스토리마다 axe 를 한 번 실행합니다. 기준선은 color-contrast 위반 0 (docs/contrast-audit.md).
 *
 * 자동 실행 주체는 이 파일 하나입니다. addon-a11y 도 실행하면
 * "Axe is already running" 으로 스토리가 실패하므로 preview.tsx 에서 `a11y.manual: true` 로 꺼 둡니다.
 *
 * `.btn-primary` 제외는 docs/contrast-audit.md '수정 2' 의 명시적 예외입니다 —
 * bg 라벨 / accent 배경이 light 3.76 · malt 3.49 로 4.5:1 에 못 미치지만
 * 라벨이 14px/800 이고 accent-to-ground 3:1 기준을 넘겨 수용한 결정입니다.
 * 그 결정을 다시 뒤집을 때 이 줄도 같이 지워 주세요. 다른 표면은 전부 검사 대상입니다.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    // 워커 하나가 여러 스토리 파일을 같은 페이지에서 돌립니다. 오버레이(Modal · Drawer · Sheet)는
    // 네이티브 <dialog> + showModal() 이라 top layer 에 남을 수 있고, 그러면 다음 스토리의 텍스트가
    // 남은 백드롭 위에서 측정돼 color-contrast 가 간헐적으로 터집니다.
    // (Modal › Default 가 전체 실행에서만 3노드 위반, 단독 실행 3/3 통과로 재현됐습니다.)
    await page.evaluate(() => {
      document.querySelectorAll('dialog[open]').forEach(d => (d as HTMLDialogElement).close());
    });
    await injectAxe(page);
  },
  async postVisit(page) {
    // 애니메이션을 끄고 잽니다. mdl-fadeup 같은 opacity 진입 애니메이션 도중에 axe 가
    // 샘플링하면 그 안의 텍스트가 전부 color-contrast 위반으로 잡혀, 로컬은 통과하고
    // CI 만 실패하는 플레이크가 됩니다(2026-09-04 Modal Open).
    // 끝나기를 기다리는 방법은 Marquee · Skeleton 처럼 무한 반복하는 것 때문에 못 씁니다.
    await page.addStyleTag({
      content: '*,*::before,*::after{animation:none!important;transition:none!important}',
    });
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await configureAxe(page, { rules: [{ id: 'color-contrast', enabled: true }] });
    await checkA11y(
      page,
      { include: ['#storybook-root'], exclude: ['.btn-primary'] },
      { detailedReport: true, detailedReportOptions: { html: false } },
    );
  },
};
export default config;

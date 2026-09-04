import { injectAxe, checkA11y, configureAxe } from 'axe-playwright';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { getStoryContext } from '@storybook/test-runner';
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
/**
 * 스크린샷 스냅샷은 VISUAL=1 일 때만 돕니다. axe 는 "읽을 수 있나" 만 보기 때문에
 * 토큰 하나로 레이아웃이 무너져도 대비는 그대로라 전부 초록으로 지나갑니다.
 * 실측(2026-09-04): --space-4 를 16px → 40px 로 바꿔도 a11y 92/92 는 통과하고
 * 시각 스냅샷만 1건을 잡았습니다.
 * 기준선이 OS 별이라(폰트 래스터라이즈 차이) CI 필수 게이트에는 넣지 않았습니다.
 */
const VISUAL = process.env.VISUAL === '1';

const config: TestRunnerConfig = {
  setup() {
    // expect 는 jest 환경이 준비된 뒤에만 있습니다 — 모듈 최상단에서 쓰면 ReferenceError 입니다.
    if (VISUAL) expect.extend({ toMatchImageSnapshot });
  },
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
  async postVisit(page, context) {
    // 애니메이션을 끄고 잽니다. mdl-fadeup 같은 opacity 진입 애니메이션 도중에 axe 가
    // 샘플링하면 그 안의 텍스트가 전부 color-contrast 위반으로 잡혀, 로컬은 통과하고
    // CI 만 실패하는 플레이크가 됩니다(2026-09-04 Modal Open).
    // 끝나기를 기다리는 방법은 Marquee · Skeleton 처럼 무한 반복하는 것 때문에 못 씁니다.
    await page.addStyleTag({
      content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
    });
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await configureAxe(page, { rules: [{ id: 'color-contrast', enabled: true }] });
    await checkA11y(
      page,
      { include: ['#storybook-root'], exclude: ['.btn-primary'] },
      { detailedReport: true, detailedReportOptions: { html: false } },
    );

    if (!VISUAL) return;
    // 시간에 따라 값이 변하는 스토리(rAF 카운터 등)는 실행마다 픽셀이 달라 스냅샷을 못 씁니다.
    // 임계값을 올려 전체를 무디게 하는 대신 스토리가 직접 빠집니다:
    //   parameters: { visual: { skip: true } }
    const story = await getStoryContext(page, context);
    if ((story.parameters as { visual?: { skip?: boolean } }).visual?.skip) return;

    const shot = await page.locator('#storybook-root').screenshot({ animations: 'disabled' });
    expect(shot).toMatchImageSnapshot({
      // 폰트 래스터라이즈가 OS 마다 달라 macOS 기준선을 리눅스 CI 에 그대로 쓸 수 없습니다.
      // 플랫폼별로 나눠 두면 나중에 컨테이너에서 리눅스 기준선을 따로 만들 수 있습니다.
      customSnapshotsDir: `${process.cwd()}/__snapshots__/${process.platform}`,
      customSnapshotIdentifier: context.id,
      // 폰트 로딩·서브픽셀 차이가 있어 0 은 현실적이지 않습니다. 레이아웃이 무너지면 훨씬 넘습니다.
      failureThreshold: 0.02,
      failureThresholdType: 'percent',
    });
  },
};
export default config;

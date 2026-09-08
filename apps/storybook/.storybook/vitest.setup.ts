import { afterEach, beforeAll, expect } from 'vitest';
import { page } from 'vitest/browser';

declare const __VISUAL__: boolean;

/**
 * 자동화된 브라우저에서는 애니메이션을 끕니다.
 * mdl-fadeup 같은 opacity 진입 애니메이션 도중에 axe 가 샘플링하면 그 안의 텍스트가
 * 전부 color-contrast 위반으로 잡히고, 스크린샷도 프레임마다 달라집니다.
 * 애니메이션이 끝나기를 기다리는 방법은 Marquee · Skeleton 이 무한 반복이라 쓸 수 없습니다.
 */
beforeAll(async () => {
  // 웹폰트(Archivo · Instrument Serif)가 늦게 오면 첫 스크린샷과 다음 스크린샷의 글자 폭이
  // 달라집니다. 폰트가 준비된 뒤에 시작합니다.
  await document.fonts.ready;
  const el = document.createElement('style');
  el.textContent =
    '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
  document.head.appendChild(el);
});

/**
 * 시각 회귀. axe 는 "읽을 수 있나" 만 보기 때문에, 토큰 하나로 레이아웃이 무너져도
 * 대비는 그대로라 전부 초록으로 지나갑니다.
 * 실측(2026-09-04): --space-4 를 16px → 40px 로 바꿔도 a11y 는 전부 통과하고
 * 시각 스냅샷만 잡았습니다.
 *
 * VISUAL=1 일 때만 돕니다 — 기준선이 OS 별이라(폰트 래스터라이즈 차이) CI 필수
 * 게이트에는 넣지 않았고, 배포 전 로컬 확인용입니다.
 */
if (__VISUAL__) {
  afterEach(async ctx => {
    // 시간에 따라 값이 변하는 스토리(rAF 카운터 등)는 실행마다 픽셀이 달라 스냅샷을 못 씁니다.
    // 임계값을 올려 전체를 무디게 하는 대신 스토리가 직접 빠집니다:
    //   parameters: { visual: { skip: true } }
    const params = (ctx.task.meta as { storyParameters?: { visual?: { skip?: boolean } } }).storyParameters;
    if (params?.visual?.skip) return;

    const root = document.querySelector<HTMLElement>('#storybook-root') ?? document.body;
    // 폰트 로딩·서브픽셀 차이가 있어 0 은 현실적이지 않습니다. 레이아웃이 무너지면 훨씬 넘습니다.
    // 이름을 스토리 이름으로 고정합니다 — 기본값은 실행 순서 인덱스라 스토리가 늘면 전부 어긋납니다.
    // Vitest 가 파일명에서 비ASCII 를 지우기 때문에(실측: 한글 이름 7개가 전부 같은 파일로 충돌)
    // 한글은 코드포인트로 바꿔 서로 겹치지 않게 만듭니다.
    const name = ctx.task.name
      .replace(/[^\x20-\x7E]/g, c => 'u' + c.codePointAt(0)!.toString(16))
      .replace(/[/\\:*?"<>|\s&—]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    await expect(page.elementLocator(root)).toMatchScreenshot(name, {
      comparatorOptions: { allowedMismatchedPixelRatio: 0.02 },
    });
  });
}

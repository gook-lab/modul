/**
 * bottling 의 CSS 변수 이름을 MODUL 토큰 이름으로 바꿉니다.
 *
 * 매핑은 추측이 아니라 **양쪽 값을 대조해서** 만들었습니다(2026-09-06 실측).
 * bottling `packages/tokens/dist/tokens.css` 와 MODUL `styles.css` · `theme-malt.css` 의
 * 값이 같은 것만 넣었고, 값이 다르거나 MODUL 에 없는 역할은 남깁니다.
 *
 * 이 파일의 매핑이 실제 값과 어긋나지 않는지는 `01-tokens.test.ts` 가 검사합니다 —
 * 두 저장소의 토큰이 바뀌면 거기서 먼저 실패합니다.
 */

/** 값이 같아 그대로 대체할 수 있는 것. 후보가 여럿이면 역할에 맞는 쪽을 골랐습니다. */
export const MAP: Record<string, string> = {
  // 표면과 잉크
  '--color-cream': '--color-bg',
  '--color-ink': '--color-text',
  '--color-body': '--color-neutral-800',
  '--color-muted': '--color-neutral-700',
  '--color-faint': '--color-neutral-600',
  '--color-disabled': '--color-neutral-500',
  '--color-rule': '--color-divider',
  '--color-rule-dashed': '--color-neutral-400',
  // 강조(앰버)
  '--color-amber': '--color-accent',
  '--color-amber-hover': '--color-accent-600',
  '--color-amber-soft': '--color-accent-100',
  '--color-amber-soft-text': '--color-accent-700',
  // 도메인 색 — @gook-lab/malt-ui 가 쓰는 이름으로
  '--color-clay': '--malt-clay',
  '--stock-in-stock': '--malt-stock-in',
  '--stock-low': '--malt-stock-low',
  '--stock-sold-out': '--malt-clay',
  // 타이포와 반경
  '--font-display': '--font-heading',
  '--radius-base': '--radius-md',
};

/**
 * 바꾸지 않는 것과 그 이유. 코드모드가 조용히 건너뛰면 나중에 왜 남았는지 알 수 없어
 * 여기 적어 둡니다.
 */
export const KEPT: Record<string, string> = {
  '--color-surface': 'MODUL 에도 같은 이름이 있습니다 — 바꿀 필요가 없습니다',
  '--font-body': 'MODUL 에도 같은 이름이 있습니다',
  '--font-mono': 'MODUL 에도 같은 이름이 있습니다',
  '--color-button-disabled': 'MODUL 에 대응 역할이 없습니다. 비활성 버튼은 .btn:disabled 의 opacity 로 처리합니다',
  '--radius-pill': 'MODUL 은 rounded="pill" prop 으로 처리합니다',
  '--size-touch-target': 'MODUL 은 Malt 테마의 .btn min-height 로 강제합니다',
  '--size-pull-to-refresh': '앱 전용 값입니다 — MODUL 로 옮기지 않습니다',
  '--size-pull-haptic': '앱 전용 값입니다',
  '--size-progress-bar': '2px 는 --radius-* 와 값만 같고 역할이 다릅니다. 그대로 둡니다',
  '--duration-sheet-up': 'MODUL 프리셋에 없는 값입니다. move(320ms) 또는 page(720ms) 중 하나로 옮기고 화면을 확인하세요',
  '--duration-toast': 'Toast 의 duration prop 으로 넘깁니다',
  '--duration-skeleton-threshold': 'LoadingSwap 의 minShow 로 넘깁니다',
  '--duration-list-to-detail': '180ms 는 프리셋 밖입니다. move(320ms) 로 옮기고 화면을 확인하세요',
  '--duration-step-slide': '위와 같습니다',
};

/** 긴 이름을 먼저 바꿔야 `--color-amber` 가 `--color-amber-hover` 를 잘라먹지 않습니다. */
const ORDERED = Object.entries(MAP).sort((a, b) => b[0].length - a[0].length);

export default function transform(src: string) {
  return ORDERED.reduce((s, [from, to]) => s.split(from).join(to), src);
}

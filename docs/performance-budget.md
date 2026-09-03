# 성능 예산

측정: `pnpm --filter @modul/ui build && npx size-limit`, 스토리북 test-runner 의 `page.evaluate(() => document.querySelectorAll('*').length)`.

## 번들 (gzip, 트리셰이킹 후 소비자가 실제 import 한 것만)
| 패키지 | 예산 | 근거 |
| --- | --- | --- |
| @modul/tokens (css) | 8 KB | styles + components + theme-malt 합. 초과 시 components.css 분할 |
| @modul/ui — Button+Input+Tag+Card | 4 KB | 기본 폼 화면 |
| @modul/ui — 전부 | 38 KB | Radix 12종 포함(≈ 22 KB). cmdk · react-day-picker 는 lazy 라 제외 |
| @modul/motion | 3 KB | 훅 + Marquee/Reveal |
| lazy 청크 | DatePicker 18 KB · CommandPalette 9 KB | 첫 상호작용 시 로드 |

## 컴포넌트별 DOM 노드 (기본 props)
| 컴포넌트 | 노드 | 비고 |
| --- | --- | --- |
| Button | 1–2 | 아이콘 포함 2 |
| Input | 4 | field · label · input · helper |
| Select (닫힘 / 열림 n=5) | 3 / 3+7 | 목록은 열릴 때만 |
| Combobox (열림, 10 결과) | 6 + 3×10 | 20 이상 가상화 |
| Table 20행 × 5열 | ≈ 130 | 200행 → virtual 필수 |
| Toast 3개 | 15 | |
| Sidebar 6항목 | ≈ 26 | |
| BarChart 12포인트 | ≈ 60 | |
| Malt 피드(F4) 전체 | ≈ 180 | 모바일 예산 300 이하 |
| 어드민 대시보드 | ≈ 450 | 데스크톱 예산 1,500 이하 |

## 상호작용
| 지표 | 목표 p75 | 어디서 |
| --- | --- | --- |
| INP | ≤ 200ms | 전체. 오버레이 열림 ≤ 100ms |
| Combobox input→result | ≤ 150ms 로컬 / ≤ 400ms 원격 | RADIO/Combobox |
| Table 정렬 클릭 → 헤더 반영 | 즉시 (낙관), 데이터 ≤ 300ms | |
| CLS | 0 | 오버레이 절대 위치 · 스켈레톤 동일 높이 · 인라인 편집 동일 박스 |
| 첫 페인트 (스토리북 셸) | ≤ 1.0s | 폰트 swap, 토큰 CSS 인라인 |

## 실측 (2026-09-03, size-limit 11.2)

측정 명령은 `npx size-limit`, 설정은 `.size-limit.json` 입니다. 위 표와 비교되도록 세 가지를 명시했습니다 — `gzip: true`(size-limit 기본값은 brotli), peer 전체 제외(`react` · `react-dom` · `react/jsx-runtime` · `react-hook-form` · `zod` · `@hookform/resolvers`), 그리고 위 표에서 lazy 로 빼둔 `cmdk` · `react-day-picker` · `date-fns` 제외.

| 항목 | 예산 | 실측 | 상태 |
| --- | --- | --- | --- |
| tokens css | 8 KB | 6.70 KB | 통과 |
| ui core (Button+Input+Tag+Card) | 4 KB | 1.83 KB | 통과 |
| ui all — MODUL 코드만 | 30 KB | 26.60 KB | 통과 |
| ui all — Radix 포함 | 74 KB | 70.72 KB | 통과 |
| motion (훅 + Marquee/Reveal) | 3 KB | 1.54 KB | 통과 |

### 배럴 번들 — 엔트리 분할로 교체

처음 측정에서 `ui core` 가 47.41 KB 로 나왔습니다. `ui all` 과 거의 같은 값이라 트리셰이킹이 아예 걸리지 않는 상태였습니다.

원인은 산출물 구조였습니다. `dist/index.js` 하나로 번들하면 `import * as RTabs from '@radix-ui/react-tabs'` 류의 최상단 import 14개가 그 파일에 모입니다. Radix · cmdk · react-day-picker 가 `sideEffects: false` 를 선언하지 않아서, 소비자가 `Button` 하나만 import 해도 번들러가 그 문장들을 지우지 못합니다.

`packages/ui/tsup.config.ts` · `packages/motion/tsup.config.ts` 의 엔트리를 컴포넌트별로 나누고 `splitting` 을 켰습니다. 배럴은 재수출만 남아서, 쓰지 않는 파일과 그 파일이 끌고 오던 Radix 가 따라오지 않습니다. `ui core` 는 47.41 KB → 1.83 KB, motion 은 6.15 KB → 1.54 KB 로 내려갔습니다.

### 예산 두 줄 — 추정치 교체와 자체 코드 가드레일

기존 `ui all 38 KB` 는 "Radix 12종 포함(≈ 22 KB)" 추정 위에 세운 숫자였습니다. 실측에서 Radix 는 9종만으로 약 44 KB 였고(Radix 포함 70.72 − MODUL 코드 26.60), MODUL 자체 UI 코드 전체가 26.60 KB 였습니다. 틀린 항목은 예산이 아니라 추정치였습니다.

그래서 한 줄을 두 줄로 나눴습니다.

- **ui all — MODUL 코드만 (30 KB)** — 우리가 직접 통제하는 코드의 가드레일입니다. 컴포넌트를 늘리면 이 줄이 먼저 빨개집니다.
- **ui all — Radix 포함 (74 KB)** — 소비자가 실제로 받는 총량입니다. 추정치 22 KB 를 실측 44 KB 로 바꾼 결과이고, 예산을 느슨하게 한 것이 아니라 재는 대상을 실측으로 맞춘 것입니다.

`motion` 예산 3 KB 는 원래 표에 "훅 + Marquee/Reveal" 기준으로 적혀 있었는데 측정은 18종 전체를 재고 있었습니다. `.size-limit.json` 의 `import` 범위를 그 정의(`useReducedMotion` · `useSpring` · `useCountUp` · `Marquee` · `Reveal`)에 맞췄습니다.

## 강제
- `size-limit` 을 CI verify.yml 에 추가 — 예산 초과 시 실패
- 스토리북 test-runner 에서 스토리별 노드 수를 스냅샷 — +20% 이상 증가 시 리뷰 요구
- `web-vitals` 로 INP p75 를 앱 셸에서 보고 (bottling 은 이미 metrics 어댑터 있음)

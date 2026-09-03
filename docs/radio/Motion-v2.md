# Motion v2 — 10종

> 포트폴리오용 표현 모션 + 앱용 상태 전이. 전부 presets.ts 의 토큰만.

## R
- ScrollStory · ImageReveal · ScrollGuide 는 스크롤이 이징 — duration 없음. rAF 1개, passive 리스너
- SharedLayout: View Transitions 우선, FLIP 폴백(320ms decel). 텍스트는 크로스페이드
- useSpring/useDrag: stiffness 300 · damping 24, rubber .35, 포인터 이벤트(터치 포함), 스냅 필수
- Magnetic: 반경 80 · strength .3 · max 12px. (pointer: fine) 아니면 비활성
- NumberRoller: 자리별 300 + (끝에서 거리 × 90)ms, 새 자리 폭 0→1ch
- Stagger: 총 ≤ 900ms. order 4종. 12개 이상이면 간격 자동 축소
- LoadingSwap: minShow 400 — 그 안에 오면 스켈레톤 생략. 높이 보간 → CLS 0
- **reduced-motion**: 프리셋 레벨(presets[x].reduced). 표는 스토리북 「프리셋 · reduced-motion」

## A
- 상태 없는 것(Stagger, NumberRoller) / 스크롤 구독(ScrollStory, ImageReveal, ScrollGuide) / 물리 rAF(useSpring, Magnetic) / 레이아웃 측정(SharedLayout, LoadingSwap)
- 전부 컴포넌트 밖으로 값 노출 (progress · x · step) — 소비자가 그린다

## D
`Preset = { duration; easing; properties; reduced }` — 테스트가 토큰 집합을 강제

## I
- 위 파일 시그니처. 이벤트 없음. Magnetic·Cursor 는 pointer:fine 만

## O
- DOM: NumberRoller = 자리 × 12 노드 (6자리 72) — 헤드라인 숫자 1–2개까지. 표 셀엔 useCountUp
- 스크롤 리스너는 컴포넌트당 1개, rAF 코얼레싱
- presets.test.ts 가 토큰 이탈을 잡음

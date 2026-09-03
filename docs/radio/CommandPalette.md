# CommandPalette

> ⌘K. cmdk(필터·키보드) + Radix Dialog(모달). 파워유저 내비게이션.

## R — Requirements
- ⌘K / Ctrl+K 토글, Esc 닫기, ↑↓ Enter, 그룹·단축키 표기·최근 항목
- 열림 INP p75 ≤ 100ms — 명령 목록은 정적이거나 미리 로드
- 퍼지 매칭(cmdk 기본), 결과 없음 문구
- 포커스 트랩, 닫힐 때 트리거로 복귀

## A — Architecture
- groups 는 정적 설정(라우트 매니페스트에서 생성) — bottling 은 routes/manifest.ts
- local: open · query · selected. 최근 항목은 Storage 어댑터(core) 경유
- run() 은 부모가 준 콜백 — 라우터·액션 디스패치는 여기서 하지 않는다

## D — Data Model
```ts
type CommandItem = { label: string; icon?: ReactNode; kbd?: string; keywords?: string[]; run: () => void };
type CommandGroup = { name: string; items: CommandItem[] };
// 항목 50개 이하 가정. 원격 검색(보틀 이름)은 별도 그룹을 async 로 채움
```

## I — Interface
- open · onOpenChange · groups · placeholder · hotkey
- 이벤트: palette.open(source: hotkey|button) / palette.run(label, position, queryLength)

## O — Optimization & Observability
- Dialog 는 open 일 때만 마운트, cmdk 리스트는 max-height 320 스크롤(가상화 불필요 ≤ 50)
- 핫키 리스너 1개(window), 언마운트 시 제거
- 지표: 사용률(DAU 중 1회 이상), 상위 명령 — 상단 내비 개편 근거

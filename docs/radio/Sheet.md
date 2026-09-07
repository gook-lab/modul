# Sheet

> 하단 시트. 원래 화면을 떠나지 않는 결정.

## R — Requirements
- move 프리셋(var(--motion-slow) · decel)로 올라옴, 딤 40%, 그립, 제목 필수(스크린리더 첫 읊음)
- 취소·신고·대기 신청 — 페이지 이동 대신
- Esc·딤·닫기 → onClose(대개 navigate(-1))

## A — Architecture
- 라우트로 열면(/meet/1/cancel) 뒤로가기가 곧 닫기 — bottling 방식
- 결정 결과는 부모 mutation

## D — Data Model
```ts
type SheetProps = { open; onClose; title: string; description?; grip? } & ComponentProps<'dialog'>;
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| title | string 필수 | aria-labelledby |
| children |  | 버튼 세로 스택 44px |

## O — Optimization & Observability
- transform 애니메이션 1개
- 지표: 시트에서 "그대로 두기" 비율

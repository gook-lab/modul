# Drawer

> 측면 패널. 폼·상세·필터.

## R — Requirements
- left/right, sm/md/lg, 제목·본문·푸터, 포커스 트랩(<dialog>)
- 슬라이드 320ms, 폼이 길면 본문만 스크롤
- Esc·백드롭·닫기 버튼 → onClose

## A — Architecture
- open 은 URL(?edit=id) 이 소유하면 새로고침에도 유지
- 폼 상태는 Drawer 안의 Form 이

## D — Data Model
```ts
type DrawerProps = { open; onClose; side?; width?; title?; footer? } & ComponentProps<'dialog'>;
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| width | 'sm'|'md'|'lg'|number | 280/360/480 |
| footer | ReactNode | 액션 영역 |

## O — Optimization & Observability
- 열릴 때만 내용 마운트
- < 720px 에서는 Sheet(하단) 로 전환 권장

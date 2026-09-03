# Modal

> 네이티브 <dialog> 모달.

## R — Requirements
- showModal → 포커스 트랩·Esc·::backdrop 은 브라우저
- 열림 320ms fade-up, 닫힐 때 트리거 포커스 복귀(브라우저)
- 액션은 왼쪽 정렬, 확인이 먼저(Modernist)
- 중첩·iOS 스크롤 락 문제 시 Radix Dialog 로 교체(API 동일)

## A — Architecture
- open 은 부모, 컴포넌트는 showModal/close 동기화만
- danger 는 시각 톤만 — 파괴 동작 확인은 호출부

## D — Data Model
```ts
type ModalProps = { open; onClose; title?; danger? } & ComponentProps<'dialog'>;
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| open / onClose |  | close 이벤트 → onClose |
| Modal.Actions | { confirm; cancel; onConfirm; onCancel } |  |

## O — Optimization & Observability
- dialog 는 항상 마운트, open 만 토글(내용 무거우면 조건부)
- 지표: 확인/취소 비율 — 파괴 동작 문구 점검

# Toast

> 낙관적 반영의 실패를 알리고 되돌릴 기회를 주는 앱 셸 컴포넌트.

## R — Requirements
- 앱 셸에 하나, 화면 전환에도 유지
- 4초 자동 소멸, 되돌리기, promise(loading→success/error)
- role=status aria-live=polite — 포커스를 훔치지 않음
- 최대 스택 3, 초과 시 오래된 것 제거

## A — Architecture
- ToastProvider(context) + useToast()
- 타이머는 Provider 소유, 언마운트 시 clear
- local 만

## D — Data Model
- type Toast = { id; message; tone?: 'neutral'|'error'; action?: { label; run }; duration?; pending? }

## I — Interface
- show(msg, opts) → id · dismiss(id) · promise(p, { loading, success, error })
- 이벤트: toast.shown(tone) · toast.action(label) — 되돌리기 클릭률

## O — Optimization & Observability
- 진행 바 CSS 애니메이션(JS 타이머 1개)
- 인버스 표면 위 강조색은 --color-toast-action(dark 는 accent-300, 대비 6.4)
- error 비율 = 낙관적 반영 실패율

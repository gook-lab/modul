# Input

> 단일 행 텍스트 입력. 오류·도움말·접근성이 모이는 곳.

## R — Requirements
- label · placeholder · helper · 오류를 한 묶음, prefix/suffix 슬롯, 네이티브 속성 전부 통과
- INP p75 ≤ 200ms(리렌더는 Field 하나), 오류 문구 출현 시 CLS 0(helper 영역 대체 렌더), 44px(Malt)/36px
- 하지 않는 것: 검증(RHF/zod) · 마스킹(useMask) · 멀티라인(Textarea)

## A — Architecture
- 표현만. 값·검증·제출은 폼 상태 소유
- state = default | error | disabled — 파생 스타일만
- Field 래퍼는 Select · Combobox · Textarea 와 공유
- server 초기값 / local 입력·포커스·비밀번호 표시 / derived aria-invalid·카운터 / URL 은 Combobox 가

## D — Data Model
- type InputOwnProps = { label?; helper?; state?: 'default'|'error'|'disabled'; prefix?; suffix?; fieldProps? } — 값을 들고 있지 않음
- error 는 helper 자리에 대체(두 줄 금지), id 는 useId, label[for]·aria-describedby 는 컴포넌트 책임

## I — Interface
- state · prefix · suffix · fieldProps · ...rest(input) · ref
- 이벤트는 네이티브 그대로. 합성 이벤트 없음
- 관측 없음 — 폼 제출 실패 시 폼이 field id + error code

## O — Optimization & Observability
- 비밀번호 토글은 type 만 변경(리마운트 없음, 커서 유지)
- prefix/suffix 는 내용 폭(flex:none) — measure 없음. 표기는 값이 아니라 포커스 대상이 아닙니다
- aria-invalid + aria-describedby, :focus-visible 링만, axe CI

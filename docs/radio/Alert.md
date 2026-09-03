# Alert

> 인라인 알림 4톤. 문맥 옆에 머무른다.

## R — Requirements
- info · success · warning · error, 제목 + 본문 + 액션 + 닫기
- error 만 role=alert(즉시 읊음), 나머지 status
- 토스트와 역할 분리: 토스트 = 지나가는 결과, Alert = 지속되는 상태

## A — Architecture
- 표시 여부는 부모. 닫기는 onDismiss 콜백만
- 모노 팔레트: 톤은 램프 단계로 구분(채도 아님)

## D — Data Model
```ts
type AlertProps = { tone?; title; action?: { label; onClick }; onDismiss?; icon? };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| tone | enum 4 |  |
| action | { label; onClick } | 한 개만 |

## O — Optimization & Observability
- fade-up 200ms 1회
- 지표: error Alert 노출 수(화면별) = 실패율

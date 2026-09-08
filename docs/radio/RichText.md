# RichText

> 저장된 일반 텍스트를 문단·줄바꿈·안전한 링크로 표시하는 읽기 전용 구성 요소.

## R — Requirements
- 연속된 줄과 빈 줄을 각각 줄바꿈과 문단으로 구분합니다.
- 값이 없을 때는 호출자가 전달한 빈 상태를 표시합니다.
- 자동 링크는 허용된 URL만 실제 링크로 변환합니다.

## A — Architecture
- 입력 문자열을 표시 직전에 문단과 줄로 나눕니다.
- HTML 문자열을 직접 주입하지 않고 React 노드로 출력합니다.

## D — Data Model
```ts
type RichTextValue = string | null | undefined;
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| value | string \| null | 표시할 텍스트 |
| autolink | boolean | URL 자동 연결 |
| fallback | ReactNode | 빈 값 표시 |

## O — Optimization & Observability
- 값이 바뀔 때만 텍스트를 다시 분해합니다.
- 링크에는 안전한 프로토콜과 외부 이동 속성을 적용합니다.

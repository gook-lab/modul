# Kbd / Code

> 단축키·코드 표기.

## R — Requirements
- Kbd(키 배열) · Code(인라인) · CodeBlock(줄번호·하이라이트·복사)
- 복사 → 피드백 ≤ 100ms, 1.2초 후 원복
- 구문 강조는 서버(shiki) — bottling 은 dangerouslySetInnerHTML 금지

## A — Architecture
- 정적 표현. 복사 상태만 local

## D — Data Model
```ts
type CodeBlockProps = { children: string; lang?; highlight?: number[]; copy?; lineNumbers? };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| keys | string[] | Kbd |
| highlight | number[] | 1-based |

## O — Optimization & Observability
- 줄 ≤ 200 — 그 이상은 접기
- 복사 버튼 aria-live

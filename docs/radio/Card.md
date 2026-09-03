# Card

> 표면색 하나로 구분되는 콘텐츠 카드.

## R — Requirements
- kicker · title · body · meta · image 슬롯 · elevation · 클릭형(as=a)
- 그리드 3열 → 1열 접힘은 부모 container query
- 이미지는 grayscale, 16:9 고정(CLS 0)

## A — Architecture
- 표현만. 클릭형은 as="a" 로 링크 시맨틱 — onClick div 금지
- hover lift 는 클릭형에만

## D — Data Model
```ts
type CardOwnProps = { kicker?; title?; meta?; image?: ReactNode; elevation? };
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| image | ReactNode | aspect-ratio 16/9 래퍼 |
| as | 'article' | 'a' | 클릭형 |

## O — Optimization & Observability
- 이미지 loading=lazy decoding=async
- 카드 노드 ≈ 8. 그리드 60장 = 480 노드, 그 이상은 페이지네이션

# Avatar

> 이니셜 폴백 아바타 + 그룹.

## R — Requirements
- 4 크기, 사진은 grayscale, 상태점, Group 은 +N
- 이름 첫 글자(한글) / 이니셜 2자(영문)
- role=img aria-label=이름

## A — Architecture
- 표현만. 사진 URL·상태는 부모

## D — Data Model
```ts
type AvatarProps = { name; src?; size?; shape?; status? };
type AvatarGroupProps = { people: { name; src? }[]; max? };
```

## 결정 — 모양
기본 `circle`(rounded-full). 얼굴은 관례상 원이고 Modernist 의 radius 0 은 컨테이너 규칙이라 아바타는 예외로 둔다. 값은 `--radius-avatar`(50%) 한 토큰 — 브랜드가 사각을 원하면 토큰만 0. `shape="square"` 는 로고·팀 마크 같은 비인물용.

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| size | 'xs'|'sm'|'md'|'lg'|number |  |
| max | number | Group 초과분 +N |

## O — Optimization & Observability
- img 는 lazy. 실패 시 onError 로 이니셜 폴백
- Group ≤ 6 표시 — 그 이상은 의미 없음

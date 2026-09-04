# FileDrop

> 범용 파일 드롭.

## R — Requirements
- 드롭·클릭, accept·multiple·maxSize, 항목별 진행률·오류
- 드롭 → 목록 반영 ≤ 50ms (검증만, 업로드는 비동기)
- 진짜 input 은 시각적으로만 숨김(스크린리더 도달), Enter/Space 로 파일 선택

## A — Architecture
- files(UploadItem[]) 부모 소유, onFiles 로 File[] 만 넘김
- 업로드·재시도는 부모 훅이 맡습니다. 컴포넌트는 fetch 를 모릅니다

## D — Data Model
```ts
type UploadItem = { id; name; size; progress; error? };
// File 객체는 상태에 두지 않습니다
```

## I — Interface
| prop | type | 비고 |
| --- | --- | --- |
| onFiles | (files: File[]) => void | 검증 통과분만 |
| files / onRemove | UploadItem[] | 진행률 표시 |
| ...rest | ComponentProps<'input'> | accept, multiple |

## O — Optimization & Observability
- 목록 ≤ 20 가정
- 지표: 거부 사유 분포(크기·형식) → 안내 문구 조정

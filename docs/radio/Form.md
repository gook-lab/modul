# Form

> React Hook Form과 스키마 검증을 MODUL 입력 컴포넌트에 연결하는 폼 구성 요소.

## R — Requirements
- 라벨·도움말·오류 메시지를 입력 요소와 연결합니다.
- 제출 중에는 중복 제출을 막고, 오류가 있는 첫 필드로 이동할 수 있어야 합니다.
- 반복 필드는 최소·최대 개수와 추가·삭제 동작을 함께 제공합니다.

## A — Architecture
- 값과 검증 상태는 React Hook Form이 소유합니다.
- Form·Field·FieldArray·SubmitButton은 상태를 새로 만들지 않고 폼 컨텍스트를 사용합니다.

## D — Data Model
```ts
type FormValues = Record<string, unknown>;
type FieldPath<T> = Path<T>;
```

## I — Interface
| component | 역할 |
| --- | --- |
| Form | submit과 폼 컨텍스트 연결 |
| Field | 라벨·도움말·오류와 입력 요소 연결 |
| FieldArray | 반복 필드 추가·삭제 |
| SubmitButton | 제출 상태 표시와 중복 제출 방지 |

## O — Optimization & Observability
- 필드 단위 구독을 사용해 관련 없는 입력의 재렌더링을 줄입니다.
- 검증 실패와 제출 실패를 구분해 호출자가 추적할 수 있게 합니다.

# 버저닝

`pnpm changeset` → 변경 요약 + patch/minor/major. `pnpm release` 가 CHANGELOG 와 버전을 올린다. ui·motion·tokens 는 fixed 그룹(같은 버전).

## 컴포넌트 상태
| 상태 | 뜻 |
| --- | --- |
| stable | API 고정, breaking 은 major |
| beta | 스토리북 인덱스에 표시, minor 에서 바뀔 수 있음 |
| deprecated | 다음 major 에서 제거, 대체 명시 |

현재: Button · Input · Tag · Card · Table · Modal · Toast = stable / 나머지 = beta.

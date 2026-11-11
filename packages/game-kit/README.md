# @gook-lab/game-kit

토이 게임 레포 셋(dokkaebi-quest · voxel-dungeon · dotori-isle)에 복사돼 있던 공용 코드를 모은 패키지입니다. 빌드 산출물이 없고 TS 소스를 그대로 냅니다. 소비 쪽 TypeScript 와 번들러가 직접 읽습니다.

## 들어 있는 것 — 서브패스 세 개

| 서브패스 | 내용 |
| --- | --- |
| `./rng` | `mulberry32` 시드 난수, `hashString` FNV-1a 해시 |
| `./josa` | `josa` · `particle`, 받침에 맞춘 조사 (`이/가` · `은/는` · `을/를` · `과/와` · `으로/로`) |
| `./link` | QR 코드 인코더 `qrMatrix`, 연결 코드 `packCode` · `unpackCode`, 초대 링크 함수 |

`josa` 는 dokkaebi-quest 의 규칙을 따릅니다. 숫자 끝과 영문 끝의 받침 판정이 다른 레포의 구현과 다르므로, 다른 레포에서 옮길 때는 입력이 한글 낱말인지 먼저 확인합니다.

## 설치 — 태그 고정

```json
"@gook-lab/game-kit": "github:gook-lab/modul#<태그>&path:packages/game-kit"
```

버전은 태그로 고정합니다. 태그를 올리기 전에는 소비 레포 세 곳의 테스트와 빌드가 통과하는지 확인합니다.

## 테스트

```sh
pnpm --filter @gook-lab/game-kit test
```

`tsc` 로 엄격한 설정(`noUncheckedIndexedAccess` · `verbatimModuleSyntax` · `erasableSyntaxOnly`)을 먼저 확인하고, `vitest` 로 동작을 확인합니다.

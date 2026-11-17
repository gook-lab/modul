# @gook-lab/game-kit

토이 게임 레포 셋(dokkaebi-quest · voxel-dungeon · dotori-isle)에 복사돼 있던 공용 코드를 모은 패키지입니다. 빌드 산출물이 없고 TS 소스를 그대로 냅니다. 소비 쪽 TypeScript 와 번들러가 직접 읽습니다.

## 들어 있는 것 — 서브패스 세 개

| 서브패스 | 내용 |
| --- | --- |
| `./rng` | `mulberry32` 시드 난수, `hashString` FNV-1a 해시 |
| `./josa` | `josa` · `particle`, 받침에 맞춘 조사 (`이/가` · `은/는` · `을/를` · `과/와` · `으로/로`) |
| `./link` | QR 코드 인코더 `qrMatrix`, 연결 코드 `packCode` · `unpackCode`, 초대 링크 함수 |
| `./rtc` | WebRTC 데이터 채널 통신로 `createHostInvite` · `answerInvite` · `RtcLink`, 오류 `IceError` · `NetError`, 기본 문구 `DEFAULT_RTC_MESSAGES` |

`josa` 는 dokkaebi-quest 의 규칙을 따릅니다. 숫자 끝과 영문 끝의 받침 판정이 다른 레포의 구현과 다르므로, 다른 레포에서 옮길 때는 입력이 한글 낱말인지 먼저 확인합니다.

## rtc — 옵션으로 ICE 서버와 문구를 받는다

`createHostInvite(options?)` · `answerInvite(code, options?)` 는 `RtcOptions` 를 받습니다.

- `iceServers: () => Promise<RTCIceServer[]>` — 연결을 만들 때마다 불러 씁니다. 없으면 `STUN_SERVERS` 를 씁니다. TURN 설정이나 `/api/turn` 호출은 이 함수 안에서 소비 레포가 합칩니다.
- `messages: Partial<RtcMessages>` — 빠진 항목만 `DEFAULT_RTC_MESSAGES`(해요체)를 씁니다. `{hint}` 자리는 `connectHint` · `iceHint` 로 채웁니다.

`RtcLink` 는 끊김을 한 번만 알리고, 끊긴 뒤 `onClose` 를 달아도 바로 한 번 알립니다. `close()` 는 마지막 글이 나갈 300ms 를 두고 연결을 닫습니다.

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

# ImageUpload

> AvatarUpload(단일) · ImageGallery(다중, 순서, 대표). 목격 기록 사진의 핵심 경로.

## R — Requirements
- 드롭·클릭·붙여넣기, 이미지 MIME 만, 2MB 제한, 최대 N 장
- 선택 즉시 로컬 미리보기(≤ 50ms, createObjectURL) — 업로드 완료를 기다리지 않는다
- 장당 진행률 2px 룰, 실패 시 해당 장만 오류 표시 + 재시도
- 드래그 순서 변경, 첫 장 = 대표. 키보드 대안: 항목 포커스 후 ←→ 이동 — 옮긴 뒤 같은 사진에 포커스가 남아 연속 이동이 되고, 결과는 aria-live 로 읽어 줍니다
- 회색조 규칙: 미리보기도 grayscale

## A — Architecture
- value(ImageItem[]) 는 부모 소유 — 진행률도 value 안에(부모가 서버 URL 로 교체)
- onUpload(file, onProgress) => Promise<url> 하나로 서버 결합. 컴포넌트는 fetch 를 모른다(bottling 경계)
- optimistic: 로컬 URL 로 먼저 그리고 서버 URL 로 교체. 실패하면 error 표시, 자동 제거하지 않음

## D — Data Model
```ts
type ImageItem = { id: string; url: string; progress?: number; alt?: string; error?: string };
// 5장 × (id, url, progress) — File 객체는 상태에 넣지 않는다(직렬화 불가, 메모리)
```

## I — Interface
- value · onChange · max · maxSize · onUpload · onError · reorder · shape(avatar)
- 서버: POST /uploads multipart → { url } · 진행률은 XHR upload.onprogress
- 이벤트: upload.start / upload.fail(reason) / upload.reorder

## O — Optimization & Observability
- createObjectURL 은 제거 시 revokeObjectURL — 누수 방지
- 썸네일은 <img> 대신 background-image? 아니오 — alt 가 필요하므로 <img loading=lazy decoding=async>
- 5장 × 노드 6 = 30 노드. 100장 갤러리는 이 컴포넌트가 아님(가상화 리스트)
- 지표: 업로드 실패율, 평균 장수, 순서 변경 사용률

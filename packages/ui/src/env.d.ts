/**
 * 번들러가 치환하는 import.meta.env 의 최소 선언.
 * 라이브러리가 vite/client 타입에 의존하지 않도록 여기서만 좁게 정의합니다.
 */
interface ImportMetaEnv {
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly MODE?: string;
}
interface ImportMeta {
  readonly env?: ImportMetaEnv;
}

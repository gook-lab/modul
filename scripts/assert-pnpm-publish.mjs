/**
 * npm 으로 pack · publish 하는 것을 막습니다.
 *
 * 이 저장소의 패키지는 peerDependencies 에 `"@modul/tokens": "workspace:*"` 를 씁니다.
 * pnpm 은 pack · publish 할 때 이걸 실제 버전(`0.1.0`)으로 치환하지만 npm 은 그대로 내보냅니다.
 * 그 결과물을 설치하면 소비자 쪽에서 이렇게 끝납니다.
 *
 *   npm error code EUNSUPPORTEDPROTOCOL
 *   npm error Unsupported URL Type "workspace:": workspace:*
 *
 * 실측(2026-09-04): npm pack 산출물은 설치 자체가 실패하고, pnpm pack 산출물은
 * 진입점 5개가 모두 정상 해석됩니다. 그래서 도구를 강제합니다.
 */
const ua = process.env.npm_config_user_agent ?? '';

if (!ua.startsWith('pnpm')) {
  console.error(
    [
      '',
      '  이 패키지는 pnpm 으로만 pack · publish 할 수 있습니다.',
      `  지금 실행한 도구: ${ua || '(알 수 없음)'}`,
      '',
      '  peerDependencies 의 workspace:* 를 치환하는 것은 pnpm 뿐이라,',
      '  npm 으로 내보내면 소비자가 EUNSUPPORTEDPROTOCOL 로 설치에 실패합니다.',
      '',
      '    pnpm pack                 # 로컬 확인',
      '    pnpm release              # 버전 + 빌드 + 배포',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

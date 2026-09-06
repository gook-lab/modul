import type { API, FileInfo } from 'jscodeshift';

/**
 * bottling 의 `@malt/ui-web` import 중 **@gook-lab/malt-ui 에 API 가 그대로 있는
 * 것만** 옮깁니다. 처음 쓴 버전은 "나머지 전부 → @gook-lab/ui" 였는데, 실물을
 * 대조하니 어긋났습니다(2026-09-07 실측).
 *
 * - Rule · Skeleton · OfflineNote · TextField · TextArea · LoadMore · CheckboxRow ·
 *   FileField · DateTimeField 는 MODUL 에 같은 이름이 없습니다 — 남깁니다
 * - Toggle 은 Switch 로 개명할 것이 아니라 malt-ui 에 API 동일(on/onChange/label)
 *   Toggle 이 이미 있습니다 — 경로만 옮깁니다
 * - Button 은 ui-web 쪽이 busy · busyLabel · disabledReason(2026-08-26 사고 계약)을
 *   가진 상위집합이라 이동하지 않고, ui-web Button 이 MODUL Button 을 감싸는
 *   어댑터가 됩니다
 * - variant="amber" 치환도 지웠습니다 — bottling Button 의 실제 variant 는
 *   primary/secondary/quiet 이고 amber 는 없습니다
 */
export const MOVE_TO_MALT = new Set([
  'StockBadge', 'AmountBar', 'IndexRow', 'StepBar', 'NumberField', 'ChipGroup', 'Toggle',
]);

export default function transform(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  root.find(j.ImportDeclaration, { source: { value: '@malt/ui-web' } }).forEach(p => {
    const specs = p.node.specifiers ?? [];
    const malt = specs.filter(
      s => s.type === 'ImportSpecifier' && s.imported.type === 'Identifier' && MOVE_TO_MALT.has(s.imported.name),
    );
    if (malt.length === 0) return;
    const stay = specs.filter(s => !malt.includes(s));
    const out = [j.importDeclaration(malt, j.literal('@gook-lab/malt-ui'), p.node.importKind ?? 'value')];
    if (stay.length) out.push(j.importDeclaration(stay, j.literal('@malt/ui-web'), p.node.importKind ?? 'value'));
    j(p).replaceWith(out);
  });
  return root.toSource({ quote: 'single' });
}

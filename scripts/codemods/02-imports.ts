import type { API, FileInfo } from 'jscodeshift';
const RENAME: Record<string, string> = { Toggle: 'Switch' };
const KEEP_IN_MALT = new Set(['StockBadge', 'AmountBar', 'IndexRow', 'StepBar', 'NumberField', 'ChipGroup']);
export default function transform(file: FileInfo, api: API) {
  const j = api.jscodeshift; const root = j(file.source);
  root.find(j.ImportDeclaration, { source: { value: '@malt/ui-web' } }).forEach(p => {
    const specs = p.node.specifiers ?? [];
    const malt = specs.filter(s => s.type === 'ImportSpecifier' && KEEP_IN_MALT.has(s.imported.name));
    const modul = specs.filter(s => !malt.includes(s)).map(s => { if (s.type === 'ImportSpecifier' && RENAME[s.imported.name]) { const local = s.local?.name ?? s.imported.name; return j.importSpecifier(j.identifier(RENAME[s.imported.name]), j.identifier(local === s.imported.name ? RENAME[s.imported.name] : local)); } return s; });
    const out = []; if (modul.length) out.push(j.importDeclaration(modul, j.literal('@modul/ui'))); if (malt.length) out.push(j.importDeclaration(malt, j.literal('@malt/ui-web-next')));
    j(p).replaceWith(out);
  });
  // Toggle props: on → checked, onChange → onCheckedChange
  root.find(j.JSXOpeningElement, { name: { name: 'Toggle' } }).forEach(p => { p.node.name = j.jsxIdentifier('Switch'); p.node.attributes?.forEach(a => { if (a.type === 'JSXAttribute') { if (a.name.name === 'on') a.name.name = 'checked'; if (a.name.name === 'onChange') a.name.name = 'onCheckedChange'; } }); });
  root.find(j.JSXClosingElement, { name: { name: 'Toggle' } }).forEach(p => { p.node.name = j.jsxIdentifier('Switch'); });
  // Button variant amber → primary
  root.find(j.JSXAttribute, { name: { name: 'variant' }, value: { value: 'amber' } }).forEach(p => { (p.node.value as any).value = 'primary'; });
  return root.toSource({ quote: 'single' });
}

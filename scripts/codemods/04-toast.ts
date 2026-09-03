import type { API, FileInfo } from 'jscodeshift';
/** toast.show(msg, { undo }) → toast.show(msg, { action: { label: '되돌리기', run: undo } }) */
export default function transform(file: FileInfo, api: API) {
  const j = api.jscodeshift; const root = j(file.source);
  root.find(j.CallExpression, { callee: { property: { name: 'show' } } }).forEach(p => {
    const opts = p.node.arguments[1]; if (!opts || opts.type !== 'ObjectExpression') return;
    const undo = opts.properties.find((pr: any) => pr.key?.name === 'undo'); if (!undo) return;
    opts.properties = opts.properties.filter(pr => pr !== undo);
    opts.properties.push(j.property('init', j.identifier('action'), j.objectExpression([j.property('init', j.identifier('label'), j.literal('되돌리기')), j.property('init', j.identifier('run'), (undo as any).value)])));
  });
  return root.toSource({ quote: 'single' });
}

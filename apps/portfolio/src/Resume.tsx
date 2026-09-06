import { RichText } from '@gook-lab/ui';
/** 이력서 — 화면과 인쇄가 같은 마크업. 인쇄 시 print.css 의 .resume 규칙(10pt, 1.45, 섹션 분할 금지). window.print() 버튼은 data-print=hide */
export function Resume({ me, roles, projects }: { me: { name: string; title: string; email: string; site: string; summary: string }; roles: { org: string; role: string; period: string; body: string }[]; projects: { name: string; oneLiner: string; year: string }[] }) {
  return (
    <article className="resume" style={{ maxWidth: 760, margin: '0 auto', padding: 48, display: 'grid', gap: 28 }}>
      <header style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'end' }}>
        <div><h1 style={{ margin: 0, fontSize: 40, lineHeight: 1 }}>{me.name}</h1><div style={{ marginTop: 8, fontSize: 15, color: 'var(--color-neutral-700)' }}>{me.title}</div></div>
        <address style={{ fontStyle: 'normal', fontSize: 12, textAlign: 'right', lineHeight: 1.7 }}><a href={`mailto:${me.email}`}>{me.email}</a><br /><a href={me.site}>{me.site.replace(/^https?:\/\//, '')}</a></address>
      </header>
      <div className="hr" />
      <RichText value={me.summary} style={{ fontSize: 15, maxWidth: '60ch' }} />
      <section>
        <h2 style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent-700)', margin: '0 0 12px' }}>경력</h2>
        {roles.map(r => <div key={r.org + r.period} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, padding: '12px 0', borderTop: '1px solid var(--color-divider)' }}><div style={{ fontSize: 12, color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums' }}>{r.period}</div><div><b>{r.org}</b> · {r.role}<RichText value={r.body} style={{ fontSize: 14, marginTop: 4, color: 'var(--color-neutral-800)' }} /></div></div>)}
      </section>
      <section>
        <h2 style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent-700)', margin: '0 0 12px' }}>프로젝트</h2>
        <table className="table"><tbody>{projects.map(p => <tr key={p.name}><td style={{ fontWeight: 600, width: '30%' }}>{p.name}</td><td>{p.oneLiner}</td><td style={{ textAlign: 'right', color: 'var(--color-neutral-700)', fontVariantNumeric: 'tabular-nums' }}>{p.year}</td></tr>)}</tbody></table>
      </section>
      <button type="button" className="btn btn-secondary" data-print="hide" onClick={() => window.print()} style={{ justifySelf: 'start' }}>PDF 로 저장</button>
    </article>
  );
}

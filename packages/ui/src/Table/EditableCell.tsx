import { useEffect, useRef, useState } from 'react';
import { guardIme } from '../utils/keyboard';
/**
 * 인라인 편집 셀. 표시 상태는 <button>(포커스 가능, Enter/F2 로 편집), 편집 상태는 <input> — 셀 크기 그대로(CLS 0).
 * 저장 중엔 값 유지 + 흐리게, 실패하면 편집 상태 복귀 + role=alert.
 */
export function EditableCell({ value, onCommit, type = 'text', align }: { value: string; onCommit: (v: string) => void | Promise<void>; type?: 'text' | 'number'; align?: 'left' | 'right' }) {
  const [edit, setEdit] = useState(false); const [draft, setDraft] = useState(value); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (edit) { ref.current?.focus(); ref.current?.select(); } }, [edit]);
  useEffect(() => { if (!edit) setDraft(value); }, [value, edit]);
  const commit = async () => { if (draft === value) return setEdit(false); setBusy(true); setErr(null); try { await onCommit(draft); setEdit(false); } catch (e) { setErr(e instanceof Error ? e.message : '저장 실패'); ref.current?.focus(); } finally { setBusy(false); } };
  if (!edit) return (
    <button type="button" className="cell-edit" onClick={() => setEdit(true)} onKeyDown={e => { if (e.key === 'Enter' || e.key === 'F2') setEdit(true); }} title="Enter 로 편집"
      style={{ all: 'unset', display: 'block', width: '100%', minHeight: 32, padding: '0 6px', margin: '0 -6px', boxSizing: 'content-box', textAlign: align, cursor: 'text', opacity: busy ? .5 : 1, borderBottom: '1px dashed transparent' }}>{value || <span style={{ color: 'var(--color-neutral-500)' }}>—</span>}</button>
  );
  return (
    <span style={{ display: 'block', position: 'relative' }}>
      <input ref={ref} type={type} value={draft} disabled={busy} aria-invalid={!!err || undefined} aria-describedby={err ? 'cell-err' : undefined} onChange={e => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={guardIme(e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } else if (e.key === 'Escape') { setDraft(value); setEdit(false); } else if (e.key === 'Tab') { commit(); } })}
        style={{ all: 'unset', display: 'block', width: '100%', minHeight: 32, padding: '0 6px', margin: '0 -6px', boxSizing: 'content-box', textAlign: align, background: 'var(--color-bg)', boxShadow: `inset 0 -2px 0 ${err ? 'var(--color-accent-700)' : 'var(--color-accent)'}`, fontVariantNumeric: type === 'number' ? 'tabular-nums' : undefined }} />
      {err && <span id="cell-err" role="alert" style={{ position: 'absolute', left: 0, top: '100%', fontSize: 11, color: 'var(--color-accent-700)', background: 'var(--color-surface)', padding: '2px 6px', zIndex: 2 }}>{err}</span>}
    </span>
  );
}

import { describe, it, expect } from 'vitest';
import { validateFiles, matchesAccept, validateFilesAsync } from './files';
const mk = (name: string, type: string, size = 1000, lastModified = 1) => new File([new Uint8Array(size)], name, { type, lastModified });
describe('matchesAccept', () => {
  it('확장자 · MIME · 와일드카드', () => {
    expect(matchesAccept(mk('a.csv', 'text/csv'), '.csv,.json')).toBe(true);
    expect(matchesAccept(mk('a.CSV', ''), '.csv')).toBe(true);           // 대소문자, MIME 비어도 확장자로
    expect(matchesAccept(mk('a.png', 'image/png'), 'image/*')).toBe(true);
    expect(matchesAccept(mk('a.svg', 'image/svg+xml'), 'image/png')).toBe(false);
    expect(matchesAccept(mk('a.txt', 'text/plain'), 'image/*')).toBe(false);
  });
});
describe('validateFiles', () => {
  it('형식 · 크기 · 중복(meta) · 개수', () => {
    const a = mk('a.png', 'image/png', 500, 7);
    const r = validateFiles([a, mk('a.png', 'image/png', 500, 7), mk('b.txt', 'text/plain'), mk('big.png', 'image/png', 5e6), mk('c.png', 'image/png'), mk('d.png', 'image/png')], { accept: 'image/*', maxSize: 2e6, max: 3, existing: [{ name: 'x.png', size: 1 }] });
    expect(r.accepted.map(f => f.name)).toEqual(['a.png', 'c.png']);
    expect(r.rejected.map(x => x.reason)).toEqual(['duplicate', 'type', 'size', 'count']);
  });
  it('existing 과의 중복도 잡는다', () => {
    const r = validateFiles([mk('a.png', 'image/png', 500, 7)], { existing: [{ name: 'a.png', size: 500, lastModified: 7 }] });
    expect(r.rejected[0].reason).toBe('duplicate');
  });
  it('content 해시 — 이름이 달라도 같은 내용이면 중복', async () => {
    const r = await validateFilesAsync([mk('one.png', 'image/png', 64), mk('two.png', 'image/png', 64)], { dedupe: 'content' });
    expect(r.accepted).toHaveLength(1); expect(r.rejected[0].reason).toBe('duplicate');
  });
});

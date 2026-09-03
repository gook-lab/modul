import { describe, it, expect } from 'vitest';
import { cx } from './cx';
describe('cx — ! 상위 룰', () => {
  it('variant 를 ! 로 덮어쓴다', () => { expect(cx('btn', 'btn-primary', '!btn-ghost')).toBe('btn btn-ghost'); });
  it('그룹이 다른 클래스는 남는다', () => { expect(cx('btn', 'btn-primary', 'btn-sm', '!btn-ghost', 'mt-4')).toBe('btn btn-sm mt-4 btn-ghost'); });
  it('여러 ! 는 각자 그룹만 제거', () => { expect(cx('tag tag-accent elev-sm', '!tag-outline', '!elev-lg')).toBe('tag tag-outline elev-lg'); });
  it('! 가 없으면 단순 결합 + 중복 제거', () => { expect(cx('a', { b: true, c: false }, ['d', 'a'])).toBe('a b d'); });
  it('Tailwind variant 접두(!hover:bg) 는 건드리지 않는다', () => { expect(cx('btn', '!hover:bg-red')).toBe('btn !hover:bg-red'); });
});

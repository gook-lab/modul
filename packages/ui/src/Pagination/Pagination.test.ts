import { describe, it, expect } from 'vitest';
import { range } from './Pagination';
describe('Pagination.range', () => {
  it('첫/끝 항상, 현재 ±1, 나머지 …', () => { expect(range(6, 12, 1)).toEqual([1, '…', 5, 6, 7, '…', 12]); });
  it('앞쪽에선 … 하나', () => { expect(range(2, 12, 1)).toEqual([1, 2, 3, '…', 12]); });
  it('총 5 이하면 … 없음', () => { expect(range(3, 5, 1)).toEqual([1, 2, 3, 4, 5]); });
  it('siblings 2', () => { expect(range(6, 12, 2)).toEqual([1, '…', 4, 5, 6, 7, 8, '…', 12]); });
});

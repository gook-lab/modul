import { describe, it, expect } from 'vitest';
import { presets, DURATIONS, EASINGS, transition } from './presets';
const DUR = new Set<number>([0, 150, 18000, ...Object.values(DURATIONS)]);
describe('presets — 토큰만 쓴다', () => {
  it('duration · easing 이 토큰 집합 안', () => { for (const p of Object.values(presets)) { expect(DUR.has(p.duration)).toBe(true); expect(Object.keys(EASINGS)).toContain(p.easing); } });
  it('레이아웃 속성 금지', () => { for (const p of Object.values(presets)) expect(p.properties.every(x => ['transform', 'opacity', 'clip-path'].includes(x))).toBe(true); });
  it('reduced 는 transform 없음', () => { for (const p of Object.values(presets)) expect(p.reduced.properties).not.toContain('transform'); });
  it('transition() reduced 변형', () => { expect(transition('reveal')).toContain('transform 320ms'); expect(transition('reveal', true)).toBe('opacity 200ms cubic-bezier(0,0,.2,1)'); expect(transition('move', true)).toBe('none'); });
});

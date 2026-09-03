/** 모션 프리셋 — 이징·지속시간 조합 8종. 컴포넌트는 이 밖의 값을 쓰지 않는다. reduced 는 prefers-reduced-motion 대체 동작 */
export const DURATIONS = { fast: 120, base: 200, slow: 320, page: 720, count: 1400 } as const;
export const EASINGS = { out: 'cubic-bezier(0,0,.2,1)', decel: 'cubic-bezier(.2,.8,.2,1)', inout: 'cubic-bezier(.76,0,.24,1)', linear: 'linear', expo: 'cubic-bezier(.16,1,.3,1)' } as const;
export const SPRING = { stiffness: 300, damping: 24, mass: 1 } as const;
type Prop = 'transform' | 'opacity' | 'clip-path';
export type Preset = { duration: number; easing: keyof typeof EASINGS; properties: Prop[]; reduced: { duration: number; properties: Prop[] } };
export const presets = {
  tap:    { duration: DURATIONS.fast, easing: 'out',    properties: ['opacity'],                 reduced: { duration: 0, properties: [] } },
  reveal: { duration: DURATIONS.slow, easing: 'decel',  properties: ['transform', 'opacity'],    reduced: { duration: DURATIONS.base, properties: ['opacity'] } },
  move:   { duration: DURATIONS.slow, easing: 'decel',  properties: ['transform'],               reduced: { duration: 0, properties: [] } },
  page:   { duration: DURATIONS.page, easing: 'inout',  properties: ['transform'],               reduced: { duration: 150, properties: ['opacity'] } },
  spring: { duration: 0,              easing: 'linear', properties: ['transform'],               reduced: { duration: 0, properties: [] } },
  loop:   { duration: 18000,          easing: 'linear', properties: ['transform'],               reduced: { duration: 0, properties: [] } },
  count:  { duration: DURATIONS.count, easing: 'expo',  properties: ['transform', 'opacity'],    reduced: { duration: 0, properties: [] } },
  scrub:  { duration: 0,              easing: 'linear', properties: ['transform', 'opacity', 'clip-path'], reduced: { duration: 0, properties: ['opacity'] } },
} satisfies Record<string, Preset>;
export type PresetName = keyof typeof presets;
/** CSS transition 문자열. rm=true 면 대체 동작 */
export function transition(name: PresetName, rm = false): string {
  const p = presets[name]; const d = rm ? p.reduced.duration : p.duration; const props = rm ? p.reduced.properties : p.properties;
  if (!d || !props.length) return 'none';
  return props.map(x => `${x} ${d}ms ${rm ? EASINGS.out : EASINGS[p.easing]}`).join(', ');
}

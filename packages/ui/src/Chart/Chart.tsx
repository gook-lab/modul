import { forwardRef, useId, type ComponentPropsWithoutRef } from 'react';
import { cx } from '../utils/cx';
/**
 * 보이는 수준의 차트 3종 — 라이브러리 없음, SVG 인라인.
 * 원칙: 한 색(accent) + 회색. 격자는 가로 1px 만. 축 라벨은 시작·끝·최대만. 값은 표에도 있어야 한다(차트는 보조) — <table class="sr-only"> 자동 생성.
 * 그 이상(툴팁·줌·다중 시리즈)은 이 컴포넌트가 아니다 → visx/recharts 로, 토큰만 공유.
 */
export type Series = { label: string; value: number }[];
type Base = { data: Series; width?: number; height?: number; title: string; /** 값 포맷 */ fmt?: (v: number) => string } & ComponentPropsWithoutRef<'figure'>;
const useScale = (data: Series) => { const max = Math.max(1, ...data.map(d => d.value)); return { max, y: (v: number, h: number) => h - (v / max) * h }; };
const DataTable = ({ data, fmt }: { data: Series; fmt: (v: number) => string }) => <table className="sr-only"><tbody>{data.map(d => <tr key={d.label}><th scope="row">{d.label}</th><td>{fmt(d.value)}</td></tr>)}</tbody></table>;
const Caption = ({ id, title }: { id: string; title: string }) => <figcaption id={id} style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-700)', marginBottom: 10 }}>{title}</figcaption>;
const dflt = (v: number) => v.toLocaleString('ko-KR');

export const BarChart = forwardRef<HTMLElement, Base & { highlight?: number }>(({ data, width = 480, height = 160, title, fmt = dflt, highlight, className, ...rest }, ref) => {
  const id = useId(); const { max, y } = useScale(data); const gap = 2, bw = (width - gap * (data.length - 1)) / data.length; const h = height - 22;
  return (
    <figure ref={ref} aria-labelledby={id} className={cx('chart', 'chart-bar', className)} style={{ margin: 0 }} {...rest}>
      <Caption id={id} title={title} />
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden style={{ display: 'block', overflow: 'visible' }}>
        {[0, .5, 1].map(t => <line key={t} x1={0} x2={width} y1={y(max * t, h)} y2={y(max * t, h)} stroke="var(--color-divider)" strokeWidth={t === 0 ? 2 : 1} />)}
        {data.map((d, i) => <rect key={d.label} x={i * (bw + gap)} y={y(d.value, h)} width={bw} height={h - y(d.value, h)} fill={highlight === i ? 'var(--color-accent)' : 'var(--color-neutral-800)'} />)}
        {data.map((d, i) => (i === 0 || i === data.length - 1 || i === highlight) && <text key={d.label} x={i * (bw + gap) + bw / 2} y={height - 4} textAnchor="middle" fontSize={11} fill="var(--color-neutral-700)">{d.label}</text>)}
        <text x={0} y={y(max, h) - 4} fontSize={11} fill="var(--color-neutral-700)" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(max)}</text>
      </svg>
      <DataTable data={data} fmt={fmt} />
    </figure>
  );
});
BarChart.displayName = 'BarChart';

export const LineChart = forwardRef<HTMLElement, Base & { area?: boolean }>(({ data, width = 480, height = 160, title, fmt = dflt, area = true, className, ...rest }, ref) => {
  const id = useId(); const { max, y } = useScale(data); const h = height - 22; const step = width / Math.max(1, data.length - 1);
  const pts = data.map((d, i) => [i * step, y(d.value, h)] as const); const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const last = data[data.length - 1];
  return (
    <figure ref={ref} aria-labelledby={id} className={cx('chart', 'chart-line', className)} style={{ margin: 0 }} {...rest}>
      <Caption id={id} title={title} />
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden style={{ display: 'block', overflow: 'visible' }}>
        {[0, .5, 1].map(t => <line key={t} x1={0} x2={width} y1={y(max * t, h)} y2={y(max * t, h)} stroke="var(--color-divider)" strokeWidth={t === 0 ? 2 : 1} />)}
        {area && <path d={`${path} L${width},${h} L0,${h} Z`} fill="var(--color-accent-100)" />}
        <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinejoin="round" />
        <rect x={pts[pts.length - 1][0] - 3} y={pts[pts.length - 1][1] - 3} width={6} height={6} fill="var(--color-accent)" />
        <text x={0} y={height - 4} fontSize={11} fill="var(--color-neutral-700)">{data[0]?.label}</text>
        <text x={width} y={height - 4} fontSize={11} textAnchor="end" fill="var(--color-neutral-700)">{last?.label}</text>
        <text x={width} y={pts[pts.length - 1][1] - 8} fontSize={12} fontWeight={600} textAnchor="end" fill="var(--color-accent-700)" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(last?.value ?? 0)}</text>
      </svg>
      <DataTable data={data} fmt={fmt} />
    </figure>
  );
});
LineChart.displayName = 'LineChart';

/** 표 셀·Stat 옆 인라인. 라벨·축 없음, 마지막 점만 강조 */
export const Sparkline = forwardRef<SVGSVGElement, { data: number[]; width?: number; height?: number; label: string } & ComponentPropsWithoutRef<'svg'>>(({ data, width = 80, height = 24, label, className, ...rest }, ref) => {
  const max = Math.max(1, ...data), min = Math.min(...data), r = max - min || 1; const step = width / Math.max(1, data.length - 1);
  const pts = data.map((v, i) => `${i * step},${height - 2 - ((v - min) / r) * (height - 4)}`);
  const up = data[data.length - 1] >= data[0];
  return (
    <svg ref={ref} role="img" aria-label={`${label}: ${data[0]} → ${data[data.length - 1]}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cx('chart', 'chart-spark', className)} style={{ display: 'inline-block', verticalAlign: 'middle', overflow: 'visible' }} {...rest}>
      <polyline points={pts.join(' ')} fill="none" stroke={up ? 'var(--color-neutral-800)' : 'var(--color-accent-700)'} strokeWidth={1.5} strokeLinejoin="round" />
      <rect x={width - 2.5} y={parseFloat(pts[pts.length - 1].split(',')[1]) - 2.5} width={5} height={5} fill={up ? 'var(--color-accent)' : 'var(--color-accent-700)'} />
    </svg>
  );
});
Sparkline.displayName = 'Sparkline';

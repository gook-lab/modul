import { Fragment, type CSSProperties } from 'react';
import { useReducedMotion } from './useReducedMotion';
/** 자릿수별 세로 슬롯. 바뀐 자리만 굴러감(오른콇 자리가 더 오래). 새 자릿수는 폭 0→1ch. reduced: 즉시 */
export function NumberRoller({ value, format, duration = 300, style }: { value: number; format?: (n: number) => string; duration?: number; style?: CSSProperties }) {
  const rm = useReducedMotion(); const str = format ? format(value) : String(Math.max(0, Math.round(value)));
  return (
    <span aria-label={str} style={{ display: 'inline-flex', alignItems: 'baseline', fontVariantNumeric: 'tabular-nums', ...style }}>
      {[...str].map((ch, i) => /\d/.test(ch) ? (
        <span key={`d${i}`} style={{ display: 'inline-block', height: '1em', overflow: 'hidden', width: '1ch', animation: rm ? undefined : 'mdl-grow 400ms var(--ease-decel) both' }} aria-hidden>
          <span style={{ display: 'block', transform: `translateY(calc(-${ch} * 1em))`, transition: rm ? 'none' : `transform ${duration + (str.length - i) * 90}ms var(--ease-decel)` }}>
            {Array.from({ length: 10 }, (_, n) => <span key={n} style={{ display: 'block', height: '1em' }}>{n}</span>)}
          </span>
        </span>
      ) : <Fragment key={`s${i}`}><span aria-hidden>{ch}</span></Fragment>)}
    </span>
  );
}

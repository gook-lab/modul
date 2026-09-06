import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { cx } from '@gook-lab/ui';

/**
 * Radix ToggleGroup 위의 표현 계층입니다 (docs/radio/ChipGroup.md).
 *
 * 처음 버전은 버튼 나열 + aria-pressed 였는데, 그러면 칩 하나하나가 탭
 * 정지점이 되고 화살표로 옮겨 다닐 수 없습니다 — 성향 6개 · 지역 8개에서
 * 키보드로 지나가는 것만 여덟 번입니다(bottling 2026-08-26 확인).
 * Radix 가 roving tabindex · ←→ 이동 · 역할 정리(single=radiogroup)를 맡습니다.
 *
 * 선택 표시는 Radix 의 `data-state=on` 을 CSS 가 봅니다(theme-malt-components.css).
 */
export type ChipOption<V extends string> = { value: V; label: ReactNode };

type Common<V extends string> = {
  /** 묶음의 aria-label. 비우지 마세요 */
  label: string;
  options: readonly ChipOption<V>[];
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue' | 'dir'>;

type SingleProps<V extends string> = Common<V> & {
  type?: 'single';
  value: V | '';
  onChange: (v: V | '') => void;
  /** 고른 것을 다시 눌러 해제할 수 있게 합니다. 기본은 해제 불가 — 값이 비어도
      되는 자리인지는 폼이 정합니다 */
  deselectable?: boolean;
};

type MultipleProps<V extends string> = Common<V> & {
  type: 'multiple';
  value: readonly V[];
  onChange: (v: V[]) => void;
};

export type ChipGroupProps<V extends string> = SingleProps<V> | MultipleProps<V>;

const chips = <V extends string>(options: readonly ChipOption<V>[]) =>
  options.map(o => (
    <ToggleGroup.Item key={o.value} value={o.value} className="malt-chip">
      {o.label}
    </ToggleGroup.Item>
  ));

function ChipGroupInner<V extends string>(props: ChipGroupProps<V>, ref: React.Ref<HTMLDivElement>) {
  if (props.type === 'multiple') {
    const { type, label, options, value, onChange, className, ...rest } = props;
    return (
      <ToggleGroup.Root
        {...rest}
        ref={ref}
        type={type}
        aria-label={label}
        value={[...value]}
        onValueChange={v => onChange(v as V[])}
        className={cx('malt-chip-group', className)}
      >
        {chips(options)}
      </ToggleGroup.Root>
    );
  }

  const { type = 'single', label, options, value, onChange, deselectable, className, ...rest } = props;
  return (
    <ToggleGroup.Root
      {...rest}
      ref={ref}
      type={type}
      aria-label={label}
      value={value}
      onValueChange={v => {
        // Radix 는 같은 항목을 다시 누르면 '' 를 줍니다. 해제 불가면 버립니다.
        if (v === '' && deselectable !== true) return;
        onChange(v as V | '');
      }}
      className={cx('malt-chip-group', className)}
    >
      {chips(options)}
    </ToggleGroup.Root>
  );
}

export const ChipGroup = forwardRef(ChipGroupInner) as <V extends string>(
  p: ChipGroupProps<V> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

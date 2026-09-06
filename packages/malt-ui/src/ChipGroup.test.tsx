import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChipGroup } from './ChipGroup';

const OPTS = [
  { value: 'rich', label: '리치' },
  { value: 'peaty', label: '피티' },
  { value: 'floral', label: '플로럴' },
] as const;

describe('ChipGroup — 단일', () => {
  it('고르면 값이 오고, 기본은 다시 눌러도 해제되지 않는다', async () => {
    const onChange = vi.fn();
    render(<ChipGroup label="성향" options={OPTS} value="rich" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: '피티' }));
    expect(onChange).toHaveBeenLastCalledWith('peaty');
    await userEvent.click(screen.getByRole('radio', { name: '리치' }));
    // 같은 항목 재클릭 → Radix 는 '' 를 주지만 deselectable 이 아니므로 버린다
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('deselectable 이면 재클릭으로 해제된다', async () => {
    const onChange = vi.fn();
    render(<ChipGroup label="잔" options={OPTS} value="rich" onChange={onChange} deselectable />);
    await userEvent.click(screen.getByRole('radio', { name: '리치' }));
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('선택은 data-state=on 으로 드러난다 — CSS 가 이걸 본다', () => {
    render(<ChipGroup label="성향" options={OPTS} value="peaty" onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: '피티' })).toHaveAttribute('data-state', 'on');
    expect(screen.getByRole('radio', { name: '리치' })).toHaveAttribute('data-state', 'off');
  });
});

describe('ChipGroup — 다중', () => {
  it('배열로 주고받는다', async () => {
    const onChange = vi.fn();
    render(<ChipGroup type="multiple" label="성향" options={OPTS} value={['rich']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '피티' }));
    expect(onChange).toHaveBeenLastCalledWith(['rich', 'peaty']);
  });
});

describe('ChipGroup — 계약', () => {
  it('묶음 전체가 탭 정지점 하나다(roving tabindex) — 2026-08-26 사고 재발 방지', async () => {
    function Wrap() {
      const [v, setV] = useState<'rich' | 'peaty' | 'floral' | ''>('rich');
      return <ChipGroup label="성향" options={OPTS} value={v} onChange={setV} />;
    }
    render(
      <>
        <Wrap />
        <button type="button">다음 정지점</button>
      </>,
    );
    // 탭 한 번에 묶음 안으로, 다음 탭에 묶음을 통째로 지나친다
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: '리치' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: '다음 정지점' })).toHaveFocus();
    // 화살표로 항목 이동
    await userEvent.tab({ shift: true });
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '피티' })).toHaveFocus();
  });

  it('...rest 와 className 이 루트에 도달한다', () => {
    render(
      <ChipGroup label="성향" options={OPTS} value="" onChange={() => {}} data-testid="cg" className="extra" />,
    );
    const root = screen.getByTestId('cg');
    expect(root).toHaveClass('malt-chip-group', 'extra');
    expect(root).toHaveAttribute('aria-label', '성향');
  });
});

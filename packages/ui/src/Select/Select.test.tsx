import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';

const opts = [{ value: 'a', label: '진행중' }, { value: 'b', label: '검토' }, { value: 'c', label: '완료' }];

describe('Select — 키보드 계약 (RADIO/I)', () => {
  it('↓ 로 열고 ↓↓ Enter 로 세 번째를 고른다', async () => {
    const onChange = vi.fn(); const u = userEvent.setup();
    render(<Select label="상태" options={opts} value={null} onChange={onChange} />);
    const btn = screen.getByRole('combobox'); btn.focus();
    await u.keyboard('{ArrowDown}'); expect(screen.getByRole('listbox')).toBeInTheDocument();
    await u.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('c');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(btn).toHaveFocus();                       // 닫힌 뒤 포커스 복귀
  });
  it('Esc 는 닫기만, 값은 바꾸지 않는다', async () => {
    const onChange = vi.fn(); const u = userEvent.setup();
    render(<Select options={opts} value="a" onChange={onChange} />);
    screen.getByRole('combobox').focus(); await u.keyboard('{ArrowDown}{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull(); expect(onChange).not.toHaveBeenCalled();
  });
  it('타입어헤드 — 닫힌 상태에서 "완" 을 치면 바로 선택', async () => {
    const onChange = vi.fn(); const u = userEvent.setup();
    render(<Select options={opts} value={null} onChange={onChange} />);
    screen.getByRole('combobox').focus(); await u.keyboard('완');
    expect(onChange).toHaveBeenCalledWith('c');
  });
  it('...rest 가 루트 button 에 도달한다', () => {
    render(<Select options={opts} value={null} onChange={() => {}} data-testid="x" aria-describedby="h" />);
    const b = screen.getByTestId('x'); expect(b.tagName).toBe('BUTTON'); expect(b).toHaveAttribute('aria-describedby', 'h');
  });
});

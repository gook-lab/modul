import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Drawer } from './Drawer';
describe('Drawer — 오버레이 공통 계약', () => {
  it('닫기 버튼 · 백드롭 → onClose, 내부 클릭은 무시', async () => {
    const onClose = vi.fn(); const u = userEvent.setup();
    render(<Drawer open onClose={onClose} title="새 프로젝트"><input aria-label="이름" /></Drawer>);
    await u.click(screen.getByLabelText('이름')); expect(onClose).not.toHaveBeenCalled();
    await u.click(screen.getByRole('button', { name: '닫기' })); expect(onClose).toHaveBeenCalledTimes(1);
    await u.click(screen.getByRole('dialog', { hidden: true })); expect(onClose).toHaveBeenCalledTimes(2);
  });
  it('...rest 가 dialog 에, side/width 는 패널에', () => {
    render(<Drawer open onClose={() => {}} side="left" width={300} data-testid="d">x</Drawer>);
    const d = screen.getByTestId('d'); expect(d.tagName).toBe('DIALOG');
    const aside = d.querySelector('aside')!; expect(aside.style.left).toBe('0px'); expect(aside.style.width).toBe('300px');
  });
});

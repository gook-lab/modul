import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal — 오버레이 공통 계약', () => {
  it('Esc → onClose', async () => {
    const onClose = vi.fn(); const u = userEvent.setup();
    render(<Modal open onClose={onClose} title="확인">본문</Modal>);
    const d = screen.getByRole('dialog', { hidden: true });
    d.dispatchEvent(new Event('close')); // jsdom 은 Esc 를 네이티브로 안 보내므로 close 이벤트로 검증
    expect(onClose).toHaveBeenCalled(); void u;
  });
  it('백드롭 클릭은 닫고, 내부 클릭은 닫지 않는다', async () => {
    const onClose = vi.fn(); const u = userEvent.setup();
    render(<Modal open onClose={onClose} title="확인"><button>내부</button></Modal>);
    await u.click(screen.getByText('내부')); expect(onClose).not.toHaveBeenCalled();
    await u.click(screen.getByRole('dialog', { hidden: true })); expect(onClose).toHaveBeenCalledTimes(1);
  });
});

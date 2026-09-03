import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Tabs } from './Tabs';

describe('Tabs — roving tabindex (Radix)', () => {
  it('Tab 정지는 하나, ←→ 로 이동하며 자동 활성', async () => {
    const u = userEvent.setup();
    render(<Tabs defaultValue="a" items={[{ value: 'a', label: '개요' }, { value: 'b', label: '프로젝트' }]}><Tabs.Panel value="a">A</Tabs.Panel><Tabs.Panel value="b">B</Tabs.Panel></Tabs>);
    await u.tab(); expect(screen.getByRole('tab', { name: '개요' })).toHaveFocus();
    await u.keyboard('{ArrowRight}'); expect(screen.getByRole('tab', { name: '프로젝트' })).toHaveAttribute('aria-selected', 'true'); expect(screen.getByText('B')).toBeVisible();
    await u.tab(); expect(screen.getByRole('tab', { name: '프로젝트' })).not.toHaveFocus(); // 패널로 나감
  });
});

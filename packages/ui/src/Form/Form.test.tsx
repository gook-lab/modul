import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Field, SubmitButton } from './Form';
import { Input } from '../Input/Input';

const schema = z.object({ name: z.string().min(2, '2자 이상'), email: z.string().email('이메일 형식') });
function Demo({ onSubmit }: { onSubmit: (v: Record<string, unknown>) => void }) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: '', email: '' } });
  return <Form form={form} onSubmit={onSubmit}><Field name="name" label="이름">{p => <Input {...p} />}</Field><Field name="email" label="이메일">{p => <Input {...p} />}</Field><SubmitButton>저장</SubmitButton></Form>;
}
describe('Form — 오류 흐름', () => {
  it('검증 실패: 오류는 helper 자리에 role=alert, aria-invalid, 제출 안 됨', async () => {
    const onSubmit = vi.fn(); const u = userEvent.setup();
    render(<Demo onSubmit={onSubmit} />);
    await u.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(2));
    expect(screen.getByLabelText('이름')).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it('통과 시 값 전달, 제출 중 버튼 aria-busy', async () => {
    let resolve!: () => void; const onSubmit = vi.fn(() => new Promise<void>(r => { resolve = r; })); const u = userEvent.setup();
    render(<Demo onSubmit={onSubmit} />);
    await u.type(screen.getByLabelText('이름'), '서연'); await u.type(screen.getByLabelText('이메일'), 'a@b.kr');
    await u.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true'));
    resolve(); await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: '서연', email: 'a@b.kr' }, expect.anything()));
  });
});

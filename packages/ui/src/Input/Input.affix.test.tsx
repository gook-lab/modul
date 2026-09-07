import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input — prefix · suffix (RADIO I 절 이행)', () => {
  it('표기가 없으면 마크업이 예전 그대로다 — 래퍼 없음', () => {
    render(<Input aria-label="이름" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input');
    expect(input.parentElement).toHaveClass('field');
  });

  it('suffix 는 테두리 안에 있고 입력은 맨몸이 된다', () => {
    render(<Input aria-label="도수" suffix="%" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input-plain');
    expect(input).not.toHaveClass('input');
    const wrap = input.parentElement!;
    expect(wrap).toHaveClass('input', 'input-affix');
    expect(wrap).toHaveTextContent('%');
  });

  it('error 상태가 래퍼로 옮겨가고 aria-invalid 는 입력에 남는다', () => {
    render(<Input aria-label="가격" suffix="원" state="error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.parentElement).toHaveClass('input-error');
  });

  it('prefix 도 같은 규칙', () => {
    render(<Input aria-label="금액" prefix="₩" />);
    expect(screen.getByRole('textbox').parentElement).toHaveTextContent('₩');
  });
});

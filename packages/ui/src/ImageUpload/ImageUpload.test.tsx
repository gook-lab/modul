import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ImageGallery, type ImageItem } from './ImageUpload';

/** 드래그는 jsdom 에서 못 재현합니다 — 키보드 대안(RADIO/R)만 검증합니다. */
function Harness({ initial }: { initial: ImageItem[] }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <ImageGallery label="사진" value={value} onChange={setValue} max={5} />
      <output data-testid="order">{value.map(v => v.id).join(',')}</output>
    </>
  );
}
const items: ImageItem[] = [
  { id: 'a', url: 'a.png' }, { id: 'b', url: 'b.png' }, { id: 'c', url: 'c.png' },
];

describe('ImageGallery — 키보드 순서 변경', () => {
  it('→ 로 뒤로, ← 로 앞으로 옮긴다', async () => {
    const u = userEvent.setup();
    render(<Harness initial={items} />);
    const first = screen.getAllByRole('button', { name: /좌우 화살표/ })[0];
    first.focus();
    await u.keyboard('{ArrowRight}');
    expect(screen.getByTestId('order')).toHaveTextContent('b,a,c');
    await u.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('order')).toHaveTextContent('a,b,c');
  });

  it('양 끝에서는 넘어가지 않는다', async () => {
    const u = userEvent.setup();
    render(<Harness initial={items} />);
    screen.getAllByRole('button', { name: /좌우 화살표/ })[0].focus();
    await u.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('order')).toHaveTextContent('a,b,c');
  });

  it('옮긴 뒤에도 같은 사진에 포커스가 남아 연속으로 옮길 수 있다', async () => {
    const u = userEvent.setup();
    render(<Harness initial={items} />);
    screen.getAllByRole('button', { name: /좌우 화살표/ })[0].focus();
    await u.keyboard('{ArrowRight}');
    await u.keyboard('{ArrowRight}');
    expect(screen.getByTestId('order')).toHaveTextContent('b,c,a');
  });

  it('reorder=false 면 순서 변경 핸들이 없다', () => {
    render(<ImageGallery label="사진" value={items} onChange={() => {}} reorder={false} />);
    expect(screen.queryByRole('button', { name: /좌우 화살표/ })).toBeNull();
  });
});

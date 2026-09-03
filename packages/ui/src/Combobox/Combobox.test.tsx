import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Combobox } from './Combobox';

const opts = [{ value: 'lap', label: '라프로익 10', group: '아일라', keywords: ['laphroaig'] }, { value: 'gf', label: '글렌파클라스 15', group: '스페이사이드' }];

describe('Combobox — RADIO/R 요구사항', () => {
  it('타이핑이 곧 필터, Enter 로 첫 결과 선택', async () => {
    const onChange = vi.fn(); const u = userEvent.setup();
    render(<Combobox options={opts} value={null} onChange={onChange} />);
    await u.type(screen.getByRole('combobox'), '글렌');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await u.keyboard('{Enter}'); expect(onChange).toHaveBeenCalledWith('gf');
  });
  it('keywords 로 영문 검색', async () => {
    const u = userEvent.setup();
    render(<Combobox options={opts} value={null} onChange={() => {}} />);
    await u.type(screen.getByRole('combobox'), 'lap');
    expect(screen.getByRole('option')).toHaveTextContent('라프로익');
  });
  it('multiple — Backspace 로 마지막 태그 제거', async () => {
    const onChange = vi.fn(); const u = userEvent.setup();
    render(<Combobox multiple options={opts} value={['lap', 'gf']} onChange={onChange} />);
    screen.getByRole('combobox').focus(); await u.keyboard('{Backspace}');
    expect(onChange).toHaveBeenCalledWith(['lap']);
  });
  it('빈 결과 + creatable → "새로 추가"', async () => {
    const create = vi.fn(); const u = userEvent.setup();
    render(<Combobox options={opts} value={null} onChange={() => {}} creatable={create} />);
    await u.type(screen.getByRole('combobox'), '없는이름');
    await u.click(screen.getByText('새로 추가')); expect(create).toHaveBeenCalledWith('없는이름');
  });
  it('stale 응답은 최신 결과를 덮어쓰지 않는다 (async)', async () => {
    const u = userEvent.setup();
    type Opt = { value: string; label: string };
    const resolvers: Record<string, (v: Opt[]) => void> = {};
    const api = vi.fn((q: string) => new Promise<Opt[]>(res => { resolvers[q] = res; }));
    render(<Combobox options={[]} async={api} value={null} onChange={() => {}} />);
    const input = screen.getByRole('combobox');
    await u.type(input, 'a'); await u.type(input, 'b');       // 요청 'a' 그리고 'ab'
    resolvers['ab']([{ value: '2', label: 'AB 결과' }]);      // 최신이 먼저 도착
    resolvers['a']([{ value: '1', label: 'A 결과' }]);        // 이전 요청이 늦게 도착
    // 하이라이트가 라벨을 <span>/<b> 로 쪼개므로(RADIO/O '하이라이트 indexOf 1회')
    // findByText 는 맞지 않는다. 옵션의 접근성 이름으로 확인한다.
    await screen.findByRole('option', { name: 'AB 결과' });
    expect(screen.queryByRole('option', { name: 'A 결과' })).toBeNull();
  });
});

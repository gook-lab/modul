import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Table, type Column } from './Table';

type Row = { id: string; name: string; budget: number; status: string };
const rows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: `r${i}`, name: `행 ${i}`, budget: i * 10, status: i % 3 === 0 ? '완료' : '진행중' }));

const cols: Column<Row>[] = [
  { key: 'name', header: '이름' },
  { key: 'budget', header: '예산', align: 'right' },
];

describe('Table — virtual 배선', () => {
  it('보이는 구간만 렌더하고 위아래 패딩으로 스크롤 높이를 유지한다', () => {
    const { container } = render(
      <Table rows={rows(1000)} columns={cols} rowKey="id" virtual={{ rowHeight: 44, height: 440 }} />,
    );
    // 440 / 44 = 10행 + overscan 4 → 1000행 전부를 그리지 않는다
    const bodyRows = container.querySelectorAll('tbody tr:not([aria-hidden])');
    expect(bodyRows.length).toBeGreaterThan(0);
    expect(bodyRows.length).toBeLessThan(40);

    const pads = container.querySelectorAll('tbody tr[aria-hidden]');
    expect(pads.length).toBeGreaterThan(0);
    // 스크롤 상단이라 아래쪽 패딩이 남은 행 높이를 채운다
    const padBottom = pads[pads.length - 1] as HTMLElement;
    expect(parseInt(padBottom.style.height, 10)).toBeGreaterThan(1000);
  });

  it('virtual 이 없으면 전 행을 그리고 스크롤 컨테이너도 만들지 않는다', () => {
    const { container } = render(<Table rows={rows(30)} columns={cols} rowKey="id" />);
    expect(container.querySelectorAll('tbody tr').length).toBe(30);
    expect(container.firstElementChild?.tagName).toBe('TABLE');
  });
});

describe('Table — 인라인 편집 배선', () => {
  const editable: Column<Row>[] = [
    { key: 'name', header: '이름' },
    { key: 'budget', header: '예산', align: 'right', inputType: 'number', editable: r => r.status !== '완료', onCommit: vi.fn() },
  ];

  it('editable 컬럼만 편집 셀이 되고 값을 저장한다', async () => {
    const u = userEvent.setup();
    const onCommit = vi.fn();
    const data: Row[] = [{ id: 'a', name: '가', budget: 100, status: '진행중' }];
    render(
      <Table
        rows={data}
        columns={[{ key: 'name', header: '이름' }, { key: 'budget', header: '예산', editable: true, onCommit }]}
        rowKey="id"
      />,
    );
    const cell = screen.getByRole('button', { name: '100' });
    await u.click(cell);
    const input = screen.getByRole('textbox');
    await u.clear(input);
    await u.type(input, '250{Enter}');
    expect(onCommit).toHaveBeenCalledWith(data[0], '250');
  });

  it('editable 이 false 인 행은 편집 셀을 만들지 않는다', () => {
    render(<Table rows={[{ id: 'a', name: '가', budget: 100, status: '완료' }]} columns={editable} rowKey="id" />);
    expect(screen.queryByRole('button', { name: '100' })).toBeNull();
  });

  it('편집 셀 클릭이 행 클릭으로 새지 않는다', async () => {
    const u = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <Table
        rows={[{ id: 'a', name: '가', budget: 100, status: '진행중' }]}
        columns={[{ key: 'budget', header: '예산', editable: true, onCommit: vi.fn() }]}
        rowKey="id"
        onRowClick={onRowClick}
      />,
    );
    await u.click(screen.getByRole('button', { name: '100' }));
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe('Table — rowKey', () => {
  it('컬럼 키 문자열과 함수를 모두 받는다', () => {
    const data = rows(3);
    expect(() => render(<Table rows={data} columns={cols} rowKey="id" />)).not.toThrow();
    expect(() => render(<Table rows={data} columns={cols} rowKey={r => r.id} />)).not.toThrow();
  });
});

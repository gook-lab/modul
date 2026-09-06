import '@gook-lab/tokens/styles.css';
import { Button, Input, Table, Tag, type Column, type TagOwnProps } from '@gook-lab/ui';
import { useCountUp } from '@gook-lab/motion';

type Row = { name: string; owner: string; status: '진행중' | '검토' | '완료'; date: string };
const tone = (s: Row['status']): NonNullable<TagOwnProps['variant']> =>
  s === '진행중' ? 'accent' : s === '검토' ? 'neutral' : 'outline';
const columns: Column<Row>[] = [
  { key: 'name', header: '프로젝트' },
  { key: 'owner', header: '담당' },
  { key: 'status', header: '상태', render: r => <Tag variant={tone(r.status)}>{r.status}</Tag> },
  { key: 'date', header: '업데이트', align: 'right' },
];

export default function App({ rows }: { rows: Row[] }) {
  const active = useCountUp(rows.filter(r => r.status === '진행중').length);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: '100vh' }}>
      <aside style={{ borderRight: '2px solid var(--color-divider)' }} />
      <main>
        <div style={{ display: 'flex', gap: 12, padding: '12px 24px', borderBottom: '2px solid var(--color-divider)', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>프로젝트 현황</h4>
          <Input placeholder="검색…" type="search" name="q" fieldProps={{ style: { marginLeft: 'auto', width: 220 } }} />
          <Button>새 프로젝트</Button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <h2 style={{ color: 'var(--color-accent)' }}>{active}</h2>
          <Table columns={columns} rows={rows} aria-label="프로젝트" onRowClick={r => console.log(r)} />
        </div>
      </main>
    </div>
  );
}

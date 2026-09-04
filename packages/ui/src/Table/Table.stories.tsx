import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, type Column } from './Table';
import type { TagOwnProps } from '../Tag/Tag';
import { Tag } from '../Tag/Tag';

type Row = { name: string; owner: string; status: '진행중' | '검토' | '완료'; date: string };
const rows: Row[] = [
  { name: '어드민 리디자인', owner: '김서연', status: '진행중', date: '2026.09.01' },
  { name: '홈페이지 v3', owner: '박지훈', status: '검토', date: '2026.08.28' },
  { name: '모션 라이브러리', owner: '이도윤', status: '진행중', date: '2026.08.27' },
  { name: '토큰 마이그레이션', owner: '최하늘', status: '완료', date: '2026.08.20' },
];
const tone = (s: Row['status']): NonNullable<TagOwnProps['variant']> =>
  s === '진행중' ? 'accent' : s === '검토' ? 'neutral' : 'outline';
const columns: Column<Row>[] = [
  { key: 'name', header: '프로젝트' }, { key: 'owner', header: '담당' },
  { key: 'status', header: '상태', render: r => <Tag variant={tone(r.status)}>{r.status}</Tag> },
  { key: 'date', header: '업데이트', align: 'right' },
];
const meta: Meta<typeof Table<Row>> = { title: 'Components/Table', component: Table, args: { columns, rows, 'aria-label': '프로젝트' }, parameters: { layout: 'padded' } };
export default meta;
type S = StoryObj<typeof Table<Row>>;
export const Default: S = {};
export const Clickable: S = { args: { onRowClick: r => alert(r.name) } };
export const Empty: S = { args: { rows: [] } };

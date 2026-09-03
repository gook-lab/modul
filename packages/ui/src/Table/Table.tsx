import { forwardRef, type ReactElement, type Ref, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { genericForwardRef } from '../utils/polymorphic';
import type { NativeProps } from '../utils/polymorphic';

export type EditableColumn<T> = { /** 인라인 편집 — 셀 더블클릭/Enter 로 편집, Enter 저장, Esc 취소, Tab 다음 편집 셀 */ editable?: boolean | ((row: T) => boolean); onCommit?: (row: T, value: string) => void | Promise<void>; inputType?: 'text' | 'number' };
export type Column<T> = EditableColumn<T> & {
  key: keyof T & string;
  header: ReactNode;
  align?: 'left' | 'right';
  width?: number | string;
  render?: (row: T) => ReactNode;
};
export type TableOwnProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey?: (row: T, i: number) => string | number;
  onRowClick?: (row: T) => void;
};
export type TableProps<T> = NativeProps<'table', TableOwnProps<T>>;

function TableInner<T>({ columns, rows, rowKey, onRowClick, className, ...rest }: TableProps<T>, ref: React.Ref<HTMLTableElement>) {
  return (
    <table ref={ref} className={cx('table', className)} {...rest}>
      <thead><tr>{columns.map(c => <th key={c.key} style={{ textAlign: c.align, width: c.width }}>{c.header}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={rowKey ? rowKey(r, i) : i} onClick={onRowClick ? () => onRowClick(r) : undefined} style={onRowClick ? { cursor: 'pointer' } : undefined}>
            {columns.map(c => <td key={c.key} style={{ textAlign: c.align }}>{c.render ? c.render(r) : String(r[c.key] ?? '')}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export const Table = genericForwardRef<<T,>(p: TableProps<T> & { ref?: Ref<HTMLTableElement> }) => ReactElement>(
  forwardRef(TableInner),
);

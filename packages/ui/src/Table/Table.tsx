import { forwardRef, type ReactElement, type Ref, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import { genericForwardRef } from '../utils/polymorphic';
import type { NativeProps } from '../utils/polymorphic';
import { EditableCell } from './EditableCell';
import { useVirtualRows } from './useVirtualRows';

export type EditableColumn<T> = { /** 인라인 편집 — 셀 더블클릭/Enter 로 편집, Enter 저장, Esc 취소, Tab 다음 편집 셀 */ editable?: boolean | ((row: T) => boolean); onCommit?: (row: T, value: string) => void | Promise<void>; inputType?: 'text' | 'number' };
export type Column<T> = EditableColumn<T> & {
  key: keyof T & string;
  header: ReactNode;
  align?: 'left' | 'right';
  width?: number | string;
  render?: (row: T) => ReactNode;
};
/** 고정 높이 가상화. RADIO/O: 1,000행부터는 이걸 켜야 DOM 예산 안에 들어옵니다. */
export type TableVirtual = { rowHeight: number; height: number; overscan?: number };
export type TableOwnProps<T> = {
  columns: Column<T>[];
  rows: T[];
  /** 행 식별자. 컬럼 키 하나만 줘도 되고(rowKey="id") 함수로 줘도 됩니다. */
  rowKey?: (keyof T & string) | ((row: T, i: number) => string | number);
  onRowClick?: (row: T) => void;
  /** thead 를 스크롤 상단에 고정. RADIO/O: overflow:auto 부모가 있을 때만 의미가 있습니다. */
  stickyHeader?: boolean;
  virtual?: TableVirtual;
};
export type TableProps<T> = NativeProps<'table', TableOwnProps<T>>;

function TableInner<T>(
  { columns, rows, rowKey, onRowClick, stickyHeader, virtual, className, ...rest }: TableProps<T>,
  ref: React.Ref<HTMLTableElement>,
) {
  // 훅은 조건 없이 부릅니다. virtual 이 없으면 결과를 쓰지 않습니다.
  const v = useVirtualRows(rows.length, virtual?.rowHeight ?? 1, virtual?.height ?? 0, virtual?.overscan);
  const visible = virtual ? rows.slice(v.start, v.end) : rows;
  const offset = virtual ? v.start : 0;

  const keyOf = (row: T, i: number) =>
    typeof rowKey === 'function' ? rowKey(row, i) : rowKey ? String(row[rowKey] ?? i) : i;

  const cell = (c: Column<T>, row: T) => {
    const on = typeof c.editable === 'function' ? c.editable(row) : c.editable;
    if (on && c.onCommit) {
      return (
        <EditableCell
          value={String(row[c.key] ?? '')}
          onCommit={val => c.onCommit!(row, val)}
          type={c.inputType}
          align={c.align}
        />
      );
    }
    return c.render ? c.render(row) : String(row[c.key] ?? '');
  };

  const table = (
    <table
      ref={ref}
      className={cx('table', className)}
      style={virtual ? { tableLayout: 'fixed', width: '100%' } : undefined}
      {...rest}
    >
      <thead style={stickyHeader ? { position: 'sticky', top: 0, zIndex: 1, background: 'var(--color-surface)' } : undefined}>
        <tr>{columns.map(c => <th key={c.key} style={{ textAlign: c.align, width: c.width }}>{c.header}</th>)}</tr>
      </thead>
      <tbody>
        {/* 스크롤 높이를 유지하는 패딩 행 — 실제 행은 보이는 구간만 그립니다. */}
        {virtual && v.padTop > 0 && <tr aria-hidden style={{ height: v.padTop }}><td colSpan={columns.length} /></tr>}
        {visible.map((r, i) => (
          <tr
            key={keyOf(r, offset + i)}
            onClick={onRowClick ? () => onRowClick(r) : undefined}
            style={{ ...(onRowClick ? { cursor: 'pointer' } : null), ...(virtual ? { height: virtual.rowHeight } : null) }}
          >
            {columns.map(c => {
              const editing = (typeof c.editable === 'function' ? c.editable(r) : c.editable) && c.onCommit;
              return (
                // 편집 셀에서의 클릭이 행 클릭으로 새지 않게 막습니다(RADIO/R: 행 클릭과 셀 조작 비충돌).
                <td key={c.key} style={{ textAlign: c.align }} onClick={editing ? e => e.stopPropagation() : undefined}>
                  {cell(c, r)}
                </td>
              );
            })}
          </tr>
        ))}
        {virtual && v.padBottom > 0 && <tr aria-hidden style={{ height: v.padBottom }}><td colSpan={columns.length} /></tr>}
      </tbody>
    </table>
  );

  if (!virtual) return table;
  // sticky thead 는 overflow:auto 부모에서만 동작합니다 — 가상화 컨테이너가 그 부모입니다.
  return <div ref={v.ref} style={v.style}>{table}</div>;
}

export const Table = genericForwardRef<<T,>(p: TableProps<T> & { ref?: Ref<HTMLTableElement> }) => ReactElement>(
  forwardRef(TableInner),
);

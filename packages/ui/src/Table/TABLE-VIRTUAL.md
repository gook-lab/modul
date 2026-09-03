# Table — virtual · editable 조립

```tsx
// 200행 이상: 고정 높이 행만 렌더 (thead 는 sticky, 위/아래 패딩 tr 로 스크롤 높이 유지)
<Table rows={rows} columns={cols} rowKey="id" stickyHeader virtual={{ rowHeight: 44, height: 560 }} />

// 인라인 편집: 컬럼에 editable + onCommit. Table 은 render 대신 <EditableCell> 을 그린다
const cols: Column<Row>[] = [
  { key: 'name', header: '프로젝트' },
  { key: 'budget', header: '예산', align: 'right', editable: r => r.status !== '완료', inputType: 'number', onCommit: (r, v) => api.patch(r.id, { budget: +v }) },
];
```

구현: `useVirtualRows` (의존 없음, 고정 높이) · `EditableCell` (표시=button, 편집=input, 같은 박스 → CLS 0, Enter/Esc/Tab, IME 가드, 실패 시 alert).

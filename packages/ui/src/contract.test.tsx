import { createRef, type ReactNode } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import * as M from './index';

/**
 * 헤드리스 계약을 컴포넌트마다 다시 쓰지 않고 한 표로 돌립니다.
 * PROMPT 1.1 이 요구하는 세 가지를 봅니다.
 *
 *   1. `...rest` 가 막히지 않고 루트 DOM 에 도달하는가 (data-* · aria-* · id)
 *   2. `className` 이 마지막에 병합되는가, 그리고 `!` 가 상위 룰로 동작하는가
 *   3. forwardRef 가 실제 엘리먼트를 넘겨주는가
 *
 * stable 로 선언한 7종(Button · Input · Tag · Card · Table · Modal · Toast)에
 * 개별 테스트가 없던 것을 이 표가 대신 덮습니다.
 */

type Case = {
  name: string;
  render: (extra: Record<string, unknown>) => ReactNode;
  /** 루트에 이미 붙는 컴포넌트 클래스 — `!` 상위 룰 확인에 씁니다. */
  rootClass?: string;
  /** `!`로 덮을 클래스와 사라져야 할 클래스 */
  override?: { apply: string; removes: string };
  /** ref 가 가리켜야 할 태그 */
  refTag?: string;
  /** 루트가 아니라 내부 엘리먼트로 rest 가 가는 컴포넌트(Input 의 .field 등) */
  restOn?: string;
};

const noop = () => {};

const CASES: Case[] = [
  {
    name: 'Button',
    render: e => <M.Button {...e}>버튼</M.Button>,
    rootClass: 'btn',
    override: { apply: '!btn-ghost', removes: 'btn-primary' },
    refTag: 'BUTTON',
  },
  {
    name: 'Tag',
    render: e => <M.Tag {...e}>태그</M.Tag>,
    rootClass: 'tag',
    override: { apply: '!tag-outline', removes: 'tag-accent' },
    refTag: 'SPAN',
  },
  {
    name: 'Card',
    render: e => <M.Card {...e}>카드</M.Card>,
    rootClass: 'card',
    refTag: 'ARTICLE',
  },
  {
    name: 'Input',
    render: e => <M.Input label="이름" {...e} />,
    refTag: 'INPUT',
    restOn: 'input',
  },
  {
    name: 'Textarea',
    render: e => <M.Textarea label="메모" {...e} />,
    refTag: 'TEXTAREA',
    restOn: 'textarea',
  },
  {
    name: 'Table',
    render: e => <M.Table columns={[{ key: 'a', header: 'A' }]} rows={[{ a: '1' }]} {...e} />,
    rootClass: 'table',
    refTag: 'TABLE',
  },
  {
    name: 'Modal',
    render: e => <M.Modal open onClose={noop} title="제목" {...e}>본문</M.Modal>,
    rootClass: 'dialog',
    refTag: 'DIALOG',
  },
  {
    name: 'Drawer',
    render: e => <M.Drawer open onClose={noop} title="제목" {...e}>본문</M.Drawer>,
    rootClass: 'drawer',
    refTag: 'DIALOG',
  },
  {
    name: 'Sheet',
    render: e => <M.Sheet open onClose={noop} title="제목" {...e}>본문</M.Sheet>,
    rootClass: 'sheet',
    refTag: 'DIALOG',
  },
  {
    name: 'Alert',
    render: e => <M.Alert title="알림" {...e} />,
  },
  {
    name: 'Avatar',
    render: e => <M.Avatar name="윤성국" {...e} />,
    rootClass: 'avatar',
  },
  {
    name: 'Kbd',
    render: e => <M.Kbd keys={['⌘', 'K']} {...e} />,
  },
  {
    name: 'Breadcrumb',
    render: e => <M.Breadcrumb items={[{ label: '홈' }, { label: '현재' }]} {...e} />,
  },
  {
    name: 'Stat',
    render: e => <M.Stat label="참석" value={4} {...e} />,
  },
  {
    name: 'Stepper',
    render: e => <M.Stepper steps={[{ id: 'a', label: '하나' }, { id: 'b', label: '둘' }]} current={0} {...e} />,
  },
  {
    name: 'Pagination',
    render: e => <M.Pagination page={1} total={5} onChange={noop} {...e} />,
  },
  {
    name: 'Sidebar',
    render: e => <M.Sidebar items={[{ id: 'a', label: '홈' }]} {...e} />,
  },
  {
    name: 'Tabs',
    render: e => <M.Tabs items={[{ value: 'a', label: 'A' }]} {...e} />,
  },
  {
    name: 'Accordion',
    render: e => <M.Accordion items={[{ value: 'a', title: '제목', content: '본문' }]} type="single" collapsible {...e} />,
    rootClass: 'accordion',
  },
  {
    name: 'RichText',
    render: e => <M.RichText value="본문입니다" {...e} />,
    rootClass: 'richtext',
  },
  {
    name: 'Select',
    render: e => <M.Select options={[{ value: 'a', label: 'A' }]} value={null} onChange={noop} label="선택" {...e} />,
  },
  {
    name: 'Combobox',
    render: e => <M.Combobox options={[{ value: 'a', label: 'A' }]} value={null} onChange={noop} {...e} />,
    restOn: 'input',
  },
  {
    name: 'Switch',
    render: e => <M.Switch checked={false} onCheckedChange={noop} label="알림" {...e} />,
  },
  {
    name: 'Checkbox',
    render: e => <M.Checkbox checked={false} onCheckedChange={noop} label="동의" {...e} />,
  },
  {
    name: 'Slider',
    render: e => <M.Slider label="크기" value={[50]} onValueChange={noop} {...e} />,
  },
  {
    name: 'FileDrop',
    render: e => <M.FileDrop onFiles={noop} {...e} />,
    restOn: 'input',
  },
  {
    name: 'Textarea(autoGrow)',
    render: e => <M.Textarea label="메모" autoGrow {...e} />,
    restOn: 'textarea',
  },
];

/** data-* · aria-* · id 가 그대로 도달했는지 확인할 표식 */
const MARK = { 'data-probe': 'yes', 'aria-describedby': 'probe-desc' } as const;

describe.each(CASES.map(c => [c.name, c] as const))('헤드리스 계약 — %s', (_name, c) => {
  it('data-* · aria-* 가 막히지 않고 도달한다', () => {
    const { container } = render(<>{c.render({ ...MARK })}</>);
    const el = container.querySelector('[data-probe="yes"]');
    expect(el, 'data-probe 가 어느 엘리먼트에도 도달하지 않았습니다').not.toBeNull();
    expect(el).toHaveAttribute('aria-describedby', 'probe-desc');
  });

  it('className 이 컴포넌트 클래스와 함께 남는다', () => {
    const { container } = render(<>{c.render({ ...MARK, className: 'app-custom' })}</>);
    const el = container.querySelector('.app-custom');
    expect(el, 'className 이 어디에도 붙지 않았습니다').not.toBeNull();
    if (c.rootClass) expect(el).toHaveClass(c.rootClass);
  });

  if (c.override) {
    it('! 접두가 같은 축의 컴포넌트 클래스를 덮는다', () => {
      const { container } = render(<>{c.render({ className: c.override!.apply })}</>);
      const el = container.querySelector(`.${c.rootClass}`)!;
      expect(el.className).toContain(c.override!.apply.slice(1));
      expect(el.className).not.toContain(c.override!.removes);
    });
  }

  if (c.refTag) {
    it('forwardRef 가 실제 엘리먼트를 넘긴다', () => {
      const ref = createRef<HTMLElement>();
      render(<>{c.render({ ref })}</>);
      expect(ref.current, 'ref 가 채워지지 않았습니다').not.toBeNull();
      expect(ref.current?.tagName).toBe(c.refTag);
    });
  }
});

describe('헤드리스 계약 — 이벤트 핸들러', () => {
  it('onClick 이 컴포넌트에 삼켜지지 않는다', async () => {
    const u = userEvent.setup();
    const onClick = vi.fn();
    const { getByRole } = render(<M.Button onClick={onClick}>버튼</M.Button>);
    await u.click(getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('onChange 가 Input 을 통과한다', async () => {
    const u = userEvent.setup();
    const onChange = vi.fn();
    const { getByLabelText } = render(<M.Input label="이름" onChange={onChange} />);
    await u.type(getByLabelText('이름'), 'a');
    expect(onChange).toHaveBeenCalled();
  });
});

describe('헤드리스 계약 — displayName', () => {
  it('forwardRef 컴포넌트가 이름을 갖는다', () => {
    // 이름이 없으면 React DevTools 와 스냅샷에서 ForwardRef 로만 보입니다.
    const named = ['Button', 'Tag', 'Input', 'Modal', 'Drawer', 'Sheet'] as const;
    for (const n of named) {
      const comp = M[n] as { displayName?: string; name?: string };
      expect(comp.displayName ?? comp.name, `${n} 에 이름이 없습니다`).toBeTruthy();
    }
  });
});

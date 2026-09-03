import { Command } from 'cmdk';
import * as RDialog from '@radix-ui/react-dialog';
import { useEffect, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type CommandItem = { label: string; icon?: ReactNode; kbd?: string; keywords?: string[]; run: () => void };
export type CommandGroup = { name: string; items: CommandItem[] };
export type CommandPaletteProps = { open: boolean; onOpenChange: (o: boolean) => void; groups: CommandGroup[]; placeholder?: string; hotkey?: boolean } & ComponentPropsWithoutRef<typeof Command>;

/** cmdk (필터·키보드·그룹) + Radix Dialog (모달·포커스 트랩). ⌘K / Ctrl+K */
export function CommandPalette({ open, onOpenChange, groups, placeholder = '명령 또는 페이지 검색…', hotkey = true, ...rest }: CommandPaletteProps) {
  useEffect(() => {
    if (!hotkey) return;
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); onOpenChange(!open); } };
    addEventListener('keydown', h); return () => removeEventListener('keydown', h);
  }, [open, onOpenChange, hotkey]);
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--color-neutral-900) 40%, transparent)', animation: 'mdl-dim 150ms both', display: 'flex', justifyContent: 'center', paddingTop: '12vh', zIndex: 70 }}>
          <RDialog.Content aria-label="명령 팔레트" style={{ width: 'min(560px, calc(100vw - 32px))', alignSelf: 'start', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', boxShadow: 'var(--shadow-lg)', animation: 'mdl-reveal var(--motion-base) var(--ease-decel) both' }}>
            <Command label="명령 팔레트" {...rest}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', borderBottom: '2px solid var(--color-divider)' }}>
                {/* eslint-disable-next-line jsx-a11y/no-autofocus --
                    커맨드 팔레트는 열리는 즉시 입력을 받는 것이 유일한 용도라 autoFocus 가 곧 기능입니다.
                    팔레트는 사용자가 명시적으로 연 오버레이이므로 포커스가 예고 없이 이동하지 않습니다. */}
                <Command.Input autoFocus placeholder={placeholder} style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', font: 'inherit', fontSize: 16, minHeight: 52, color: 'var(--color-text)' }} />
                <kbd style={{ fontSize: 11, padding: '2px 6px', border: '1px solid var(--color-divider)', color: 'var(--color-neutral-700)' }}>esc</kbd>
              </div>
              <Command.List style={{ maxHeight: 320, overflow: 'auto', padding: '6px 0' }}>
                <Command.Empty style={{ padding: '24px 14px', fontSize: 13, color: 'var(--color-neutral-700)' }}>맞는 명령이 없습니다</Command.Empty>
                {groups.map(g => (
                  <Command.Group key={g.name} heading={g.name} className="cmd-group">
                    {g.items.map(it => (
                      <Command.Item key={it.label} value={it.label} keywords={it.keywords} onSelect={() => { it.run(); onOpenChange(false); }} className="cmd-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', minHeight: 40, fontSize: 14, cursor: 'pointer' }}>
                        {it.icon}<span style={{ flex: 1 }}>{it.label}</span>{it.kbd && <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{it.kbd}</span>}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
              <div style={{ display: 'flex', gap: 16, padding: '8px 14px', borderTop: '1px solid var(--color-divider)', fontSize: 11, color: 'var(--color-neutral-700)' }}><span>↑↓ 이동</span><span>↵ 실행</span><span>esc 닫기</span></div>
            </Command>
          </RDialog.Content>
        </RDialog.Overlay>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
/* styles.css:
.cmd-group [cmdk-group-heading]{padding:10px 14px 4px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--color-neutral-600)}
.cmd-item[data-selected=true]{background:var(--color-neutral-200);color:var(--color-accent-700);box-shadow:inset 2px 0 0 var(--color-accent)} */

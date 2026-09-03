// Lucide 재export + 크기 규격. 컴포넌트는 아이콘을 인라인하지 않고 이 패키지에서 가져온다.
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import * as L from 'lucide-react';

export const ICON_SIZE = { sm: 16, md: 20, lg: 24 } as const;
type Size = keyof typeof ICON_SIZE | number;
type LucideIcon = L.LucideIcon;
const wrap = (C: LucideIcon) => forwardRef<SVGSVGElement, Omit<ComponentPropsWithoutRef<'svg'>, 'size'> & { size?: Size }>(({ size = 'sm', ...p }, ref) => <C ref={ref} size={typeof size === 'number' ? size : ICON_SIZE[size]} strokeWidth={2} aria-hidden={p['aria-label'] ? undefined : true} {...p} />);

export const ArrowRight = wrap(L.ArrowRight); export const ArrowUpRight = wrap(L.ArrowUpRight); export const Check = wrap(L.Check); export const X = wrap(L.X);
export const Plus = wrap(L.Plus); export const Minus = wrap(L.Minus); export const Search = wrap(L.Search); export const Menu = wrap(L.Menu);
export const Download = wrap(L.Download); export const Upload = wrap(L.Upload); export const ExternalLink = wrap(L.ExternalLink); export const ChevronDown = wrap(L.ChevronDown);
export const ChevronRight = wrap(L.ChevronRight); export const ChevronLeft = wrap(L.ChevronLeft); export const Square = wrap(L.Square); export const Grid = wrap(L.LayoutGrid);
export const Layers = wrap(L.Layers); export const Type = wrap(L.Type); export const Palette = wrap(L.Palette); export const Settings = wrap(L.Settings);
export const User = wrap(L.User); export const Mail = wrap(L.Mail); export const Calendar = wrap(L.Calendar); export const Filter = wrap(L.Filter);
export const MoreHorizontal = wrap(L.MoreHorizontal); export const Trash = wrap(L.Trash2); export const Eye = wrap(L.Eye); export const EyeOff = wrap(L.EyeOff);
export const Info = wrap(L.Info); export const AlertTriangle = wrap(L.AlertTriangle); export const CircleX = wrap(L.XCircle); export const Image = wrap(L.Image);

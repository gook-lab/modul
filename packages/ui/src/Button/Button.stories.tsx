import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const ArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { children: '시작하기', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    icon: { control: false },
  },
  parameters: { docs: { description: { component: '액션. 라벨은 항상 왼쪽 정렬. headless — 고유 props 외 모든 <button> 속성은 ...rest 로 루트에 전달.' } } },
};
export default meta;
type S = StoryObj<typeof Button>;

export const Primary: S = {};
export const WithIcon: S = { args: { icon: <ArrowRight /> } };
export const Secondary: S = { args: { variant: 'secondary' } };
export const Ghost: S = { args: { variant: 'ghost' } };
export const Sizes: S = { render: a => <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}><Button {...a} size="sm" /><Button {...a} size="md" /><Button {...a} size="lg" /></div> };
export const Disabled: S = { args: { disabled: true } };
/** ...rest — 네이티브 속성 통과 */
export const NativeAttrs: S = { args: { type: 'submit', form: 'contact', 'aria-label': '문의 보내기', 'data-testid': 'cta' } };
/** as="a" — 태그 교체 시 href 허용 */
export const AsLink: S = { render: () => <Button as="a" href="/work" icon={<ArrowRight />}>작업 보기</Button> };
/** asChild — 자식 엘리먼트에 병합 */
export const AsChild: S = { render: () => <Button asChild variant="ghost"><a href="/docs">문서 →</a></Button> };
export const Tones: S = { render: () => <div style={{ display: 'flex', gap: 8 }}><Button tone="danger">삭제</Button><Button tone="danger" variant="secondary">탈퇴</Button><Button tone="danger" variant="ghost">기록 지우기</Button></div> };
export const Rounded: S = { render: () => <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Button rounded="none">토큰(0)</Button><Button rounded="sm">sm</Button><Button rounded="md">md</Button><Button rounded="pill" variant="secondary" icon={<ArrowRight />}>pill</Button></div> };
export const IconStart: S = { args: { icon: <ArrowRight />, iconPosition: 'start', children: '이전으로' } };
export const Block: S = { args: { block: true }, decorators: [S => <div style={{ width: 320 }}><S /></div>] };
export const Loading: S = { args: { loading: true, children: '저장 중' } };

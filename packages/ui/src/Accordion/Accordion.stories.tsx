import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Accordion.md?raw';
import { radioDescription } from '../storybook-radio';
import { Accordion } from './Accordion';
const meta: Meta<typeof Accordion> = { title: 'Components/Accordion', component: Accordion, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Default: StoryObj<typeof Accordion> = { render: () => <Accordion type="single" collapsible items={[{ value: 'tokens', title: '토큰은 어디서 바꾸나요?', content: 'packages/tokens의 테마 파일에서 관리합니다.' }, { value: 'radix', title: 'Radix를 쓰는 기준은 무엇인가요?', content: '포커스와 키보드 동작이 복잡한 컴포넌트에 사용합니다.' }]} /> };

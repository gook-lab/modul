import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/RichText.md?raw';
import { radioDescription } from '../storybook-radio';
import { RichText } from './RichText';
const meta: Meta<typeof RichText> = { title: 'Components/RichText', component: RichText, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Paragraphs: StoryObj<typeof RichText> = { args: { autolink: true, value: '첫 문단입니다.\n같은 문단의 둘째 줄.\n\n빈 줄 하나가 문단을 나눕니다.\n참고: https://example.com/notes' } };
export const Empty: StoryObj<typeof RichText> = { args: { value: null, fallback: <span style={{ color: 'var(--color-neutral-700)' }}>아직 메모가 없습니다.</span> } };

import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Input.md?raw';
import { radioDescription } from '../storybook-radio';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: { label: '이메일', placeholder: 'name@studio.kr', helper: '업무용 이메일을 입력하세요', state: 'default' },
  argTypes: { state: { control: 'inline-radio', options: ['default', 'error', 'disabled'] } },
  decorators: [S => <div style={{ width: 320 }}><S /></div>],
  parameters: { docs: { description: { component: radioDescription(radio) } } },
};
export default meta;
type S = StoryObj<typeof Input>;
export const Default: S = {};
export const Error: S = { args: { state: 'error', helper: '올바른 이메일 형식이 아닙니다' } };
export const Disabled: S = { args: { state: 'disabled' } };
export const NativeAttrs: S = { args: { type: 'email', name: 'email', autoComplete: 'email', required: true, maxLength: 80 } };

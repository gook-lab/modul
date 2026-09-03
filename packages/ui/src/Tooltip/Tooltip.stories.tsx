import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from '../Button/Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: { label: { control: 'text' }, side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] }, children: { control: false } },
  parameters: { docs: { description: { component: 'Radix Tooltip. 포커스에도 표시하고, 터치 기기(pointer: coarse)에서는 렌더하지 않습니다.' } } },
};
export default meta;
type S = StoryObj<typeof Tooltip>;

export const Default: S = {
  args: { label: '변경 내용을 저장합니다', children: <Button variant="secondary">저장</Button> },
};
export const Sides: S = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      {(['top', 'right', 'bottom', 'left'] as const).map(side => (
        <Tooltip key={side} side={side} label={`${side} 방향`}>
          <Button variant="ghost">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

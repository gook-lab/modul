import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Slider.md?raw';
import { radioDescription } from '../storybook-radio';
import { Slider } from './Slider';
const meta: Meta<typeof Slider> = { title: 'Components/Slider', component: Slider, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Single: StoryObj<typeof Slider> = { render: () => { const [value, setValue] = useState([65]); return <Slider label="참석률 필터" value={value} onValueChange={setValue} step={5} unit="%" ticks />; } };
export const Range: StoryObj<typeof Slider> = { render: () => { const [value, setValue] = useState([20, 65]); return <Slider label="회비 범위" value={value} onValueChange={setValue} range step={5} format={x => `${(x * 1000).toLocaleString('ko-KR')}원`} />; } };

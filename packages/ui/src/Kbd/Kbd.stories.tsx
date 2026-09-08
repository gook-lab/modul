import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/KbdCode.md?raw';
import { radioDescription } from '../storybook-radio';
import { Code, CodeBlock, Kbd } from './Kbd';
const meta: Meta<typeof Kbd> = { title: 'Components/Kbd & Code', component: Kbd, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Keys: StoryObj<typeof Kbd> = { render: () => <div style={{ display: 'flex', gap: 16 }}><Kbd keys={['⌘', 'K']} /><Kbd keys={['Shift', '↵']} joiner="+" /><Kbd keys={['Esc']} tone="filled" /></div> };
export const InlineCode: StoryObj<typeof Kbd> = { render: () => <p>토큰은 <Code>var(--color-accent)</Code>처럼 참조합니다.</p> };
export const Block: StoryObj<typeof Kbd> = { render: () => <CodeBlock lang="tsx" highlight={[4]}>{`import { Button } from '@gook-lab/ui';\n\nexport const Save = () => (\n  <Button variant="primary" onClick={save}>저장</Button>\n);`}</CodeBlock> };

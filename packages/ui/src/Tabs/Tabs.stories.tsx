import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Tabs.md?raw';
import { radioDescription } from '../storybook-radio';
import { Tabs } from './Tabs';
const meta: Meta<typeof Tabs> = { title: 'Components/Tabs', component: Tabs, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Default: StoryObj<typeof Tabs> = { render: () => <Tabs defaultValue="overview" items={[{ value: 'overview', label: '개요' }, { value: 'projects', label: '프로젝트', count: 4 }, { value: 'team', label: '팀' }]}><Tabs.Panel value="overview">개요 패널</Tabs.Panel><Tabs.Panel value="projects">프로젝트 패널</Tabs.Panel><Tabs.Panel value="team">팀 패널</Tabs.Panel></Tabs> };

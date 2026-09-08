import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Breadcrumb.md?raw';
import { radioDescription } from '../storybook-radio';
import { Breadcrumb } from './Breadcrumb';
const meta: Meta<typeof Breadcrumb> = { title: 'Components/Breadcrumb', component: Breadcrumb, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Default: StoryObj<typeof Breadcrumb> = { render: () => <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '프로젝트', href: '/projects' }, { label: '디자인 시스템', href: '/projects/design-system' }, { label: '컴포넌트' }]} /> };
export const Overflow: StoryObj<typeof Breadcrumb> = { render: () => <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '프로젝트', href: '/projects' }, { label: '어드민 리디자인', href: '/projects/admin' }, { label: '디자인 시스템', href: '/projects/admin/design-system' }, { label: '컴포넌트', href: '/projects/admin/design-system/components' }, { label: 'Button' }]} /> };

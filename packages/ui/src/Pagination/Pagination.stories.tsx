import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Pagination.md?raw';
import { radioDescription } from '../storybook-radio';
import { Pagination } from './Pagination';
const meta: Meta<typeof Pagination> = { title: 'Components/Pagination', component: Pagination, tags: ['autodocs'], parameters: { docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Default: StoryObj<typeof Pagination> = { render: () => { const [page, setPage] = useState(3); return <Pagination page={page} total={12} onChange={setPage} />; } };

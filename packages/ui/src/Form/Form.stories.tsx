import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import radio from '../../../../docs/radio/Form.md?raw';
import { radioDescription } from '../storybook-radio';
import { Input } from '../Input/Input';
import { FieldArray } from './FieldArray';
import { Form, SubmitButton, createField } from './Form';

const schema = z.object({ name: z.string().min(2, '2자 이상 입력하세요'), contacts: z.array(z.object({ email: z.string().email('이메일 형식') })).min(1, '하나는 필요합니다') });
type Values = z.infer<typeof schema>;
const Field = createField<Values>();
const meta: Meta<typeof Form<Values>> = { title: 'Components/Form', component: Form<Values>, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Validation: StoryObj<typeof Form<Values>> = { render: () => { const form = useForm<Values>({ resolver: zodResolver(schema), mode: 'onBlur', defaultValues: { name: '', contacts: [{ email: '' }] } }); const [saved, setSaved] = useState(''); return <div style={{ width: 460 }}><Form form={form} onSubmit={value => setSaved(JSON.stringify(value))} aria-label="연락처 폼"><Field name="name" label="이름" required helper="목록에 표시됩니다.">{props => <Input {...props} placeholder="예: 윤성국" />}</Field><FieldArray<Values, 'contacts'> name="contacts" label="이메일" empty={{ email: '' }} min={1} max={3} addLabel="이메일 추가">{row => <Field name={row.name('email')} label={`이메일 ${row.index + 1}`}>{props => <Input {...props} type="email" placeholder="name@example.com" />}</Field>}</FieldArray><SubmitButton>저장</SubmitButton></Form>{saved && <pre style={{ fontSize: 12, marginTop: 16 }}>{saved}</pre>}</div>; } };

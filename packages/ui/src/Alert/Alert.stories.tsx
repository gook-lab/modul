import type { Meta, StoryObj } from '@storybook/react-vite';
import radio from '../../../../docs/radio/Alert.md?raw';
import { radioDescription } from '../storybook-radio';
import { Alert } from './Alert';
const meta: Meta<typeof Alert> = { title: 'Components/Alert', component: Alert, tags: ['autodocs'], parameters: { layout: 'padded', docs: { description: { component: radioDescription(radio) } } } };
export default meta;
export const Tones: StoryObj<typeof Alert> = { render: () => <div style={{ display: 'grid', gap: 10 }}><Alert tone="info" title="업데이트가 있습니다">새 버전을 확인해 주세요.</Alert><Alert tone="success" title="저장했습니다" /><Alert tone="warning" title="남은 자리가 적습니다" /><Alert tone="error" title="저장에 실패했습니다" action={{ label: '다시 시도', onClick: () => {} }}>네트워크 연결을 확인해 주세요.</Alert></div> };

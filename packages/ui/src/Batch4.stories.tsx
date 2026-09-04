import { useState } from 'react';
import type { StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BarChart, LineChart, Sparkline } from './Chart/Chart';
import { FileDrop, type UploadItem } from './FileDrop/FileDrop';
import { Boundary } from './Boundary/Boundary';
import { RichText } from './RichText/RichText';
import { AppBar } from './Mobile/AppBar';
import { BottomActions } from './Mobile/BottomActions';
import { ScrollTabs } from './Mobile/ScrollTabs';
import * as RTabs from '@radix-ui/react-tabs';
import { Form, createField, SubmitButton } from './Form/Form';
import { FieldArray } from './Form/FieldArray';
import { Input } from './Input/Input';
import { Button } from './Button/Button';
import { Skeleton } from '@modul/motion';

/**
 * 생성기가 채울 수 없는 컴포넌트들 — 필수 props 가 배열·객체·콜백이라
 * `pnpm gen:stories` 가 "손으로 스토리 작성" 으로 건너뜁니다.
 */
export default { title: 'Components/Batch 4' };

const won = (n: number) => n.toLocaleString('ko-KR') + '원';

export const ChartStory: StoryObj = {
  name: 'Chart',
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <BarChart
        title="월별 입고"
        data={[
          { label: '4월', value: 12 }, { label: '5월', value: 19 }, { label: '6월', value: 8 },
          { label: '7월', value: 24 }, { label: '8월', value: 17 },
        ]}
        highlight={3}
      />
      <LineChart
        title="누적 보틀"
        data={[
          { label: '4월', value: 12 }, { label: '5월', value: 31 }, { label: '6월', value: 39 },
          { label: '7월', value: 63 }, { label: '8월', value: 80 },
        ]}
        fmt={won}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13 }}>최근 7일</span>
        <Sparkline label="최근 7일 입고 추이" data={[3, 3, 2, 4, 3, 4, 4]} />
      </div>
    </div>
  ),
};

export const FileDropStory: StoryObj = {
  name: 'FileDrop',
  render: () => {
    const [files, setFiles] = useState<UploadItem[]>([
      { id: 'a', name: '테이스팅노트.pdf', size: 240_000, progress: 100 },
      { id: 'b', name: '라벨.png', size: 1_200_000, progress: 62 },
    ]);
    const [msg, setMsg] = useState('');
    return (
      <div style={{ display: 'grid', gap: 12, width: 460 }}>
        <FileDrop
          title="파일을 끌어다 놓거나 선택"
          hint="PDF · 이미지, 2MB 까지"
          accept="image/*,.pdf"
          maxSize={2e6}
          max={5}
          files={files}
          onFiles={fs => setFiles(c => [...c, ...fs.map(f => ({ id: f.name, name: f.name, size: f.size, progress: 0 }))])}
          onRemove={id => setFiles(c => c.filter(f => f.id !== id))}
          onReject={(_, messages) => setMsg(messages.join(' · '))}
        />
        {msg && <div role="alert" style={{ fontSize: 12, color: 'var(--color-accent-700)' }}>{msg}</div>}
      </div>
    );
  },
};

/** 던지는 자식으로 error 뷰를, resetKeys 로 복귀를 보여줍니다. */
function Boom({ crash }: { crash: boolean }) {
  if (crash) throw new Error('시세를 불러오지 못했습니다');
  return <div style={{ padding: 20 }}>위젯이 정상입니다.</div>;
}

export const BoundaryStory: StoryObj = {
  name: 'Boundary',
  render: () => {
    const [crash, setCrash] = useState(true);
    return (
      <div style={{ display: 'grid', gap: 12, width: 460 }}>
        <Button variant="secondary" size="sm" onClick={() => setCrash(c => !c)}>
          {crash ? '고치기' : '고장내기'}
        </Button>
        <div style={{ border: '1px solid var(--color-divider)', minHeight: 200 }}>
          <Boundary resetKeys={[crash]} skeleton={<Skeleton.Text lines={3} />}>
            <Boom crash={crash} />
          </Boundary>
        </div>
      </div>
    );
  },
};

export const RichTextStory: StoryObj = {
  name: 'RichText',
  render: () => (
    <div style={{ display: 'grid', gap: 24, width: 520 }}>
      <RichText
        autolink
        value={'첫 문단입니다.\n같은 문단의 둘째 줄.\n\n빈 줄 하나가 문단을 나눕니다.\n참고: https://example.com/notes'}
      />
      <RichText value={null} fallback={<span style={{ color: 'var(--color-neutral-700)' }}>아직 메모가 없습니다</span>} />
    </div>
  ),
};

export const MobileStory: StoryObj = {
  name: 'Mobile — AppBar · ScrollTabs · BottomActions',
  parameters: { layout: 'fullscreen' },
  render: () => {
    const [tab, setTab] = useState('all');
    return (
      <div style={{ width: 390, height: 560, position: 'relative', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column' }}>
        <AppBar title="캐비닛" crumbs={['홈', '캐비닛']} onBack={() => {}} actions={<Button variant="ghost" size="sm">편집</Button>} />
        <ScrollTabs
          value={tab}
          onValueChange={setTab}
          items={[
            { value: 'all', label: '전체' }, { value: 'open', label: '개봉' },
            { value: 'sealed', label: '미개봉' }, { value: 'wish', label: '위시' },
            { value: 'gone', label: '비움' },
          ]}
        >
          {['all', 'open', 'sealed', 'wish', 'gone'].map(v => (
            <RTabs.Content key={v} value={v} style={{ flex: 1, overflow: 'auto', padding: 16, fontSize: 14 }}>
              선택한 탭: {v}
            </RTabs.Content>
          ))}
        </ScrollTabs>
        <BottomActions>
          <Button variant="secondary" block>나중에</Button>
          <Button block>기록하기</Button>
        </BottomActions>
      </div>
    );
  },
};

const schema = z.object({
  name: z.string().min(2, '2자 이상 입력하세요'),
  contacts: z.array(z.object({ email: z.string().email('이메일 형식') })).min(1, '하나는 필요합니다'),
});
type Values = z.infer<typeof schema>;
const Field = createField<Values>();

export const FormStory: StoryObj = {
  name: 'Form — Field · FieldArray · SubmitButton',
  render: () => {
    const form = useForm<Values>({
      resolver: zodResolver(schema),
      mode: 'onBlur',
      defaultValues: { name: '', contacts: [{ email: '' }] },
    });
    const [saved, setSaved] = useState('');
    return (
      <div style={{ width: 460 }}>
        <Form form={form} onSubmit={v => setSaved(JSON.stringify(v))} aria-label="연락처 폼">
          <Field name="name" label="이름" required helper="목록에 보입니다">
            {p => <Input {...p} placeholder="예: 윤성국" />}
          </Field>
          <FieldArray<Values, 'contacts'> name="contacts" label="이메일" empty={{ email: '' }} min={1} max={3} addLabel="이메일 추가">
            {r => (
              <Field name={r.name('email')} label={`이메일 ${r.index + 1}`}>
                {p => <Input {...p} type="email" placeholder="name@example.com" />}
              </Field>
            )}
          </FieldArray>
          <SubmitButton>저장</SubmitButton>
        </Form>
        {saved && <pre style={{ fontSize: 12, marginTop: 16 }}>{saved}</pre>}
      </div>
    );
  },
};

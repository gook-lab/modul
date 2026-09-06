import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, createField, FieldArray, SubmitButton, Input, Textarea, Select, Combobox, DatePicker, RadioGroup, Checkbox, Switch, ImageGallery, Alert } from '@gook-lab/ui';
import type { Path } from 'react-hook-form';
import { useToast } from '@gook-lab/ui';

/** 한 폼에 MODUL 폼 컴포넌트 전부. 검증 zod, 상태 RHF, 표시 MODUL. 서버 오류는 폼 상단 Alert + 필드 setError */
const schema = z.object({
  name: z.string().min(2, '2자 이상 입력하세요').max(40, '40자 이하'),
  owner: z.string().min(1, '담당을 선택하세요'),
  status: z.enum(['active', 'review', 'done'], { message: '상태를 선택하세요' }),
  startsAt: z.date({ message: '날짜를 선택하세요' }).nullable().refine(d => d, '날짜를 선택하세요'),
  visibility: z.enum(['team', 'public']),
  tags: z.array(z.string()).max(5, '태그는 5개까지'),
  notify: z.boolean(),
  agree: z.boolean().refine(v => v, '동의가 필요합니다'),
  bio: z.string().max(200).optional(),
  photos: z.array(z.object({ id: z.string(), url: z.string() })).max(5),
  contacts: z.array(z.object({ name: z.string().min(1, '이름'), email: z.string().email('이메일 형식') })).min(1, '연락처 하나는 필요합니다').max(5),
});
type Values = z.infer<typeof schema>;
/** name 리터럴에서 값 타입이 좁혀지도록 T 를 먼저 고정합니다. */
const Field = createField<Values>();

export function ProjectForm({ people, tags, onSaved }: { people: { id: string; name: string }[]; tags: string[]; onSaved: () => void }) {
  const toast = useToast();
  const form = useForm<Values>({ resolver: zodResolver(schema), mode: 'onBlur', defaultValues: { name: '', owner: '', status: undefined, startsAt: null, visibility: 'team', tags: [], notify: true, agree: false, bio: '', photos: [], contacts: [{ name: '', email: '' }] } });
  const serverError = form.formState.errors.root?.message;

  const submit = async (v: Values) => {
    try { await api.projects.create(v); toast.show('프로젝트를 만들었습니다', { action: { label: '보기', run: onSaved } }); onSaved(); }
    catch (e) {
      // 서버는 { field, message } 를 줄 수도, 평범한 Error 일 수도 있다 — 둘 다 받는다.
      const err = e as { field?: Path<Values>; message?: string };
      if (err.field) form.setError(err.field, { message: err.message });    // 필드 오류는 필드에
      else form.setError('root', { message: err.message ?? '저장에 실패했습니다' }); // 나머지는 상단
      (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus();  // 첫 오류로 포커스
    }
  };

  return (
    <Form form={form} onSubmit={submit} aria-label="새 프로젝트">
      {serverError && <Alert tone="error" title={serverError} action={{ label: '다시 시도', onClick: () => form.handleSubmit(submit)() }} />}
      <Field name="name" label="이름" required helper="목록과 알림에 보입니다">{p => <Input {...p} placeholder="예: 어드민 리디자인" maxLength={40} autoComplete="off" />}</Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field name="owner" label="담당" required>{p => <Combobox {...p} options={people.map(x => ({ value: x.id, label: x.name }))} placeholder="이름 검색" />}</Field>
        <Field name="status" label="상태" required>{p => <Select {...p} options={[{ value: 'active', label: '진행중', dot: 'accent' }, { value: 'review', label: '검토' }, { value: 'done', label: '완료' }]} />}</Field>
      </div>
      <Field name="startsAt" label="시작일" required>{p => <DatePicker {...p} min={new Date()} />}</Field>
      <Field name="visibility" label="공개 범위">{p => <RadioGroup {...p} label="공개 범위" onValueChange={v => p.onChange(v as Values['visibility'])} layout="cards" options={[{ value: 'team', label: '팀', hint: '팀원만' }, { value: 'public', label: '전체', hint: '링크로 누구나' }]} />}</Field>
      <Field name="tags" label="태그" helper="최대 5개">{p => <Combobox {...p} multiple options={tags.map(t => ({ value: t, label: t }))} creatable />}</Field>
      <Field name="bio" label="설명">{p => <Textarea {...p} maxLength={200} autoGrow rows={3} />}</Field>
      <Field name="photos" label="사진">{p => <ImageGallery value={p.value} onChange={p.onChange} max={5} onUpload={api.upload} onError={m => form.setError('photos', { message: m })} />}</Field>
      <FieldArray<Values, 'contacts'> name="contacts" label="연락처" empty={{ name: '', email: '' }} min={1} max={5} addLabel="연락처 추가">
        {r => <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><Field name={r.name('name')} label="이름">{p => <Input {...p} />}</Field><Field name={r.name('email')} label="이메일">{p => <Input {...p} type="email" />}</Field></div>}
      </FieldArray>
      <Field name="notify">{p => <Switch checked={p.value} onCheckedChange={p.onChange} label="변경 시 알림" hint="담당과 팀에 푸시" />}</Field>
      <Field name="agree" required>{p => <Checkbox checked={p.value} onCheckedChange={v => p.onChange(v === true)} label="운영 정책에 동의합니다" aria-describedby={p['aria-describedby']} />}</Field>
      <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '2px solid var(--color-divider)' }}>
        <SubmitButton>만들기</SubmitButton>
        <button type="button" className="btn btn-secondary" onClick={() => form.reset()}>초기화</button>
      </div>
    </Form>
  );
}
/** 이 화면이 기대하는 서버 경계. 컴포넌트는 fetch 를 모르고 콜백만 받습니다(PROMPT 1.5). */
declare const api: {
  projects: { create: (v: Values) => Promise<void> };
  upload: (file: File, onProgress: (p: number) => void) => Promise<string>;
};

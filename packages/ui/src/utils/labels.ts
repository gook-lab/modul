import { createContext, useContext } from 'react';
/** 컴포넌트 내부 문자열. ModulProvider 로 덮어쓴다. 키는 컴포넌트.용도 */
export const KO = {
  'common.close': '닫기', 'common.clear': '지우기', 'common.copy': '복사', 'common.copied': '복사됨', 'common.cancel': '취소', 'common.confirm': '확인', 'common.retry': '다시 시도', 'common.back': '뒤로', 'common.add': '추가', 'common.edit': '편집', 'common.save': '저장', 'table.editing': '편집 중 — Enter 저장 · Esc 취소', 'error.title': '문제가 생겼습니다', 'error.body': '화면을 다시 불러오면 대부분 해결됩니다. 반복되면 알려주세요.', 'error.reload': '다시 불러오기', 'error.report': '문제 신고',
  'combobox.create': '새로 추가', 'combobox.empty': '맞는 항목이 없습니다', 'select.placeholder': '선택하세요',
  'toast.undo': '되돌리기', 'sheet.keep': '그대로 두기', 'pagination.prev': '이전', 'pagination.next': '다음', 'pagination.label': '페이지',
  'filedrop.title': '파일을 끌어다 놓거나 선택', 'filedrop.drop': '여기에 놓으세요', 'filedrop.pick': '파일 선택', 'filedrop.remove': '{name} 제거',
  'upload.primary': '대표', 'upload.add': '추가', 'upload.replace': '바꾸기', 'upload.upload': '올리기', 'upload.max': '최대 {max}장까지 올릴 수 있습니다', 'upload.tooLarge': '{name} 은 {size} 를 넘습니다', 'upload.notImage': '이미지 파일만 올릴 수 있습니다',
  'avatar.more': '외 {n}명', 'breadcrumb.expand': '숨겨진 경로 펼치기', 'breadcrumb.label': '현재 위치', 'sidebar.collapse': '사이드바 접기', 'sidebar.expand': '사이드바 펼치기',
  'stepper.next': '다음: {label}', 'stepper.last': '마지막 단계', 'stepper.optional': '(선택)', 'stepper.progress': '진행 단계', 'progress.label': '진행률', 'cmdk.placeholder': '명령 또는 페이지 검색…', 'cmdk.empty': '맞는 명령이 없습니다',
  'emptystate.empty': '아직 항목이 없습니다', 'emptystate.error': '불러오지 못했습니다', 'emptystate.offline': '오프라인입니다', 'password.show': '비밀번호 보기', 'password.hide': '비밀번호 숨기기',
  'filedrop.reject': '받을 수 없는 파일이 있습니다', 'filedrop.maxSize': '최대 {size}',
  'upload.reorder': '드래그로 순서 변경', 'upload.drop': '놓기',
  'avatar.group': '{n}명', 'upload.photoAlt': '프로필 사진', 'upload.primaryFirst': '첫 장이 대표',
  'upload.photoNth': '사진 {i}', 'upload.removeNth': '사진 {i} 제거', 'upload.primaryBadge': '대표',
  'upload.reorderHint': '사진 {i}, 총 {n}장 중 {i}번째. 좌우 화살표로 순서를 바꿉니다', 'upload.moved': '{i}번째로 옮겼습니다',
  'emptystate.offlineBody': '마지막으로 받은 목록을 보여 드립니다.',
} as const;
export type LabelKey = keyof typeof KO;
export type Labels = Partial<Record<LabelKey, string>>;
const Ctx = createContext<Labels>({});
export const LabelsProvider = Ctx.Provider;
/** t('upload.max', { max: 5 }) */
export function useLabels() {
  const over = useContext(Ctx);
  return (key: LabelKey, vars: Record<string, string | number> = {}) => (over[key] ?? KO[key]).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
// t() 사용: Combobox · Select · Toast · Pagination · Breadcrumb · Sidebar · Kbd · Drawer · AppBar · FileDrop · ImageUpload · Stepper · Avatar · EmptyState · CommandPalette
// 적용 예: <LabelsProvider value={{ 'toast.undo': 'Undo', 'common.close': 'Close' }}> — 컴포넌트 소스의 하드코딩 문자열을 t() 로 치환하는 작업은 컴포넌트별 PR 로 (v0.10)

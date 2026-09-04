import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LabelsProvider } from './labels';
import { EmptyState } from '../EmptyState/EmptyState';
import { FileDrop } from '../FileDrop/FileDrop';
import { AvatarGroup } from '../Avatar/Avatar';
import { Stepper } from '../Stepper/Stepper';

/**
 * 컴포넌트 내부 문자열은 전부 t() 를 거쳐야 LabelsProvider 로 덮을 수 있습니다.
 * 하드코딩이 남아 있으면 아래 영어 라벨이 화면에 나타나지 않습니다.
 */
const EN = {
  'emptystate.empty': 'Nothing here yet',
  'emptystate.error': 'Could not load',
  'common.retry': 'Try again',
  'filedrop.title': 'Drop files or choose',
  'filedrop.pick': 'Choose file',
  'avatar.more': '+{n} more',
  'stepper.last': 'Last step',
} as const;

const wrap = (ui: React.ReactNode) => render(<LabelsProvider value={EN}>{ui}</LabelsProvider>);

describe('useLabels — 내부 문자열 덮어쓰기', () => {
  it('EmptyState 의 빈 상태 제목', () => {
    wrap(<EmptyState view={{ kind: 'empty' }}>{() => null}</EmptyState>);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('EmptyState 의 오류 제목과 재시도 버튼', () => {
    wrap(<EmptyState view={{ kind: 'error', message: 'x', retry: () => {} }}>{() => null}</EmptyState>);
    expect(screen.getByText('Could not load')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('FileDrop 의 안내와 버튼', () => {
    wrap(<FileDrop onFiles={() => {}} />);
    expect(screen.getByText('Drop files or choose')).toBeInTheDocument();
    expect(screen.getByText('Choose file')).toBeInTheDocument();
  });

  it('AvatarGroup 의 나머지 인원 — 치환 변수까지', () => {
    wrap(<AvatarGroup max={1} people={[{ name: '가' }, { name: '나' }, { name: '다' }]} />);
    expect(screen.getByLabelText('+2 more')).toBeInTheDocument();
  });

  it('Stepper 의 마지막 단계', () => {
    wrap(<Stepper current={1} steps={[{ id: 'a', label: '하나' }, { id: 'b', label: '둘' }]} />);
    expect(screen.getByText('Last step')).toBeInTheDocument();
  });
});

import { Component, Suspense, type ErrorInfo, type ReactNode } from 'react';
import { EmptyState } from '../EmptyState/EmptyState';

type Props = { children: ReactNode; /** 실패 시 대체 — 기본은 EmptyState error 슬롯 */ fallback?: (err: Error, reset: () => void) => ReactNode; onError?: (err: Error, info: ErrorInfo) => void; /** 라우트·탭 바뀔 때 리셋 */ resetKeys?: unknown[]; size?: 'md' | 'sm' };
type State = { err: Error | null };
/**
 * 에러 경계. EmptyState 의 error 뷰와 같은 모양 — 데이터 실패(ViewState.error)와 렌더 실패(throw)가 사용자에게 같은 언어로 보인다.
 * 위치: 라우트 하나 · 대시보드 위젯 하나 · 사이드 패널 하나. 전체 앱에 하나만 두면 위젯 하나가 화면 전체를 죽인다.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error, info: ErrorInfo) { this.props.onError?.(err, info); }
  componentDidUpdate(prev: Props) { if (this.state.err && prev.resetKeys && this.props.resetKeys && prev.resetKeys.some((k, i) => k !== this.props.resetKeys![i])) this.reset(); }
  reset = () => this.setState({ err: null });
  render() {
    const { err } = this.state; if (!err) return this.props.children;
    if (this.props.fallback) return this.props.fallback(err, this.reset);
    return <EmptyState size={this.props.size} view={{ kind: 'error', message: import.meta.env?.DEV ? err.message : '문제가 생겼습니다', retry: this.reset }} error={{ title: '문제가 생겼습니다', body: '화면을 다시 불러오면 대부분 해결됩니다. 반복되면 알려주세요.', action: { label: '다시 불러오기', onClick: this.reset } }}>{() => null}</EmptyState>;
  }
}
/** Suspense + ErrorBoundary 한 쌍. fallback 은 EmptyState 의 loading 슬롯(실제 레이아웃과 같은 높이의 스켈레톤을 넘길 것) */
export function Boundary({ children, skeleton, ...rest }: Props & { skeleton: ReactNode }) {
  return <ErrorBoundary {...rest}><Suspense fallback={skeleton}>{children}</Suspense></ErrorBoundary>;
}

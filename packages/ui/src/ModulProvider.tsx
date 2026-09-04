import { useLayoutEffect, type ReactNode } from 'react';
import * as RTip from '@radix-ui/react-tooltip';
import { ToastProvider, type ToastProviderProps } from './Toast/Toast';
import { LabelsProvider, type Labels } from './utils/labels';

/** 앱 셸에 한 번. 테마 · 라벨 · 토스트 · 툴팁 Provider 를 묶는다 */
export function ModulProvider({ children, theme = 'light', labels = {}, toast }: { children: ReactNode; theme?: 'light' | 'dark' | 'malt'; labels?: Labels; toast?: Omit<ToastProviderProps, 'children'> }) {
  // 렌더 중에 DOM 을 만지면 StrictMode 의 두 번째 렌더에서 두 번 실행되고 SSR 에서는 document 가 없습니다.
  // 페인트 전에 적용해야 테마가 한 프레임 깜빡이지 않으므로 useLayoutEffect 입니다.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return <LabelsProvider value={labels}><RTip.Provider delayDuration={300}><ToastProvider {...toast}>{children}</ToastProvider></RTip.Provider></LabelsProvider>;
}

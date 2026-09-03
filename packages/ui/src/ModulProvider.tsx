import type { ReactNode } from 'react';
import * as RTip from '@radix-ui/react-tooltip';
import { ToastProvider, type ToastProviderProps } from './Toast/Toast';
import { LabelsProvider, type Labels } from './utils/labels';

/** 앱 셸에 한 번. 테마 · 라벨 · 토스트 · 툴팁 Provider 를 묶는다 */
export function ModulProvider({ children, theme = 'light', labels = {}, toast }: { children: ReactNode; theme?: 'light' | 'dark' | 'malt'; labels?: Labels; toast?: Omit<ToastProviderProps, 'children'> }) {
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = theme;
  return <LabelsProvider value={labels}><RTip.Provider delayDuration={300}><ToastProvider {...toast}>{children}</ToastProvider></RTip.Provider></LabelsProvider>;
}

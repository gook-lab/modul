import type { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { Tooltip } from '@modul/ui';
import '@modul/tokens/styles.css';
import '@modul/tokens/components.css';
import '@modul/tokens/theme-malt.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    controls: { expanded: true },
    // 자동 axe 실행은 .storybook/test-runner.ts 한 곳에서만. 패널은 수동으로 열어 씁니다.
    a11y: { element: '#storybook-root', manual: true },
  },
  decorators: [
    // 앱 셸이 하는 일과 같습니다 — Radix Tooltip 은 Provider 없이는 렌더되지 않습니다.
    (Story) => <Tooltip.Provider delayDuration={300}><Story /></Tooltip.Provider>,
    withThemeByDataAttribute({ themes: { light: 'light', dark: 'dark', malt: 'malt' }, defaultTheme: 'light', attributeName: 'data-theme' }),
  ],
};
export default preview;

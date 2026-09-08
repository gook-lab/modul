import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { Tooltip } from '@gook-lab/ui';
import '@gook-lab/tokens/styles.css';
import '@gook-lab/tokens/components.css';
import '@gook-lab/tokens/theme-malt.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { disabled: true },
    options: {
      storySort: {
        order: [
          'Foundations',
          'Components',
          [
            'Button', 'Input', 'Textarea', 'Checkbox & Radio', 'Switch', 'Slider',
            'Select & Combobox', 'DatePicker', 'FileDrop', 'ImageUpload', 'Tag',
            'Card', 'Stat', 'Table', 'EmptyState', 'Skeleton', 'Alert', 'Avatar',
            'Kbd & Code', 'Tabs', 'Stepper', 'Breadcrumb', 'Accordion', 'Pagination',
            'Popover & Menu', 'Tooltip', 'CommandPalette', 'Modal', 'Drawer', 'Sheet',
            'Toast', 'Sidebar', 'Chart', 'Boundary', 'RichText', 'Mobile Patterns', 'Form',
          ],
          'Motion',
          'Domain',
        ],
      },
    },
    controls: { expanded: true },
    /**
     * axe 는 addon-a11y 가 스토리마다 돌립니다(Storybook 10 부터 vitest 와 직접 연결).
     * `.btn-primary` 제외는 docs/contrast-audit.md '수정 2' 의 명시적 예외입니다 —
     * bg 라벨 / accent 배경이 light 3.76 · malt 3.49 로 4.5:1 에 못 미치지만
     * 라벨이 14px/800 이고 accent-to-ground 3:1 기준을 넘겨 수용한 결정입니다.
     * 그 결정을 뒤집을 때 이 줄도 같이 지워 주세요. 다른 표면은 전부 검사 대상입니다.
     */
    a11y: {
      // 기본값은 위반을 '보고만' 합니다. 게이트로 쓰려면 error 여야 테스트가 실패합니다
      // (실측: 이 줄이 없으면 neutral-700 을 #b5b1b1 로 낮춰도 92/92 가 통과했습니다).
      test: 'error',
      context: { exclude: ['.btn-primary'] },
      config: { rules: [{ id: 'color-contrast', enabled: true }] },
    },
  },
  decorators: [
    // 앱 셸이 하는 일과 같습니다 — Radix Tooltip 은 Provider 없이는 렌더되지 않습니다.
    Story => <Tooltip.Provider delayDuration={300}><Story /></Tooltip.Provider>,
    withThemeByDataAttribute({ themes: { light: 'light', dark: 'dark', malt: 'malt' }, defaultTheme: 'light', attributeName: 'data-theme' }),
  ],
};
export default preview;

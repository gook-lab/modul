import { z } from 'zod';

/**
 * theme.json 의 런타임 스키마. 토큰은 시각 값의 SSOT 이므로 타입 선언만으로는 부족합니다 —
 * 손으로 고치는 JSON 이라 오타 하나가 배포 CSS 대조를 그냥 통과해 버릴 수 있습니다.
 * 빌드 첫 줄에서 parse 하고 실패하면 어느 경로가 왜 틀렸는지 말하고 멈춥니다.
 */
const hex = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, '색은 hex 로 적습니다 (예: #ec3013)');

const fonts = z.object({
  heading: z.string().min(1),
  headingWeight: z.number().int().min(1).max(1000),
  body: z.string().min(1),
  mono: z.string().min(1).optional(),
});

/** 테마 한 벌. divider 를 직접 주지 않으면 dividerAlpha 로 text 색에서 계산합니다. */
const themeBlock = z.object({
  bg: hex,
  surface: hex,
  text: hex,
  accent: hex,
  divider: hex.optional(),
  dividerAlpha: z.number().min(0).max(1).optional(),
  fonts: fonts.optional(),
  radius: z.number().min(0).optional(),
  /** 테마 전용 추가 변수 — 키가 곧 --변수명 */
  extra: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

export const themeFileSchema = z.object({
  name: z.string().min(1),
  themes: z.object({
    light: themeBlock,
    dark: themeBlock,
    malt: themeBlock,
  }),
  fonts,
  radius: z.number().min(0),
  /** --space-1·2·3·4·6·8 여섯 단계 */
  space: z.array(z.number().positive()).length(6),
  motion: z.record(z.string(), z.number().positive()),
  easing: z.record(z.string(), z.string().min(1)),
});

export type ThemeFile = z.infer<typeof themeFileSchema>;
export type ThemeBlock = z.infer<typeof themeBlock>;

/** parse 실패를 경로와 함께 읽히는 한 덩어리로 만들어 던집니다. */
export function parseThemeFile(input: unknown): ThemeFile {
  const r = themeFileSchema.safeParse(input);
  if (r.success) return r.data;
  const lines = r.error.issues.map(i => `  theme.json${i.path.length ? '.' + i.path.join('.') : ''} — ${i.message}`);
  throw new Error(`theme.json 이 스키마와 맞지 않습니다:\n${lines.join('\n')}`);
}

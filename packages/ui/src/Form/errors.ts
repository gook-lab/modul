import type { FieldErrors, FieldValues } from 'react-hook-form';

type ErrorNode = { message?: unknown; root?: { message?: unknown } } | undefined;

/**
 * react-hook-form 의 errors 트리에서 점 경로(`contacts.0.name`)로 메시지를 꺼냅니다.
 * errors 를 그냥 `[name]` 으로 인덱싱하면 중첩 필드와 FieldArray 의 오류를 놓칩니다 —
 * RHF 가 오류를 값과 같은 모양의 트리로 쌓기 때문입니다.
 */
export function errorAt<T extends FieldValues>(errors: FieldErrors<T>, path: string): string | undefined {
  let node: unknown = errors;
  for (const seg of path.split('.')) {
    if (node == null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[seg];
  }
  const e = node as ErrorNode;
  const msg = e?.message ?? e?.root?.message;
  return typeof msg === 'string' ? msg : undefined;
}

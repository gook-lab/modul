import { useEffect, useState } from 'react';
export function useReducedMotion() {
  const [rm, set] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const q = matchMedia('(prefers-reduced-motion: reduce)'); const on = () => set(q.matches); q.addEventListener('change', on); return () => q.removeEventListener('change', on); }, []);
  return rm;
}
export const hasPointer = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches;

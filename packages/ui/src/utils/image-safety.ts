/**
 * 업로드 이미지 안전 처리 — onUpload 앞단(앱)에서. 컴포넌트는 fetch 도 변환도 모른다.
 *  stripExif   : canvas 재인코딩으로 EXIF(GPS·기기·시각) 제거. 방향은 브라우저가 적용한 상태로 그려져 보존. HEIC 는 브라우저 디코딩 불가 → 서버.
 *  sanitizeSvg : <script>·on*·javascript:·<foreignObject>·외부 href 제거. 기본은 SVG 를 받지 않는 것(accept 에서 제외). 받아야 하면 이걸 거친 뒤 <img> 로만 표시.
 */
export async function stripExif(file: File, quality = .92): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bmp = await createImageBitmap(file);
  const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
  c.getContext('2d')!.drawImage(bmp, 0, 0); bmp.close();
  const out = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob: Blob = await new Promise(r => c.toBlob(b => r(b!), out, quality));
  return new File([blob], file.name.replace(/\.[^.]+$/, out === 'image/png' ? '.png' : '.jpg'), { type: out, lastModified: file.lastModified });
}
const BAD_TAGS = ['script', 'foreignObject', 'iframe', 'object', 'embed', 'use'];
export function sanitizeSvg(svgText: string): string {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  if (doc.querySelector('parsererror')) throw new Error('SVG 파싱 실패');
  doc.querySelectorAll(BAD_TAGS.join(',')).forEach(el => el.remove());
  doc.querySelectorAll('*').forEach(el => { for (const a of [...el.attributes]) { const n = a.name.toLowerCase(), v = a.value.trim().toLowerCase(); if (n.startsWith('on') || ((n === 'href' || n === 'xlink:href') && !v.startsWith('#') && !v.startsWith('data:image/')) || v.includes('javascript:')) el.removeAttribute(a.name); } });
  return new XMLSerializer().serializeToString(doc.documentElement);
}
export const safeUpload = (upload: (f: File, p: (n: number) => void) => Promise<string>) => async (f: File, p: (n: number) => void) => upload(await stripExif(f), p);

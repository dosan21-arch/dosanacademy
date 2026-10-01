import { isHangulSyllable } from '../../utils/hangul';

/** 한글 이름은 이름(성 제외) 두 글자, 영문은 머리글자 */
function initials(name: string): string {
  const n = name.trim();
  if (!n) return '?';
  if (isHangulSyllable(n[0])) return n.length >= 3 ? n.slice(-2) : n;
  return n
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const SIZES = {
  md: 'h-14 w-14 text-base',
  lg: 'h-28 w-28 text-2xl',
};

interface Props {
  name: string;
  photoUrl: string | null;
  size?: keyof typeof SIZES;
}

export default function Avatar({ name, photoUrl, size = 'md' }: Props) {
  const sizeClass = SIZES[size];
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${name} 사진`}
        loading="lazy"
        className={`${sizeClass} shrink-0 rounded-full bg-fill object-cover`}
      />
    );
  }
  // 강조색은 하나만 — 이니셜 아바타도 옅은 강조색 한 가지로 통일
  return (
    <div
      aria-hidden="true"
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-ink`}
    >
      {initials(name)}
    </div>
  );
}

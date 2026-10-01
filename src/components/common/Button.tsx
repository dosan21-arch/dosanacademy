import type { ButtonHTMLAttributes } from 'react';

const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:brightness-110 active:brightness-95',
  secondary: 'bg-surface text-ink-soft hairline hover:bg-fill active:bg-fill',
  // 빨강은 되돌릴 수 없는 동작(삭제)에만
  danger: 'bg-danger text-white hover:brightness-110 active:brightness-95',
  ghost: 'text-brand-ink hover:bg-brand-50 active:bg-brand-50',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: 'md' | 'sm';
}

/** 터치하기 쉬운 버튼: 기본 높이 48px, size="sm" 은 헤더 등 좁은 곳용 44px */
export default function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...rest }: Props) {
  const sizeClass = size === 'md' ? 'min-h-12 px-5 text-[17px]' : 'min-h-11 px-3.5 text-base';
  return (
    <button
      type={type}
      className={`${VARIANTS[variant]} ${sizeClass} inline-flex items-center justify-center gap-1.5 rounded-control font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      {...rest}
    />
  );
}

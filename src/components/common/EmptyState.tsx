import type { ReactNode } from 'react';

/** 빈 화면: 가운데 정렬, 옅은 강조색 아이콘 → 제목 → 설명 (가이드 4-5) */
export default function EmptyState({
  title,
  icon = '👥',
  children,
}: {
  title: string;
  icon?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
        {icon}
      </div>
      <p className="mt-4 text-[18px] font-bold text-ink">{title}</p>
      {children && <div className="mt-1.5 text-ink-muted">{children}</div>}
    </div>
  );
}

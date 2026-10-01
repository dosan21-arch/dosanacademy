/** 명단 카드와 같은 짜임의 회색 스켈레톤 — 불러온 뒤 자리가 튀지 않게 (가이드 4-5) */
export default function MemberListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul role="status" aria-label="원우 명단을 불러오는 중" className="grid gap-2.5 md:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="flex min-h-[88px] items-center gap-4 rounded-card bg-surface p-4 hairline">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-fill" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-fill" />
            <div className="h-3.5 w-32 animate-pulse rounded bg-fill" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-fill" />
          </div>
        </li>
      ))}
    </ul>
  );
}

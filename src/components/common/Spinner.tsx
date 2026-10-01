export default function Spinner({ label = '불러오는 중…' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-ink-muted">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-line border-t-brand-500" />
      <span>{label}</span>
    </div>
  );
}

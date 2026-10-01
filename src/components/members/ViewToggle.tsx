import type { ViewMode } from '../../utils/search';

const OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'name', label: '가나다순' },
  { value: 'cohort', label: '기수별' },
];

export default function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div role="radiogroup" aria-label="보기 방식" className="inline-flex rounded-full bg-surface p-1 hairline">
      {OPTIONS.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`min-h-10 rounded-full px-4 font-bold transition ${
              active ? 'bg-brand-500 text-white' : 'text-ink-muted'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <label htmlFor="member-search" className="sr-only">
        원우 검색
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-ink-faint"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        id="member-search"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="이름, 직책, 소속 검색 (초성 가능)"
        className="h-14 w-full appearance-none rounded-control bg-surface pl-12 pr-12 text-[18px] text-ink hairline placeholder:text-ink-faint focus:shadow-[0_0_0_2px_var(--color-brand-500)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="검색어 지우기"
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-lg text-ink-muted hover:bg-fill"
        >
          ✕
        </button>
      )}
    </div>
  );
}

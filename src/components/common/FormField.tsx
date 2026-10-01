import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

const CONTROL =
  'w-full rounded-control bg-field px-4 text-ink hairline placeholder:text-ink-faint focus:bg-surface focus:shadow-[0_0_0_2px_var(--color-brand-500)] focus:outline-none aria-[invalid=true]:shadow-[0_0_0_2px_var(--color-danger)]';

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

export function Field({ id, label, required, error, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-bold text-ink">
        {label}
        {required && (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (필수)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 font-semibold text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-[15px] text-ink-muted">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({
  id,
  error,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string }) {
  return (
    <input
      id={id}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`${CONTROL} h-13 min-h-12`}
      {...rest}
    />
  );
}

export function TextArea({
  id,
  error,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; error?: string }) {
  return (
    <textarea
      id={id}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`${CONTROL} min-h-28 py-3 leading-relaxed`}
      {...rest}
    />
  );
}

import { forwardRef, type InputHTMLAttributes } from "react";

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(function Field({ label, error, id, ...props }, ref) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className="w-full rounded border border-line bg-white px-3.5 py-2.5 text-sm text-ink-900
                   placeholder:text-ink-600/40 focus:border-summit focus:outline-none
                   focus:ring-1 focus:ring-summit disabled:bg-line/40"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
});

export function SubmitButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className="flex w-full items-center justify-center gap-2 rounded bg-summit px-4 py-2.5
                 text-sm font-medium text-paper transition-colors hover:bg-summit-400
                 disabled:cursor-not-allowed disabled:opacity-60"
      {...props}
    >
      {loading ? "جارٍ المعالجة…" : children}
    </button>
  );
}

export function FormNotice({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className={`mb-4 rounded border px-3.5 py-2.5 text-sm ${
        kind === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-summit-100 bg-summit-50 text-summit-700"
      }`}
    >
      {children}
    </div>
  );
}

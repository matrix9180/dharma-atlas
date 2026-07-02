import type { ReactNode } from "react";

export const fieldClassName =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:shadow-[0_0_0_3px_rgba(184,137,74,0.15)]";

export const largeFieldClassName =
  "w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-base font-medium text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:shadow-[0_0_0_3px_rgba(184,137,74,0.15)]";

export const submitButtonClassName =
  "w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover";

export const largeSubmitButtonClassName =
  "w-full rounded-full bg-brand px-6 py-3.5 text-base font-bold text-brand-foreground transition hover:bg-brand-hover";

export function FormField({
  id,
  label,
  error,
  size = "default",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  size?: "default" | "large";
  children: ReactNode;
}) {
  const large = size === "large";
  return (
    <div>
      <label
        htmlFor={id}
        className={`block text-ink-secondary ${
          large ? "mb-2 text-sm font-bold" : "mb-1.5 text-xs font-semibold"
        }`}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className={`font-medium text-red-700 ${
            large ? "mt-2 text-sm" : "mt-1.5 text-xs"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
}

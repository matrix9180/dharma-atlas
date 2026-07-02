"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { DetailNav } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

interface FormPageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormPageShell({ title, description, children }: FormPageShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <DetailNav />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
        >
          <ArrowLeft size={18} weight="bold" />
          Back to explore
        </Link>

        <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>

        {description && (
          <p className="mt-3 text-lg font-medium leading-relaxed text-ink-secondary">{description}</p>
        )}

        <div className="mt-8">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}

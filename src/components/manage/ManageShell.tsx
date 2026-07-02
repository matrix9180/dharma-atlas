import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { SiteMenu } from "@/components/layout/SiteMenu";

export function ManageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-ink">
      <SiteHeader sticky>
        <div className="flex w-full items-center justify-between">
          <SiteLogo />
          <SiteMenu />
        </div>
      </SiteHeader>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface-elevated px-4 py-6">
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            Your listings
          </p>

          <nav className="flex flex-col gap-1">
            <Link
              href="/manage"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
            >
              Dashboard
            </Link>
            <Link
              href="/manage/places/new"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
            >
              Add location
            </Link>
            <Link
              href="/claim"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
            >
              Claim existing
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

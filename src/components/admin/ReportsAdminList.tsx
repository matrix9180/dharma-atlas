"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Report } from "@/lib/data/reports";
import { errorMessage } from "@/lib/form-errors";
import { reportReasonLabel } from "@/lib/report-reasons";
import {
  dismissReportAction,
  resolveReportAction,
} from "@/app/admin/actions/reports";

const filters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "dismissed", label: "Dismissed" },
] as const;

function adminEditHref(report: Report): string | null {
  if (report.entityType === "location") {
    return `/admin/places/${report.entityId}/edit`;
  }
  return `/admin/teachers/${report.entityId}/edit`;
}

export function ReportsAdminList({
  reports,
  currentStatus,
}: {
  reports: Report[];
  currentStatus: string;
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function reviewReport(
    event: FormEvent<HTMLFormElement>,
    action: (formData: FormData) => Promise<{ ok: boolean }>,
    id: number,
  ) {
    event.preventDefault();
    setPendingId(id);
    setErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    try {
      await action(new FormData(event.currentTarget));
      router.refresh();
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [id]: errorMessage(error, "Review failed"),
      }));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-6 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/reports" : `/admin/reports?status=${f.value}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              currentStatus === f.value
                ? "bg-brand text-brand-foreground"
                : "border border-border text-ink-secondary hover:bg-surface-muted"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {reports.map((report) => {
          const editHref = adminEditHref(report);

          return (
            <article
              key={report.id}
              className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    {report.entityType} · {report.status}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-xl font-semibold">
                    {report.entityName}
                  </h2>
                  <p className="mt-1 text-sm text-ink-secondary">
                    From {report.submitterEmail}
                  </p>
                </div>
                <time className="text-xs text-ink-muted">
                  {report.createdAt.toLocaleDateString()}
                </time>
              </div>

              <dl className="mt-4 grid gap-2 text-sm">
                <div>
                  <dt className="text-ink-muted">Reason</dt>
                  <dd>{reportReasonLabel(report.entityType, report.reason)}</dd>
                </div>
                {report.details && (
                  <div>
                    <dt className="text-ink-muted">Details</dt>
                    <dd className="whitespace-pre-wrap">{report.details}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-ink-muted">Listing</dt>
                  <dd className="flex flex-wrap gap-3">
                    <a
                      href={report.entityPath}
                      className="text-brand hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View public page
                    </a>
                    {editHref && (
                      <Link href={editHref} className="text-brand hover:underline">
                        Edit in admin
                      </Link>
                    )}
                  </dd>
                </div>
              </dl>

              {report.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  {editHref && (
                    <Link
                      href={editHref}
                      className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:bg-brand-hover"
                    >
                      Review listing
                    </Link>
                  )}
                  <form onSubmit={(event) => reviewReport(event, resolveReportAction, report.id)}>
                    <input type="hidden" name="id" value={report.id} />
                    <button
                      type="submit"
                      disabled={pendingId === report.id}
                      className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted disabled:opacity-50"
                    >
                      Mark resolved
                    </button>
                  </form>
                  <form onSubmit={(event) => reviewReport(event, dismissReportAction, report.id)}>
                    <input type="hidden" name="id" value={report.id} />
                    <button
                      type="submit"
                      disabled={pendingId === report.id}
                      className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              )}
              {errors[report.id] && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errors[report.id]}
                </p>
              )}
            </article>
          );
        })}
      </div>

      {reports.length === 0 && (
        <p className="py-12 text-center text-sm text-ink-muted">No reports in this view.</p>
      )}
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-server";
import { updateReportStatus } from "@/lib/data/reports";

async function reviewReport(id: number, status: "reviewed" | "dismissed") {
  const session = await requirePermission("report", "update");
  await updateReportStatus(id, status, session.user.email);
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function resolveReportAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("Invalid report id");
  return reviewReport(id, "reviewed");
}

export async function dismissReportAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("Invalid report id");
  return reviewReport(id, "dismissed");
}

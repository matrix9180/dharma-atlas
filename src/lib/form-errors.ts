import { ZodError } from "zod";

export type FieldErrors = Record<string, string>;

function fieldLabel(path: PropertyKey[]) {
  return path.map(String).join(".");
}

export function zodFieldErrors(error: ZodError): FieldErrors {
  const fields: FieldErrors = {};

  for (const issue of error.issues) {
    const key = fieldLabel(issue.path);
    if (!key || fields[key]) continue;
    fields[key] = issue.message;
  }

  return fields;
}

export function zodFormError(error: ZodError, fallback = "Check the highlighted fields.") {
  const formIssue = error.issues.find((issue) => issue.path.length === 0);
  return formIssue?.message ?? fallback;
}

export function errorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    if (!firstIssue) return fallback;
    const label = fieldLabel(firstIssue.path);
    return label ? `${label}: ${firstIssue.message}` : firstIssue.message;
  }

  return error instanceof Error ? error.message : fallback;
}

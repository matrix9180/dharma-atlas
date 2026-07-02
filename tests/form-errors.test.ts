import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  errorMessage,
  zodFieldErrors,
  zodFormError,
} from "@/lib/form-errors";

describe("form error helpers", () => {
  it("maps Zod issues to field errors", () => {
    const schema = z.object({
      email: z.string().email("Enter a valid email address"),
      profile: z.object({
        name: z.string().min(1, "Name is required"),
      }),
    });

    const result = schema.safeParse({ email: "nope", profile: { name: "" } });
    assert.equal(result.success, false);
    if (result.success) return;

    assert.deepEqual(zodFieldErrors(result.error), {
      email: "Enter a valid email address",
      "profile.name": "Name is required",
    });
  });

  it("formats Zod and generic errors for summaries", () => {
    const result = z.object({ name: z.string().min(1, "Name is required") }).safeParse({
      name: "",
    });
    assert.equal(result.success, false);
    if (result.success) return;

    assert.equal(zodFormError(result.error), "Check the highlighted fields.");
    assert.equal(errorMessage(result.error), "name: Name is required");
    assert.equal(errorMessage(new Error("Nope")), "Nope");
    assert.equal(errorMessage("wat", "Fallback"), "Fallback");
  });
});

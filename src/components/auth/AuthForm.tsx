"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { fieldClassName, FormField, submitButtonClassName } from "@/components/forms/FormField";
import type { FieldErrors } from "@/lib/form-errors";

type AuthMode = "signin" | "signup";

interface AuthFormProps {
  mode: AuthMode;
  redirectTo: string;
  alternateHref: string;
  alternateLabel: string;
}

export function AuthForm({ mode, redirectTo, alternateHref, alternateLabel }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function setField(field: "name" | "email" | "password", value: string) {
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    setFieldErrors((errors) => {
      if (!errors[field]) return errors;
      const next = { ...errors };
      delete next[field];
      return next;
    });
  }

  function validate() {
    const errors: FieldErrors = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (mode === "signup" && password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    return errors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setFieldErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setError("Check the highlighted fields.");
      setSubmitting(false);
      return;
    }

    if (mode === "signup") {
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name: name.trim() || email.split("@")[0] || "Member",
        callbackURL: redirectTo,
      });

      if (signUpError) {
        const message = signUpError.message || "Could not create account.";
        setError(message);
        setFieldErrors({ email: message });
        setSubmitting(false);
        return;
      }
    } else {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: redirectTo,
      });

      if (signInError) {
        const message = signInError.message || "Invalid email or password.";
        setError(message);
        setFieldErrors({ password: message });
        setSubmitting(false);
        return;
      }
    }

    window.location.assign(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <FormField id="name" label="Name" error={fieldErrors.name}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setField("name", e.target.value)}
            className={fieldClassName}
            placeholder="Your name"
          />
        </FormField>
      )}

      <FormField id="email" label="Email" error={fieldErrors.email}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setField("email", e.target.value)}
          className={fieldClassName}
        />
      </FormField>

      <FormField id="password" label="Password" error={fieldErrors.password}>
        <input
          id="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={8}
          value={password}
          onChange={(e) => setField("password", e.target.value)}
          className={fieldClassName}
        />
      </FormField>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className={submitButtonClassName}>
        {submitting
          ? mode === "signup"
            ? "Creating account…"
            : "Signing in…"
          : mode === "signup"
            ? "Create account"
            : "Sign in"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        <Link href={alternateHref} className="font-medium text-brand hover:underline">
          {alternateLabel}
        </Link>
      </p>
    </form>
  );
}

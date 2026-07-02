import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSession } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Sign in | Dharma Atlas",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;

  const session = await getSession();
  if (session) {
    redirect(redirectTo?.startsWith("/") ? redirectTo : "/");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
            Dharma Atlas
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-5xl font-bold">
            Sign in
          </h1>
          <p className="mt-3 text-lg font-medium text-ink-secondary">
            Manage your center&apos;s listing or continue a claim request.
          </p>
        </div>
        <AuthForm
          mode="signin"
          size="large"
          redirectTo={redirectTo ?? "/"}
          alternateHref={`/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          alternateLabel="Create an account"
        />
        <p className="mt-8 text-center text-sm font-medium text-ink-muted">
          <Link href="/" className="hover:text-ink">
            Back to explore
          </Link>
        </p>
      </div>
    </div>
  );
}

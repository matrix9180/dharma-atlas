"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CaretDown } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";

function AccountMenu({ name, email }: { name: string; email: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.right,
    });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    updateMenuPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [menuOpen, updateMenuPosition]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await authClient.signOut();
    window.location.assign("/");
  };

  const itemClassName =
    "block w-full px-4 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-surface-muted";

  const dropdown =
    menuOpen &&
    createPortal(
      <div
        ref={dropdownRef}
        role="menu"
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: menuPosition.left,
          transform: "translateX(-100%)",
        }}
        className="z-[1000] min-w-[13rem] overflow-hidden rounded-xl border border-border bg-surface-elevated py-1 shadow-[var(--shadow-float)]"
      >
        <div className="border-b border-border px-4 py-2.5">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="truncate text-xs text-ink-muted">{email}</p>
        </div>
        <Link
          href="/manage"
          role="menuitem"
          onClick={() => setMenuOpen(false)}
          className={itemClassName}
        >
          Manage listings
        </Link>
        <Link
          href="/submit"
          role="menuitem"
          onClick={() => setMenuOpen(false)}
          className={itemClassName}
        >
          Submit entry
        </Link>
        <Link
          href="/claim"
          role="menuitem"
          onClick={() => setMenuOpen(false)}
          className={itemClassName}
        >
          Claim location
        </Link>
        <div className="my-1 border-t border-border" aria-hidden />
        <button
          type="button"
          role="menuitem"
          onClick={handleLogout}
          className={itemClassName}
        >
          Log out
        </button>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setMenuOpen((open) => !open);
          if (!menuOpen) updateMenuPosition();
        }}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-semibold text-ink transition hover:border-border-strong hover:bg-surface-muted"
      >
        <span className="max-w-[8rem] truncate sm:max-w-[12rem]">{name}</span>
        <CaretDown
          size={14}
          weight="bold"
          className={`shrink-0 text-ink-muted transition-transform ${menuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {dropdown}
    </>
  );
}

export function SiteMenu() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <nav className="flex items-center gap-1 sm:gap-2" aria-label="Site">
      <Link
        href="/about"
        className="hidden rounded-full px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink sm:inline-flex"
      >
        About
      </Link>

      {isPending ? (
        <span className="h-10 w-10" aria-hidden />
      ) : session ? (
        <AccountMenu
          name={session.user.name?.trim() || session.user.email}
          email={session.user.email}
        />
      ) : (
        <>
          <Link
            href="/login"
            className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-semibold text-ink-secondary transition hover:bg-surface-muted hover:text-ink sm:px-3"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="whitespace-nowrap rounded-full bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition hover:opacity-90 sm:px-4"
          >
            Sign up
          </Link>
        </>
      )}
    </nav>
  );
}

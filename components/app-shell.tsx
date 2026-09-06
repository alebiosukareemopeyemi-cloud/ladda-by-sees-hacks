"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Monitor, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ---- navigation ------------------------------------------------------ */

const NAV = [
  { href: "/intake", label: "Intake" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/mentor", label: "Mentor" },
  { href: "/credentials", label: "Credentials" },
  { href: "/insights", label: "Insights" },
] as const;

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-control px-2.5 py-1.5 text-sm transition-colors duration-150",
        active
          ? "text-ink"
          : "text-ink-muted hover:text-ink hover:bg-paper"
      )}
    >
      {label}
      <span
        className={cn(
          "absolute inset-x-2.5 -bottom-px h-0.5 rounded-pill bg-growth transition-opacity duration-150",
          active ? "opacity-100" : "opacity-0"
        )}
      />
    </Link>
  );
}

/* ---- theme toggle -------------------------------------------------- */

type Theme = "light" | "dark" | "system";

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (t !== "system") root.classList.add(t);
  try {
    if (t === "system") localStorage.removeItem("ladda-theme");
    else localStorage.setItem("ladda-theme", t);
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
}

function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>("system");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("ladda-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function cycle() {
    const next: Theme =
      theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    applyTheme(next);
  }

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Theme: ${theme}. Switch.`}
      title={`Theme: ${theme}`}
    >
      {mounted ? <Icon /> : <Monitor />}
    </Button>
  );
}

/* ---- wordmark ---------------------------------------------------------- */

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      {/* the climb: a spine fragment stands in for the logo */}
      <svg
        width="14"
        height="26"
        viewBox="0 0 14 26"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M7 25V1"
          stroke="var(--color-growth)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="7" cy="5" r="3" fill="var(--color-growth)" />
        <circle
          cx="7"
          cy="14"
          r="3"
          fill="var(--color-surface)"
          stroke="var(--color-growth)"
          strokeWidth="2"
        />
        <circle
          cx="7"
          cy="23"
          r="3"
          fill="var(--color-surface)"
          stroke="var(--color-line)"
          strokeWidth="2"
        />
      </svg>
      <span className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">
        Ladda
      </span>
    </Link>
  );
}

/* ---- shell ---------------------------------------------------------- */

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();

  // close the mobile menu on route change
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Wordmark />
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-line bg-surface px-4 py-2 md:hidden">
            <ul className="flex flex-col">
              {NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-control px-2 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-growth-soft text-growth"
                          : "text-ink-muted hover:bg-paper hover:text-ink"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="eyebrow">Ladda · verifiable skills</p>
          <p className="text-xs text-ink-muted">
            Roadmaps cited to real, public career trajectories.
          </p>
        </div>
      </footer>
    </div>
  );
}

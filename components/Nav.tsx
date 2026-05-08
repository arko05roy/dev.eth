"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useProgress } from "@/lib/progress";

interface Route { href: string; label: string; }

const ROUTES: Route[] = [
  { href: "/path",         label: "PATH"        },
  { href: "/protocols",    label: "PROTOCOLS"   },
  { href: "/begin",        label: "BEGIN"       },
  { href: "/character",    label: "CHARACTER"   },
  { href: "/quests",       label: "QUESTS"      },
  { href: "/achievements", label: "RUNES"       },
];

export default function Nav() {
  const pathname = usePathname();
  const { hydrated, name, xp, level, watched } = useProgress();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Close drawer on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const isHome = pathname === "/";

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          scrolled ? "bg-void/85 backdrop-blur-md border-b border-[var(--hairline)]" : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-4">
          {/* Brand mark — dev.eth */}
          <a
            href="/"
            className="group shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            aria-label="dev.eth — home"
          >
            <span className="font-serif text-[18px] leading-none text-parch group-hover:text-ember transition-colors">
              dev<span className="text-ember">.</span>eth
            </span>
          </a>

          <span className="hidden sm:block h-4 w-px bg-[var(--hairline)]" aria-hidden />

          {/* Desktop route nav */}
          <nav className="hidden md:flex items-center gap-1">
            {ROUTES.map((r) => {
              const active = pathname === r.href || (r.href !== "/" && pathname?.startsWith(r.href));
              return (
                <a
                  key={r.href}
                  href={r.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-2.5 py-1 font-mono text-[10px] tracking-[0.22em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void ${
                    active ? "text-ember" : "text-parch-faint hover:text-parch"
                  }`}
                >
                  {r.label}
                </a>
              );
            })}
          </nav>

          <div className="flex-1" aria-hidden />

          {/* Right slot */}
          {hydrated && !isHome && (
            <a
              href="/character"
              className="hidden md:flex items-baseline gap-3 px-3 py-1 border border-transparent hover:border-[var(--hairline)] transition-colors font-mono text-[10px] tracking-[0.18em] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            >
              <span className="text-parch-faint truncate max-w-[10ch]">{name.toUpperCase()}</span>
              <span className="text-parch-ghost">·</span>
              <span className="text-ember">{level.current.name.split(" ")[0].toUpperCase()}</span>
              <span className="text-parch-ghost">·</span>
              <span className="text-parch-faint">{xp.toLocaleString()}<span className="text-parch-ghost ml-0.5">XP</span></span>
              <span className="text-parch-ghost">·</span>
              <span className="text-parch-faint">{watched.size}<span className="text-parch-ghost ml-0.5">Q</span></span>
            </a>
          )}
          {hydrated && isHome && (
            <a
              href="/path"
              className="hidden md:inline-flex items-baseline gap-2 px-3 py-1 border border-ember hover:bg-ember hover:text-void transition-colors font-mono text-[10px] tracking-[0.22em]"
            >
              ENTER <span className="opacity-70">→</span>
            </a>
          )}

          {/* Mobile XP chip — slim */}
          {hydrated && !isHome && (
            <a
              href="/character"
              className="md:hidden font-mono text-[10px] tracking-[0.18em] text-ember"
              aria-label={`${name} · ${xp} XP`}
            >
              {xp.toLocaleString()}<span className="text-parch-ghost text-[9px] ml-0.5">XP</span>
            </a>
          )}

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-expanded={drawerOpen}
            aria-controls="nav-drawer"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            className="md:hidden ml-1 -mr-1 p-2 text-parch hover:text-ember transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
          >
            <Hamburger open={drawerOpen} />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {drawerOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-void/70 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div
            id="nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="md:hidden fixed top-12 right-0 bottom-0 z-50 w-[85vw] max-w-sm bg-void border-l border-[var(--hairline)] overflow-y-auto fade-up"
          >
            <div className="p-6">
              {hydrated && (
                <div className="mb-6 pb-6 border-b border-[var(--hairline)]">
                  <p className="font-mono text-[10px] tracking-[0.25em] text-parch-faint mb-2">YOU ARE</p>
                  <p className="font-serif text-2xl text-parch leading-tight">{name}</p>
                  <p className="font-mono text-[10px] tracking-[0.22em] text-ember mt-1">
                    {level.current.name.toUpperCase()} · {xp.toLocaleString()} XP · {watched.size} QUESTS
                  </p>
                </div>
              )}

              <p className="font-mono text-[10px] tracking-[0.3em] text-parch-faint mb-3">NAVIGATE</p>
              <nav className="flex flex-col">
                {ROUTES.map((r) => {
                  const active = pathname === r.href || (r.href !== "/" && pathname?.startsWith(r.href));
                  return (
                    <a
                      key={r.href}
                      href={r.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-baseline justify-between py-3 border-b border-[var(--hairline)] font-serif text-xl transition-colors ${
                        active ? "text-ember" : "text-parch hover:text-ember"
                      }`}
                    >
                      <span className="italic">{r.label.toLowerCase()}</span>
                      <span className="font-mono text-[10px] tracking-[0.22em] text-parch-faint">
                        {r.label}
                      </span>
                    </a>
                  );
                })}
              </nav>

              <a
                href="/path"
                className="mt-6 inline-flex items-baseline gap-3 w-full justify-center px-5 py-4 border border-ember bg-void-50 hover:bg-ember hover:text-void transition-colors font-mono text-[11px] tracking-[0.3em]"
              >
                ✦ ENTER THE PATH →
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Hamburger({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      aria-hidden
    >
      {open ? (
        <>
          <line x1="4" y1="4" x2="18" y2="18" />
          <line x1="18" y1="4" x2="4" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="19" y2="6" />
          <line x1="3" y1="11" x2="19" y2="11" />
          <line x1="3" y1="16" x2="19" y2="16" />
        </>
      )}
    </svg>
  );
}

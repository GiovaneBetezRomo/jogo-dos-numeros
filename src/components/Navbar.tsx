"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Crosshair,
  LogOut,
  Menu,
  Shield,
  Trophy,
  User,
  X,
} from "lucide-react";
import { UserAvatar } from "./UserAvatar";

export interface NavUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
}

const NAV_LINKS = [
  { href: "/", label: "Início", icon: Shield },
  { href: "/jogar", label: "Jogar", icon: Crosshair },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/estatisticas", label: "Estatísticas", icon: BarChart3 },
];

export function Navbar({ initialUser }: { initialUser: NavUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-valorant-border/80 bg-valorant-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="group flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="valorant-cut flex h-10 w-10 items-center justify-center bg-valorant-red text-white shadow-glow-red transition-transform group-hover:scale-105">
            <Crosshair className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <span className="block font-display text-lg font-bold tracking-wider text-valorant-text">
              DESAFIO DOS NÚMEROS
            </span>
            <span className="block font-mono text-[10px] tracking-[0.2em] text-valorant-cyan">
              ARENA TÁTICA // V1
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                  active
                    ? "bg-valorant-red/15 text-valorant-red border border-valorant-red/40"
                    : "text-valorant-muted hover:bg-valorant-surface hover:text-valorant-text border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {initialUser ? (
            <>
              <Link
                href="/perfil"
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-1.5 transition-all ${
                  pathname.startsWith("/perfil")
                    ? "border-valorant-cyan/60 bg-valorant-cyan/10"
                    : "border-valorant-border bg-valorant-surface hover:border-valorant-cyan/50"
                }`}
              >
                <UserAvatar
                  username={initialUser.username}
                  avatarUrl={initialUser.avatarUrl}
                  size="sm"
                />
                <div className="text-left leading-tight">
                  <span className="block text-xs font-semibold text-valorant-text">
                    {initialUser.username}
                  </span>
                  <span className="block font-mono text-[10px] text-valorant-cyan">
                    PERFIL
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1.5 rounded-xl border border-valorant-border bg-valorant-surface px-3 py-2 text-xs font-semibold uppercase tracking-wider text-valorant-muted transition-colors hover:border-valorant-red/60 hover:text-valorant-red disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-valorant-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-valorant-text transition-colors hover:border-valorant-cyan hover:text-valorant-cyan"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="valorant-cut bg-valorant-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-glow-red transition-colors hover:bg-valorant-redHover"
              >
                Criar Conta
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-xl border border-valorant-border bg-valorant-surface p-2 text-valorant-text md:hidden"
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-valorant-border bg-valorant-surface/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    active
                      ? "bg-valorant-red/15 text-valorant-red border border-valorant-red/40"
                      : "text-valorant-muted hover:bg-valorant-card hover:text-valorant-text"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="my-2 h-px bg-valorant-border" />

            {initialUser ? (
              <>
                <Link
                  href="/perfil"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-valorant-border bg-valorant-card px-3.5 py-2.5"
                >
                  <User className="h-4 w-4 text-valorant-cyan" />
                  <span className="text-sm font-semibold text-valorant-text">
                    Perfil ({initialUser.username})
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center justify-center gap-2 rounded-xl border border-valorant-red/50 bg-valorant-red/10 py-2.5 text-sm font-semibold text-valorant-red"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da Conta
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-valorant-border py-2.5 text-center text-sm font-semibold text-valorant-text"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-valorant-red py-2.5 text-center text-sm font-bold text-white"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

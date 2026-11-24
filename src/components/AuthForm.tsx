"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, KeyRound, Mail, ShieldAlert, User } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

const PRESET_AVATARS = [
  "/avatars/agent-1.svg",
  "/avatars/agent-2.svg",
  "/avatars/agent-3.svg",
  "/avatars/agent-4.svg",
];

function getSafeNextPath(nextParam: string | null): string {
  if (!nextParam) return "/jogar";
  if (nextParam.startsWith("/") && !nextParam.startsWith("//")) {
    return nextParam;
  }
  return "/jogar";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"));

  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? { username, email, password, avatarUrl }
        : { identifier, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível autenticar.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Falha de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="tactical-panel rounded-2xl border border-valorant-border p-7">
        <div className="mb-6">
          <p className="font-mono text-xs tracking-[0.2em] text-valorant-cyan uppercase">
            {isRegister ? "ALISTAMENTO // NOVO AGENTE" : "ACESSO // ARENA"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-valorant-text">
            {isRegister ? "CRIAR CONTA" : "ENTRAR NA ARENA"}
          </h1>
          <p className="mt-1 text-sm text-valorant-muted">
            {isRegister
              ? "Cadastre-se para registrar suas partidas e disputar o ranking global."
              : "Entre com seu usuário ou e-mail para continuar suas partidas."}
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-valorant-red/50 bg-valorant-red/10 px-4 py-3 text-sm text-valorant-red">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister ? (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-valorant-muted">
                  Nome de usuário
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-valorant-muted" />
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={24}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: jett_br"
                    className="w-full rounded-xl border border-valorant-border bg-valorant-bg/90 py-2.5 pl-10 pr-4 text-sm text-valorant-text placeholder:text-valorant-muted/50 focus:border-valorant-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-valorant-muted">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-valorant-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    className="w-full rounded-xl border border-valorant-border bg-valorant-bg/90 py-2.5 pl-10 pr-4 text-sm text-valorant-text placeholder:text-valorant-muted/50 focus:border-valorant-cyan focus:outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-valorant-muted">
                E-mail ou Nome de usuário
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-valorant-muted" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="seu@email.com ou usuario"
                  className="w-full rounded-xl border border-valorant-border bg-valorant-bg/90 py-2.5 pl-10 pr-4 text-sm text-valorant-text placeholder:text-valorant-muted/50 focus:border-valorant-cyan focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-valorant-muted">
              Senha
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-valorant-muted" />
              <input
                type="password"
                required
                minLength={isRegister ? 6 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-valorant-border bg-valorant-bg/90 py-2.5 pl-10 pr-4 text-sm text-valorant-text placeholder:text-valorant-muted/50 focus:border-valorant-cyan focus:outline-none"
              />
            </div>
          </div>

          {isRegister && (
            <div className="rounded-xl border border-valorant-border/80 bg-valorant-bg/60 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-valorant-muted">
                  Foto de perfil (opcional)
                </label>
                <UserAvatar
                  username={username || "AG"}
                  avatarUrl={avatarUrl || null}
                  size="sm"
                />
              </div>

              <div className="mb-3 flex items-center gap-2">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setAvatarUrl((prev) => (prev === preset ? "" : preset))
                    }
                    className={`rounded-xl border p-0.5 transition-all ${
                      avatarUrl === preset
                        ? "border-valorant-cyan shadow-glow-cyan"
                        : "border-valorant-border hover:border-valorant-text/40"
                    }`}
                  >
                    <img
                      src={preset}
                      alt="Avatar tático"
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Ou cole uma URL (https://...)"
                className="w-full rounded-xl border border-valorant-border bg-valorant-surface px-3 py-2 text-xs text-valorant-text placeholder:text-valorant-muted/50 focus:border-valorant-cyan focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="valorant-cut mt-2 flex w-full items-center justify-center gap-2 bg-valorant-red py-3.5 font-display text-base font-bold uppercase tracking-widest text-white shadow-glow-red transition-colors hover:bg-valorant-redHover disabled:opacity-60"
          >
            {loading
              ? "PROCESSANDO..."
              : isRegister
                ? "CADASTRAR E JOGAR"
                : "ENTRAR NA ARENA"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-valorant-border/70 pt-4 text-center text-sm text-valorant-muted">
          {isRegister ? (
            <>
              Já tem uma conta?{" "}
              <Link
                href={`/login?next=${encodeURIComponent(nextPath)}`}
                className="font-semibold text-valorant-cyan hover:underline"
              >
                Entrar
              </Link>
            </>
          ) : (
            <>
              Ainda não tem conta?{" "}
              <Link
                href={`/cadastro?next=${encodeURIComponent(nextPath)}`}
                className="font-semibold text-valorant-cyan hover:underline"
              >
                Criar conta grátis
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

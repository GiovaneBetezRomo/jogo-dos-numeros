"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Crosshair, Save, Trophy } from "lucide-react";
import { DIFFICULTY_CONFIGS } from "@/lib/game-config";
import type { SerializedGame } from "@/lib/game-serializer";
import { UserAvatar } from "./UserAvatar";

const PRESET_AVATARS = [
  "/avatars/agent-1.svg",
  "/avatars/agent-2.svg",
  "/avatars/agent-3.svg",
  "/avatars/agent-4.svg",
];

interface ProfilePanelProps {
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
    createdAt: string;
  };
  stats: {
    totalGames: number;
    totalWins: number;
    totalAttempts: number;
    totalPoints: number;
    accuracyRate: number;
  };
  history: SerializedGame[];
}

export function ProfilePanel({ user, stats, history }: ProfilePanelProps) {
  const router = useRouter();
  const [username, setUsername] = useState(user.username);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao atualizar perfil.");
        return;
      }
      setMessage("Perfil atualizado com sucesso!");
      router.refresh();
    } catch {
      setError("Falha de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header & Stats */}
      <div className="tactical-panel rounded-2xl border border-valorant-border p-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <UserAvatar
              username={username || user.username}
              avatarUrl={avatarUrl || null}
              size="lg"
            />
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-valorant-cyan uppercase">
                DOSSIÊ DO AGENTE
              </p>
              <h1 className="font-display text-3xl font-bold text-valorant-text">
                {user.username}
              </h1>
              <p className="text-sm text-valorant-muted">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-valorant-border bg-valorant-bg/80 px-4 py-3">
              <span className="block font-mono text-[10px] uppercase text-valorant-muted">
                Pontos
              </span>
              <span className="font-mono text-xl font-bold text-valorant-cyan">
                {stats.totalPoints}
              </span>
            </div>
            <div className="rounded-xl border border-valorant-border bg-valorant-bg/80 px-4 py-3">
              <span className="block font-mono text-[10px] uppercase text-valorant-muted">
                Acertos
              </span>
              <span className="font-mono text-xl font-bold text-emerald-400">
                {stats.totalWins}
              </span>
            </div>
            <div className="rounded-xl border border-valorant-border bg-valorant-bg/80 px-4 py-3">
              <span className="block font-mono text-[10px] uppercase text-valorant-muted">
                Tentativas
              </span>
              <span className="font-mono text-xl font-bold text-valorant-text">
                {stats.totalAttempts}
              </span>
            </div>
            <div className="rounded-xl border border-valorant-border bg-valorant-bg/80 px-4 py-3">
              <span className="block font-mono text-[10px] uppercase text-valorant-muted">
                Taxa de Acerto
              </span>
              <span className="font-mono text-xl font-bold text-valorant-purple">
                {stats.accuracyRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Edit Profile */}
        <div className="tactical-panel rounded-2xl border border-valorant-border p-6">
          <h2 className="font-display text-xl font-bold tracking-wider text-valorant-text uppercase">
            Editar Perfil
          </h2>
          <p className="mt-1 text-xs text-valorant-muted">
            Personalize seu codinome e avatar no ranking global.
          </p>

          {message && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              <Check className="h-4 w-4" />
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-valorant-red/40 bg-valorant-red/10 px-3 py-2 text-xs text-valorant-red">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-valorant-muted">
                Nome de usuário
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={24}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-valorant-border bg-valorant-bg px-3.5 py-2.5 text-sm text-valorant-text focus:border-valorant-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-valorant-muted">
                Avatar tático ou URL personalizada
              </label>
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
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://... (opcional)"
                className="w-full rounded-xl border border-valorant-border bg-valorant-bg px-3.5 py-2.5 text-xs text-valorant-text placeholder:text-valorant-muted/50 focus:border-valorant-cyan focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="valorant-cut flex w-full items-center justify-center gap-2 bg-valorant-red py-3 font-display text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-valorant-redHover disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
            </button>
          </form>
        </div>

        {/* Match History */}
        <div className="tactical-panel rounded-2xl border border-valorant-border p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-wider text-valorant-text uppercase">
              Histórico de Partidas ({stats.totalGames})
            </h2>
            <Link
              href="/jogar"
              className="inline-flex items-center gap-1.5 rounded-xl border border-valorant-cyan/40 bg-valorant-cyan/10 px-3 py-1.5 text-xs font-semibold text-valorant-cyan hover:bg-valorant-cyan/20"
            >
              <Crosshair className="h-3.5 w-3.5" />
              Nova Partida
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-valorant-border py-12 text-center">
              <Trophy className="mx-auto mb-2 h-7 w-7 text-valorant-muted" />
              <p className="text-sm text-valorant-muted">
                Você ainda não jogou nenhuma partida.
              </p>
              <Link
                href="/"
                className="mt-3 inline-block text-xs font-bold uppercase tracking-wider text-valorant-cyan hover:underline"
              >
                Escolher modalidade e jogar →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-valorant-border text-[11px] font-mono uppercase tracking-wider text-valorant-muted">
                    <th className="pb-3 pr-4">Modalidade</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Tentativas</th>
                    <th className="pb-3 pr-4">Número</th>
                    <th className="pb-3 pr-4">Pontos</th>
                    <th className="pb-3">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-valorant-border/50">
                  {history.map((item) => {
                    const diff = DIFFICULTY_CONFIGS[item.difficulty];
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 pr-4 font-semibold text-valorant-text">
                          {diff.badgeEmoji} {diff.name}
                        </td>
                        <td className="py-3 pr-4">
                          {item.status === "WON" ? (
                            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                              VITÓRIA
                            </span>
                          ) : item.status === "IN_PROGRESS" ? (
                            <Link
                              href={`/jogar?difficulty=${item.difficulty}`}
                              className="rounded-full border border-valorant-cyan/40 bg-valorant-cyan/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-valorant-cyan hover:underline"
                            >
                              EM ANDAMENTO
                            </Link>
                          ) : (
                            <span className="rounded-full border border-valorant-border bg-valorant-bg px-2.5 py-0.5 font-mono text-[11px] text-valorant-muted">
                              ENCERRADA
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 font-mono text-valorant-text">
                          {item.attemptsCount}
                        </td>
                        <td className="py-3 pr-4 font-mono text-valorant-cyan">
                          {item.secretNumber ?? "•••"}
                        </td>
                        <td className="py-3 pr-4 font-mono font-bold text-valorant-purple">
                          {item.score ? `+${item.score.totalPoints}` : "0"}
                        </td>
                        <td className="py-3 font-mono text-xs text-valorant-muted">
                          {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

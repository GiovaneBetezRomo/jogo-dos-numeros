import Link from "next/link";
import { ArrowRight, Crosshair, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { DifficultyCards } from "@/components/DifficultyCards";
import { UserAvatar } from "@/components/UserAvatar";
import { DIFFICULTY_LIST } from "@/lib/game-config";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";
import { getLeaderboard } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSessionFromCookies();

  let activeGame: { id: string; difficulty: "EASY" | "MEDIUM" | "HARD"; attemptsCount: number } | null = null;
  let topThree: Awaited<ReturnType<typeof getLeaderboard>> = [];
  let dbWarning = false;

  try {
    const [leaderboard, currentActive] = await Promise.all([
      getLeaderboard(),
      session
        ? prisma.game.findFirst({
            where: { userId: session.userId, status: "IN_PROGRESS" },
            orderBy: { createdAt: "desc" },
            select: { id: true, difficulty: true, attemptsCount: true },
          })
        : Promise.resolve(null),
    ]);
    topThree = leaderboard.slice(0, 3);
    activeGame = currentActive;
  } catch {
    dbWarning = true;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:py-14">
      {dbWarning && (
        <div className="rounded-2xl border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Banco Neon ainda não conectado localmente. Configure a variável{" "}
          <code className="font-mono font-bold">DATABASE_URL</code> no arquivo{" "}
          <code className="font-mono font-bold">.env</code> e execute as migrations do Prisma.
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-valorant-border bg-gradient-to-br from-valorant-surface via-valorant-bg to-valorant-card p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-valorant-red/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-valorant-cyan/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-valorant-red/40 bg-valorant-red/10 px-3.5 py-1 font-mono text-xs font-semibold tracking-[0.2em] text-valorant-red uppercase">
            <Crosshair className="h-3.5 w-3.5" />
            PROTOCOLO VALORANT // DESAFIO DE PRECISÃO
          </div>

          <h1 className="font-display text-4xl font-bold tracking-wider text-valorant-text sm:text-6xl">
            DESAFIO DOS <span className="text-valorant-red">NÚMEROS</span>
          </h1>

          <p className="mt-4 text-lg text-valorant-text/90 sm:text-xl">
            &ldquo;Será que você consegue descobrir o número secreto?&rdquo;
          </p>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-valorant-muted">
            Cada rodada gera um código aleatório exclusivo no servidor. Leia as dicas
            de maior ou menor, acerte com o mínimo de tentativas para ganhar bônus
            táticos e conquiste o topo do ranking global.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {activeGame ? (
              <Link
                href={`/jogar?difficulty=${activeGame.difficulty}`}
                className="valorant-cut inline-flex items-center gap-2 bg-valorant-cyan px-6 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-slate-950 shadow-glow-cyan transition-opacity hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                CONTINUAR PARTIDA ({activeGame.attemptsCount} tentativas)
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={session ? "/jogar" : "/cadastro"}
                className="valorant-cut inline-flex items-center gap-2 bg-valorant-red px-6 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white shadow-glow-red transition-colors hover:bg-valorant-redHover"
              >
                {session ? "IR PARA ARENA" : "CRIAR CONTA E JOGAR"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <Link
              href="/ranking"
              className="inline-flex items-center gap-2 rounded-xl border border-valorant-border bg-valorant-surface px-5 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-valorant-text transition-colors hover:border-valorant-cyan hover:text-valorant-cyan"
            >
              <Trophy className="h-4 w-4 text-valorant-gold" />
              VER RANKING GLOBAL
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Difficulty Cards */}
      <section>
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-valorant-cyan uppercase">
              ESCOLHA SUA MODALIDADE
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-wide text-valorant-text">
              SELECIONE O NÍVEL DE DIFICULDADE
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-valorant-muted">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Número secreto protegido e validado 100% no servidor
          </span>
        </div>

        <DifficultyCards isAuthenticated={Boolean(session)} />
      </section>

      {/* Top 3 Podium Preview & Scoring Breakdown */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="tactical-panel rounded-2xl border border-valorant-border p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-valorant-gold uppercase">
                ELITE DA ARENA
              </p>
              <h2 className="mt-0.5 font-display text-2xl font-bold text-valorant-text">
                TOP 3 NO RANKING
              </h2>
            </div>
            <Link
              href="/ranking"
              className="text-xs font-bold uppercase tracking-wider text-valorant-cyan hover:underline"
            >
              Ver completo →
            </Link>
          </div>

          {topThree.length === 0 ? (
            <p className="rounded-xl border border-dashed border-valorant-border py-10 text-center text-sm text-valorant-muted">
              Nenhuma partida finalizada ainda. Seja o primeiro a assumir o 1º lugar!
            </p>
          ) : (
            <div className="space-y-3">
              {topThree.map((entry) => {
                const medal =
                  entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉";
                return (
                  <div
                    key={entry.userId}
                    className="flex items-center justify-between rounded-xl border border-valorant-border/80 bg-valorant-bg/80 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{medal}</span>
                      <UserAvatar
                        username={entry.username}
                        avatarUrl={entry.avatarUrl}
                        size="sm"
                      />
                      <div>
                        <span className="block font-semibold text-valorant-text">
                          {entry.username}
                        </span>
                        <span className="block font-mono text-[11px] text-valorant-muted">
                          {entry.totalWins} acertos • {entry.totalAttempts} tentativas
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-lg font-bold text-valorant-cyan">
                      {entry.totalPoints} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="tactical-panel rounded-2xl border border-valorant-border p-6">
          <p className="font-mono text-xs tracking-[0.2em] text-valorant-purple uppercase">
            SISTEMA DE PONTUAÇÃO
          </p>
          <h2 className="mt-0.5 font-display text-2xl font-bold text-valorant-text">
            PONTOS + BÔNUS DE PRECISÃO
          </h2>
          <p className="mt-1 text-xs text-valorant-muted">
            Quanto menos tentativas você precisar, maior o bônus calculado pelo servidor.
          </p>

          <div className="mt-4 space-y-3">
            {DIFFICULTY_LIST.map((diff) => (
              <div
                key={diff.key}
                className="rounded-xl border border-valorant-border/70 bg-valorant-bg/75 p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-base font-bold text-valorant-text">
                    {diff.badgeEmoji} {diff.name} ({diff.min} a {diff.max})
                  </span>
                  <span className="font-mono text-xs font-bold text-valorant-cyan">
                    Base: {diff.basePoints} pts | Máx: {diff.basePoints + diff.maxBonus} pts
                  </span>
                </div>
                <p className="mt-1 text-xs text-valorant-muted">
                  {diff.bonusRules.map((r) => r.label).join(" • ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

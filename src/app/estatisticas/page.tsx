import {
  Activity,
  Award,
  BarChart3,
  Crosshair,
  Target,
  Users,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { DIFFICULTY_CONFIGS, DIFFICULTY_LIST } from "@/lib/game-config";
import { getGlobalStats, type GlobalStatsData } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function EstatisticasPage() {
  let stats: GlobalStatsData = {
    totalUsers: 0,
    activePlayers: 0,
    totalGames: 0,
    totalWins: 0,
    totalGuesses: 0,
    topPlayer: null,
    mostPlayedDifficulty: null,
    difficultyBreakdown: { EASY: 0, MEDIUM: 0, HARD: 0 },
    playersSummary: [],
    recentGames: [],
  };
  let dbError = false;

  try {
    stats = await getGlobalStats();
  } catch {
    dbError = true;
  }

  const mostPlayedConfig = stats.mostPlayedDifficulty
    ? DIFFICULTY_CONFIGS[stats.mostPlayedDifficulty]
    : null;

  const metricCards = [
    {
      label: "Usuários Cadastrados",
      value: stats.totalUsers,
      icon: Users,
      accent: "text-valorant-cyan",
    },
    {
      label: "Jogadores Participantes",
      value: stats.activePlayers,
      icon: Activity,
      accent: "text-emerald-400",
    },
    {
      label: "Partidas Jogadas",
      value: stats.totalGames,
      icon: Crosshair,
      accent: "text-valorant-text",
    },
    {
      label: "Números Acertados",
      value: stats.totalWins,
      icon: Target,
      accent: "text-valorant-red",
    },
    {
      label: "Tentativas Realizadas",
      value: stats.totalGuesses,
      icon: BarChart3,
      accent: "text-valorant-purple",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div>
        <p className="font-mono text-xs tracking-[0.2em] text-valorant-cyan uppercase">
          TELEMETRIA DA ARENA // NEON POSTGRESQL
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-wide text-valorant-text">
          PAINEL DE ESTATÍSTICAS
        </h1>
        <p className="mt-1 text-sm text-valorant-muted">
          Dados consolidados de todos os jogadores, partidas, palpites e modalidades.
        </p>
      </div>

      {dbError && (
        <div className="rounded-2xl border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Não foi possível carregar as estatísticas porque o banco Neon ainda não está conectado.
        </div>
      )}

      {/* Main KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="tactical-panel rounded-2xl border border-valorant-border p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-valorant-muted">
                  {card.label}
                </span>
                <Icon className={`h-4 w-4 ${card.accent}`} />
              </div>
              <p className={`mt-3 font-mono text-3xl font-bold ${card.accent}`}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Highlights: Top Player & Most Played Mode */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="tactical-panel rounded-2xl border border-valorant-border p-6">
          <div className="flex items-center gap-2 text-valorant-gold">
            <Award className="h-5 w-5" />
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-valorant-text">
              Melhor Jogador da Arena
            </h2>
          </div>

          {stats.topPlayer ? (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-valorant-gold/40 bg-valorant-bg/80 p-4">
              <div className="flex items-center gap-3.5">
                <UserAvatar
                  username={stats.topPlayer.username}
                  avatarUrl={stats.topPlayer.avatarUrl}
                  size="lg"
                />
                <div>
                  <span className="block font-display text-2xl font-bold text-valorant-text">
                    🥇 {stats.topPlayer.username}
                  </span>
                  <span className="block font-mono text-xs text-valorant-muted">
                    {stats.topPlayer.totalWins} acertos •{" "}
                    {stats.topPlayer.totalGames} partidas •{" "}
                    {stats.topPlayer.accuracyRate}% precisão
                  </span>
                </div>
              </div>
              <span className="font-mono text-2xl font-bold text-valorant-cyan">
                {stats.topPlayer.totalPoints} pts
              </span>
            </div>
          ) : (
            <p className="mt-5 text-sm text-valorant-muted">
              Nenhum jogador pontuou ainda.
            </p>
          )}
        </div>

        <div className="tactical-panel rounded-2xl border border-valorant-border p-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-wider text-valorant-text">
            Modalidade Mais Jogada
          </h2>
          <p className="mt-1 text-sm text-valorant-muted">
            {mostPlayedConfig ? (
              <>
                <span className="font-bold text-valorant-cyan">
                  {mostPlayedConfig.badgeEmoji} {mostPlayedConfig.name} (
                  {mostPlayedConfig.min} até {mostPlayedConfig.max})
                </span>{" "}
                lidera com {stats.difficultyBreakdown[mostPlayedConfig.key]} partidas.
              </>
            ) : (
              "Nenhuma partida iniciada ainda."
            )}
          </p>

          <div className="mt-5 space-y-3">
            {DIFFICULTY_LIST.map((diff) => {
              const count = stats.difficultyBreakdown[diff.key];
              const pct =
                stats.totalGames > 0
                  ? Math.round((count / stats.totalGames) * 100)
                  : 0;
              return (
                <div key={diff.key}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold text-valorant-text">
                      {diff.badgeEmoji} {diff.name} ({diff.min}–{diff.max})
                    </span>
                    <span className="font-mono text-valorant-muted">
                      {count} partidas ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-valorant-bg">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-valorant-cyan to-valorant-purple"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Players & Results Table */}
      <div className="tactical-panel rounded-2xl border border-valorant-border p-6">
        <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-valorant-text">
          Jogadores que Participaram e Seus Resultados
        </h2>

        {stats.playersSummary.length === 0 ? (
          <p className="py-8 text-center text-sm text-valorant-muted">
            Nenhum jogador participou de partidas ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-valorant-border font-mono text-[11px] uppercase tracking-wider text-valorant-muted">
                  <th className="pb-3 pr-4">Jogador</th>
                  <th className="pb-3 pr-4">Partidas</th>
                  <th className="pb-3 pr-4">Acertos</th>
                  <th className="pb-3 pr-4">Tentativas</th>
                  <th className="pb-3 pr-4">Taxa de Acerto</th>
                  <th className="pb-3 text-right">Pontuação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-valorant-border/50">
                {stats.playersSummary.map((player) => (
                  <tr key={player.userId} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          username={player.username}
                          avatarUrl={player.avatarUrl}
                          size="sm"
                        />
                        <span className="font-semibold text-valorant-text">
                          {player.username}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-valorant-text">
                      {player.totalGames}
                    </td>
                    <td className="py-3 pr-4 font-mono text-emerald-400">
                      {player.totalWins}
                    </td>
                    <td className="py-3 pr-4 font-mono text-valorant-muted">
                      {player.totalAttempts}
                    </td>
                    <td className="py-3 pr-4 font-mono text-valorant-purple">
                      {player.accuracyRate}%
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-valorant-cyan">
                      {player.totalPoints} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Matches */}
      {stats.recentGames.length > 0 && (
        <div className="tactical-panel rounded-2xl border border-valorant-border p-6">
          <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-wider text-valorant-text">
            Últimas Partidas Registradas
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.recentGames.map((game) => {
              const diff = DIFFICULTY_CONFIGS[game.difficulty];
              return (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-xl border border-valorant-border/70 bg-valorant-bg/75 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      username={game.username}
                      avatarUrl={game.avatarUrl}
                      size="sm"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-valorant-text">
                        {game.username}
                      </span>
                      <span className="block font-mono text-[11px] text-valorant-muted">
                        {diff.badgeEmoji} {diff.name} • {game.attemptsCount} tentativas
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold ${
                      game.status === "WON"
                        ? "text-emerald-400"
                        : game.status === "IN_PROGRESS"
                          ? "text-valorant-cyan"
                          : "text-valorant-muted"
                    }`}
                  >
                    {game.status === "WON"
                      ? `+${game.totalPoints ?? 0} pts`
                      : game.status === "IN_PROGRESS"
                        ? "EM JOGO"
                        : "ENCERRADA"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

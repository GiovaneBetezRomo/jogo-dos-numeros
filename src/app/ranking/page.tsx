import Link from "next/link";
import { Crosshair, Trophy } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { getLeaderboard } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  let ranking: Awaited<ReturnType<typeof getLeaderboard>> = [];
  let dbError = false;

  try {
    ranking = await getLeaderboard();
  } catch {
    dbError = true;
  }

  const podium = ranking.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-valorant-gold uppercase">
            CLASSIFICAÇÃO MUNDIAL // TEMPO REAL
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-wide text-valorant-text">
            RANKING GLOBAL
          </h1>
          <p className="mt-1 text-sm text-valorant-muted">
            Ordenado por maior pontuação, maior número de acertos e menor total de tentativas.
          </p>
        </div>

        <Link
          href="/jogar"
          className="valorant-cut inline-flex items-center gap-2 bg-valorant-red px-5 py-3 font-display text-sm font-bold uppercase tracking-widest text-white shadow-glow-red transition-colors hover:bg-valorant-redHover"
        >
          <Crosshair className="h-4 w-4" />
          DISPUTAR RANKING
        </Link>
      </div>

      {dbError && (
        <div className="rounded-2xl border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Não foi possível carregar o ranking porque o banco Neon ainda não está conectado.
        </div>
      )}

      {/* Top 3 Podium Cards */}
      {podium.length > 0 && (
        <div className="grid gap-5 md:grid-cols-3">
          {podium.map((player) => {
            const isFirst = player.rank === 1;
            const isSecond = player.rank === 2;
            const medal = isFirst ? "🥇" : isSecond ? "🥈" : "🥉";
            const borderClass = isFirst
              ? "border-valorant-gold/70 shadow-[0_0_32px_rgba(255,184,0,0.2)]"
              : isSecond
                ? "border-slate-300/50 shadow-[0_0_24px_rgba(203,213,225,0.12)]"
                : "border-amber-600/60 shadow-[0_0_24px_rgba(217,119,6,0.14)]";

            return (
              <div
                key={player.userId}
                className={`tactical-panel rounded-2xl border p-6 ${borderClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-bold text-valorant-text">
                    {medal} #{player.rank} LUGAR
                  </span>
                  <span className="rounded-full border border-valorant-cyan/40 bg-valorant-cyan/10 px-3 py-1 font-mono text-xs font-bold text-valorant-cyan">
                    {player.totalPoints} pts
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-3.5">
                  <UserAvatar
                    username={player.username}
                    avatarUrl={player.avatarUrl}
                    size="lg"
                  />
                  <div>
                    <h2 className="font-display text-2xl font-bold text-valorant-text">
                      {player.username}
                    </h2>
                    <p className="font-mono text-xs text-valorant-muted">
                      {player.totalWins} acertos em {player.totalGames} partidas
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-valorant-border/70 bg-valorant-bg/75 p-3 text-center">
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-valorant-muted">
                      Partidas
                    </span>
                    <span className="font-mono text-sm font-bold text-valorant-text">
                      {player.totalGames}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-valorant-muted">
                      Tentativas
                    </span>
                    <span className="font-mono text-sm font-bold text-valorant-text">
                      {player.totalAttempts}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-valorant-muted">
                      Precisão
                    </span>
                    <span className="font-mono text-sm font-bold text-valorant-purple">
                      {player.accuracyRate}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="tactical-panel rounded-2xl border border-valorant-border p-6">
        {ranking.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="mx-auto mb-3 h-9 w-9 text-valorant-muted" />
            <p className="text-sm text-valorant-muted">
              Ainda não há jogadores no ranking. Inicie uma partida para estrear a tabela!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-valorant-border font-mono text-[11px] uppercase tracking-wider text-valorant-muted">
                  <th className="pb-3 pr-4">Posição</th>
                  <th className="pb-3 pr-4">Jogador</th>
                  <th className="pb-3 pr-4">Partidas</th>
                  <th className="pb-3 pr-4">Acertos</th>
                  <th className="pb-3 pr-4">Tentativas</th>
                  <th className="pb-3 pr-4">Taxa de Acerto</th>
                  <th className="pb-3 text-right">Pontuação Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-valorant-border/50">
                {ranking.map((entry) => {
                  const medal =
                    entry.rank === 1
                      ? "🥇"
                      : entry.rank === 2
                        ? "🥈"
                        : entry.rank === 3
                          ? "🥉"
                          : null;
                  return (
                    <tr
                      key={entry.userId}
                      className={`hover:bg-white/[0.02] ${
                        entry.rank <= 3 ? "bg-valorant-surface/40" : ""
                      }`}
                    >
                      <td className="py-3.5 pr-4 font-mono font-bold text-valorant-text">
                        {medal ? `${medal} ` : ""}#{entry.rank}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            username={entry.username}
                            avatarUrl={entry.avatarUrl}
                            size="sm"
                          />
                          <span className="font-semibold text-valorant-text">
                            {entry.username}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-valorant-text">
                        {entry.totalGames}
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-emerald-400">
                        {entry.totalWins}
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-valorant-muted">
                        {entry.totalAttempts}
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-valorant-purple">
                        {entry.accuracyRate}%
                      </td>
                      <td className="py-3.5 text-right font-mono text-base font-bold text-valorant-cyan">
                        {entry.totalPoints} pts
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
  );
}

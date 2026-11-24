"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Difficulty } from "@prisma/client";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Crosshair,
  History,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { DIFFICULTY_CONFIGS, DIFFICULTY_LIST } from "@/lib/game-config";
import type { SerializedGame } from "@/lib/game-serializer";
import { UserAvatar } from "./UserAvatar";

interface GameArenaProps {
  player: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  initialGame: SerializedGame | null;
  requestedDifficulty: Difficulty;
}

const CONFETTI_COLORS = ["#FF4655", "#00F0FF", "#9D4EDD", "#FFB800", "#34D399"];

export function GameArena({
  player,
  initialGame,
  requestedDifficulty,
}: GameArenaProps) {
  const [game, setGame] = useState<SerializedGame | null>(initialGame);
  const [guessInput, setGuessInput] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(() => {
    if (!initialGame) return null;
    if (initialGame.status === "WON") return "🎉 PARABÉNS! VOCÊ ACERTOU!";
    const last = initialGame.guesses[initialGame.guesses.length - 1];
    if (!last) return null;
    return last.feedback === "HIGHER"
      ? "Errou! O número secreto é MAIOR."
      : "Errou! O número secreto é MENOR.";
  });
  const [lastFeedbackType, setLastFeedbackType] = useState<
    "HIGHER" | "LOWER" | "CORRECT" | null
  >(() => {
    if (!initialGame) return null;
    const last = initialGame.guesses[initialGame.guesses.length - 1];
    return last?.feedback ?? null;
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-start a match on first arrival if user doesn't have an active match yet.
  useEffect(() => {
    if (!game && !starting) {
      void startNewGame(requestedDifficulty, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (game?.status === "IN_PROGRESS") {
      inputRef.current?.focus();
    }
  }, [game?.id, game?.attemptsCount, game?.status]);

  async function startNewGame(difficulty: Difficulty, forceNew = true) {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, forceNew }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao iniciar partida.");
        return;
      }
      const nextGame: SerializedGame = data.game;
      setGame(nextGame);
      setGuessInput("");
      const last = nextGame.guesses[nextGame.guesses.length - 1];
      if (nextGame.status === "WON") {
        setLastFeedbackType("CORRECT");
        setFeedbackMessage("🎉 PARABÉNS! VOCÊ ACERTOU!");
      } else if (last) {
        setLastFeedbackType(last.feedback);
        setFeedbackMessage(
          last.feedback === "HIGHER"
            ? "Errou! O número secreto é MAIOR."
            : "Errou! O número secreto é MENOR."
        );
      } else {
        setLastFeedbackType(null);
        setFeedbackMessage(null);
      }
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setStarting(false);
    }
  }

  async function handleGuessSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!game || game.status !== "IN_PROGRESS" || submitting) return;

    const numericValue = Number(guessInput.trim());
    if (
      !guessInput.trim() ||
      !Number.isInteger(numericValue) ||
      numericValue < game.minNumber ||
      numericValue > game.maxNumber
    ) {
      setError(
        `Digite um número inteiro válido entre ${game.minNumber} e ${game.maxNumber}.`
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/${game.id}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: numericValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar palpite.");
        return;
      }

      setGame(data.game);
      setLastFeedbackType(data.feedback);
      setFeedbackMessage(data.message);
      setGuessInput("");
    } catch {
      setError("Falha de conexão ao enviar palpite.");
    } finally {
      setSubmitting(false);
    }
  }

  const activeDifficulty = game
    ? DIFFICULTY_CONFIGS[game.difficulty]
    : DIFFICULTY_CONFIGS[requestedDifficulty];

  // Dynamic tactical range derived strictly from server-validated feedback history.
  const tacticalBounds = useMemo(() => {
    if (!game) return { low: 1, high: activeDifficulty.max };
    let low = game.minNumber;
    let high = game.maxNumber;
    for (const g of game.guesses) {
      if (g.feedback === "HIGHER" && g.value + 1 > low) {
        low = g.value + 1;
      } else if (g.feedback === "LOWER" && g.value - 1 < high) {
        high = g.value - 1;
      }
    }
    return { low, high };
  }, [game, activeDifficulty.max]);

  const isWon = game?.status === "WON";

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8">
      {isWon && (
        <div
          className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: 28 }).map((_, idx) => (
            <span
              key={idx}
              className="absolute top-0 h-3 w-2 rounded-sm animate-confetti-fall"
              style={{
                left: `${(idx * 3.7) % 100}%`,
                backgroundColor: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
                animationDelay: `${(idx % 7) * 0.12}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Top Agent & Mode Bar */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-valorant-border bg-valorant-surface/80 p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <UserAvatar
            username={player.username}
            avatarUrl={player.avatarUrl}
            size="md"
          />
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-valorant-cyan uppercase">
              AGENTE EM OPERAÇÃO
            </p>
            <h1 className="font-display text-2xl font-bold tracking-wide text-valorant-text">
              {player.username}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {DIFFICULTY_LIST.map((diff) => {
            const selected = activeDifficulty.key === diff.key;
            return (
              <button
                key={diff.key}
                type="button"
                disabled={starting}
                onClick={() => startNewGame(diff.key, true)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
                  selected
                    ? "border-valorant-red bg-valorant-red/20 text-valorant-text shadow-glow-red"
                    : "border-valorant-border bg-valorant-bg/70 text-valorant-muted hover:border-valorant-cyan/60 hover:text-valorant-text"
                }`}
              >
                {diff.badgeEmoji} {diff.name} ({diff.min}–{diff.max})
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Arena Panel */}
        <div className="tactical-panel rounded-2xl border border-valorant-border p-6 lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-valorant-border/70 pb-4">
            <div>
              <span className="font-mono text-xs tracking-[0.2em] text-valorant-purple uppercase">
                {activeDifficulty.tag}
              </span>
              <h2 className="mt-0.5 font-display text-2xl font-bold tracking-wide text-valorant-text">
                {activeDifficulty.badgeEmoji} MODO {activeDifficulty.name} —{" "}
                {activeDifficulty.min} até {activeDifficulty.max}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-valorant-border bg-valorant-bg px-4 py-2 text-center">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-valorant-muted">
                  TENTATIVAS
                </span>
                <span className="font-mono text-xl font-bold text-valorant-cyan">
                  {game?.attemptsCount ?? 0}
                </span>
              </div>
              <button
                type="button"
                onClick={() => startNewGame(activeDifficulty.key, true)}
                disabled={starting}
                title="Reiniciar rodada com um novo número secreto"
                className="flex items-center gap-1.5 rounded-xl border border-valorant-border bg-valorant-bg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-valorant-muted transition-colors hover:border-valorant-cyan hover:text-valorant-cyan disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Nova Rodada
              </button>
            </div>
          </div>

          {!game || starting ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-valorant-muted">
              <Crosshair className="h-8 w-8 animate-spin text-valorant-red" />
              <p className="font-mono text-xs uppercase tracking-widest">
                Gerando número secreto seguro no servidor...
              </p>
            </div>
          ) : isWon ? (
            <div className="animate-slide-up rounded-2xl border border-emerald-400/50 bg-gradient-to-br from-emerald-500/15 via-valorant-surface to-valorant-purple/15 p-6 text-center shadow-glow-cyan">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/50 bg-emerald-500/20 text-emerald-300">
                <Sparkles className="h-7 w-7" />
              </div>

              <h3 className="font-display text-3xl font-bold tracking-wide text-emerald-300 sm:text-4xl">
                🎉 PARABÉNS! VOCÊ ACERTOU!
              </h3>

              <p className="mt-2 text-sm text-valorant-text/90">
                O número secreto era{" "}
                <span className="mx-1 inline-block rounded-lg border border-valorant-cyan/50 bg-valorant-bg px-2.5 py-0.5 font-mono text-lg font-bold text-valorant-cyan">
                  {game.secretNumber}
                </span>
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-valorant-border bg-valorant-bg/85 p-3">
                  <span className="block font-mono text-[10px] uppercase text-valorant-muted">
                    Tentativas
                  </span>
                  <span className="mt-1 block font-mono text-2xl font-bold text-valorant-text">
                    {game.attemptsCount}
                  </span>
                </div>
                <div className="rounded-xl border border-valorant-border bg-valorant-bg/85 p-3">
                  <span className="block font-mono text-[10px] uppercase text-valorant-muted">
                    Base + Bônus
                  </span>
                  <span className="mt-1 block font-mono text-lg font-bold text-valorant-purple">
                    {game.score?.basePoints ?? 0} + {game.score?.bonusPoints ?? 0}
                  </span>
                </div>
                <div className="rounded-xl border border-valorant-cyan/40 bg-valorant-cyan/10 p-3">
                  <span className="block font-mono text-[10px] uppercase text-valorant-cyan">
                    Total Ganho
                  </span>
                  <span className="mt-1 block font-mono text-2xl font-bold text-valorant-cyan">
                    +{game.score?.totalPoints ?? 0}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-emerald-300/90">
                Resultado salvo no Neon PostgreSQL e ranking global atualizado!
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => startNewGame(game.difficulty, true)}
                  disabled={starting}
                  className="valorant-cut flex items-center justify-center gap-2 bg-valorant-red px-6 py-3.5 font-display text-base font-bold uppercase tracking-widest text-white shadow-glow-red transition-colors hover:bg-valorant-redHover"
                >
                  <RotateCcw className="h-4 w-4" />
                  JOGAR NOVAMENTE
                </button>
                <Link
                  href="/ranking"
                  className="flex items-center justify-center gap-2 rounded-xl border border-valorant-cyan/50 bg-valorant-bg px-6 py-3.5 font-display text-base font-bold uppercase tracking-widest text-valorant-cyan transition-colors hover:bg-valorant-cyan/10"
                >
                  <Trophy className="h-4 w-4" />
                  VER RANKING
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tactical range bar */}
              <div className="rounded-xl border border-valorant-border/80 bg-valorant-bg/75 p-4">
                <div className="flex items-center justify-between text-xs text-valorant-muted">
                  <span className="font-mono uppercase tracking-wider">
                    RADAR DE INTERVALO ATUAL
                  </span>
                  <span className="font-mono font-bold text-valorant-cyan">
                    {tacticalBounds.low} — {tacticalBounds.high}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-valorant-surface">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-valorant-cyan via-valorant-purple to-valorant-red transition-all duration-300"
                    style={{
                      width: `${Math.max(
                        4,
                        ((tacticalBounds.high - tacticalBounds.low + 1) /
                          (game.maxNumber - game.minNumber + 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Feedback banner */}
              {feedbackMessage && (
                <div
                  className={`animate-slide-up flex items-center gap-3 rounded-xl border px-4 py-3.5 ${
                    lastFeedbackType === "HIGHER"
                      ? "border-valorant-cyan/60 bg-valorant-cyan/10 text-valorant-cyan"
                      : "border-valorant-purple/60 bg-valorant-purple/15 text-purple-200"
                  }`}
                >
                  {lastFeedbackType === "HIGHER" ? (
                    <ArrowUp className="h-5 w-5 shrink-0" />
                  ) : (
                    <ArrowDown className="h-5 w-5 shrink-0" />
                  )}
                  <span className="font-display text-lg font-bold tracking-wide">
                    {feedbackMessage}
                  </span>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-valorant-red/50 bg-valorant-red/10 px-4 py-3 text-sm text-valorant-red">
                  {error}
                </div>
              )}

              {/* Guess Input Form */}
              <form
                onSubmit={handleGuessSubmit}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <div className="flex-1">
                  <label htmlFor="guess-input" className="sr-only">
                    Digite seu palpite
                  </label>
                  <input
                    ref={inputRef}
                    id="guess-input"
                    type="number"
                    min={game.minNumber}
                    max={game.maxNumber}
                    step={1}
                    required
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    placeholder={`Digite um número de ${game.minNumber} a ${game.maxNumber}`}
                    className="w-full rounded-xl border border-valorant-border bg-valorant-bg px-4 py-4 font-mono text-xl font-bold text-valorant-text placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-valorant-muted/60 focus:border-valorant-cyan focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="valorant-cut flex items-center justify-center gap-2 bg-valorant-red px-7 py-4 font-display text-base font-bold uppercase tracking-widest text-white shadow-glow-red transition-colors hover:bg-valorant-redHover disabled:opacity-60"
                >
                  <Crosshair className="h-5 w-5" />
                  {submitting ? "ENVIANDO..." : "ENVIAR PALPITE"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Guess History & Scoring Rules Sidebar */}
        <div className="space-y-6">
          <div className="tactical-panel rounded-2xl border border-valorant-border p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-valorant-cyan" />
                <h3 className="font-display text-lg font-bold tracking-wider text-valorant-text uppercase">
                  Histórico de Palpites
                </h3>
              </div>
              <span className="font-mono text-xs text-valorant-muted">
                {game?.guesses.length ?? 0} reg.
              </span>
            </div>

            {!game || game.guesses.length === 0 ? (
              <p className="rounded-xl border border-dashed border-valorant-border py-8 text-center text-xs text-valorant-muted">
                Nenhum palpite enviado ainda nesta rodada.
              </p>
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {[...game.guesses].reverse().map((guess) => (
                  <div
                    key={guess.id}
                    className="flex items-center justify-between rounded-xl border border-valorant-border/70 bg-valorant-bg/80 px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-valorant-muted">
                        #{guess.attemptNumber}
                      </span>
                      <span className="font-mono text-base font-bold text-valorant-text">
                        {guess.value}
                      </span>
                    </div>

                    {guess.feedback === "CORRECT" ? (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        ACERTOU
                      </span>
                    ) : guess.feedback === "HIGHER" ? (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-valorant-cyan/40 bg-valorant-cyan/10 px-2.5 py-1 font-mono text-[11px] font-bold text-valorant-cyan">
                        <ArrowUp className="h-3.5 w-3.5" />
                        É MAIOR
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-valorant-purple/40 bg-valorant-purple/15 px-2.5 py-1 font-mono text-[11px] font-bold text-purple-200">
                        <ArrowDown className="h-3.5 w-3.5" />
                        É MENOR
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tactical-panel rounded-2xl border border-valorant-border p-5">
            <h3 className="font-display text-lg font-bold tracking-wider text-valorant-text uppercase">
              Tabela de Bônus ({activeDifficulty.name})
            </h3>
            <p className="mt-1 text-xs text-valorant-muted">
              Pontuação base:{" "}
              <span className="font-mono font-bold text-valorant-text">
                {activeDifficulty.basePoints} pts
              </span>
            </p>
            <ul className="mt-3 space-y-2">
              {activeDifficulty.bonusRules.map((rule) => (
                <li
                  key={rule.label}
                  className="rounded-lg border border-valorant-border/60 bg-valorant-bg/60 px-3 py-2 text-xs text-valorant-text/90"
                >
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

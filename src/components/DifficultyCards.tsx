"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Flame, ShieldCheck, Zap } from "lucide-react";
import { DIFFICULTY_LIST, type DifficultyConfig } from "@/lib/game-config";

const ACCENT_STYLES: Record<
  DifficultyConfig["accentColor"],
  {
    border: string;
    badge: string;
    glow: string;
    button: string;
    dot: string;
  }
> = {
  emerald: {
    border: "hover:border-emerald-400/70 border-valorant-border",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    glow: "hover:shadow-[0_0_32px_rgba(52,211,153,0.2)]",
    button:
      "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold",
    dot: "bg-emerald-400",
  },
  amber: {
    border: "hover:border-amber-400/70 border-valorant-border",
    badge: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    glow: "hover:shadow-[0_0_32px_rgba(251,191,36,0.2)]",
    button: "bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold",
    dot: "bg-amber-400",
  },
  red: {
    border: "hover:border-valorant-red/80 border-valorant-border",
    badge: "bg-valorant-red/15 text-valorant-red border-valorant-red/40",
    glow: "hover:shadow-glow-red",
    button: "bg-valorant-red hover:bg-valorant-redHover text-white font-bold",
    dot: "bg-valorant-red",
  },
};

export function DifficultyCards({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();

  function handlePlay(difficulty: DifficultyConfig["key"]) {
    const target = `/jogar?difficulty=${difficulty}`;
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(target)}`);
      return;
    }
    router.push(target);
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {DIFFICULTY_LIST.map((diff) => {
        const style = ACCENT_STYLES[diff.accentColor];
        const Icon =
          diff.level === 1 ? ShieldCheck : diff.level === 2 ? Zap : Flame;

        return (
          <div
            key={diff.key}
            className={`tactical-panel group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${style.border} ${style.glow}`}
          >
            <div className="absolute right-0 top-0 h-20 w-20 bg-gradient-to-bl from-white/[0.04] to-transparent" />

            <div>
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-semibold ${style.badge}`}
                >
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  {diff.badgeEmoji} {diff.name} — {diff.min} até {diff.max}
                </span>
                <Icon className="h-5 w-5 text-valorant-muted transition-colors group-hover:text-valorant-text" />
              </div>

              <p className="font-mono text-[11px] tracking-[0.18em] text-valorant-cyan">
                {diff.tag}
              </p>

              <h3 className="mt-1 font-display text-3xl font-bold tracking-wide text-valorant-text">
                {diff.min} ATÉ {diff.max}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-valorant-muted">
                {diff.description}
              </p>

              <div className="mt-5 rounded-xl border border-valorant-border/80 bg-valorant-bg/70 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-valorant-muted">Pontuação base</span>
                  <span className="font-mono font-bold text-valorant-text">
                    {diff.basePoints} pts
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-valorant-muted">Bônus máximo</span>
                  <span className="font-mono font-bold text-valorant-purple">
                    +{diff.maxBonus} pts
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handlePlay(diff.key)}
              className={`valorant-cut mt-6 flex w-full items-center justify-center gap-2 py-3.5 font-display text-base tracking-widest uppercase transition-all ${style.button}`}
            >
              JOGAR
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

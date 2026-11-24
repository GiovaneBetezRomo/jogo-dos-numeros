import type { Difficulty } from "@prisma/client";

export interface DifficultyConfig {
  key: Difficulty;
  level: 1 | 2 | 3;
  name: string;
  tag: string;
  min: number;
  max: number;
  basePoints: number;
  maxBonus: number;
  description: string;
  accentColor: "emerald" | "amber" | "red";
  badgeEmoji: string;
  bonusRules: Array<{ maxAttempts: number; bonus: number; label: string }>;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    key: "EASY",
    level: 1,
    name: "FÁCIL",
    tag: "NÍVEL 01 // RECRUTA",
    min: 1,
    max: 10,
    basePoints: 10,
    maxBonus: 20,
    description: "Descubra o código secreto entre 1 e 10 com leitura tática rápida.",
    accentColor: "emerald",
    badgeEmoji: "🟢",
    bonusRules: [
      { maxAttempts: 1, bonus: 20, label: "1 tentativa (One Tap): +20 bônus" },
      { maxAttempts: 3, bonus: 10, label: "2–3 tentativas: +10 bônus" },
      { maxAttempts: 5, bonus: 5, label: "4–5 tentativas: +5 bônus" },
    ],
  },
  MEDIUM: {
    key: "MEDIUM",
    level: 2,
    name: "MÉDIO",
    tag: "NÍVEL 02 // AGENTE",
    min: 1,
    max: 100,
    basePoints: 30,
    maxBonus: 70,
    description: "Rastreie o alvo numérico de 1 a 100 usando busca binária precisa.",
    accentColor: "amber",
    badgeEmoji: "🟡",
    bonusRules: [
      { maxAttempts: 1, bonus: 70, label: "1 tentativa (Clutch): +70 bônus" },
      { maxAttempts: 4, bonus: 35, label: "2–4 tentativas: +35 bônus" },
      { maxAttempts: 7, bonus: 15, label: "5–7 tentativas: +15 bônus" },
      { maxAttempts: 10, bonus: 5, label: "8–10 tentativas: +5 bônus" },
    ],
  },
  HARD: {
    key: "HARD",
    level: 3,
    name: "DIFÍCIL",
    tag: "NÍVEL 03 // RADIANTE",
    min: 1,
    max: 1000,
    basePoints: 100,
    maxBonus: 200,
    description: "Protocolo extremo de 1 até 1000. Máxima pontuação e prestígio.",
    accentColor: "red",
    badgeEmoji: "🔴",
    bonusRules: [
      { maxAttempts: 1, bonus: 200, label: "1 tentativa (Ace): +200 bônus" },
      { maxAttempts: 5, bonus: 100, label: "2–5 tentativas: +100 bônus" },
      { maxAttempts: 10, bonus: 50, label: "6–10 tentativas: +50 bônus" },
      { maxAttempts: 14, bonus: 20, label: "11–14 tentativas: +20 bônus" },
    ],
  },
};

export const DIFFICULTY_LIST: DifficultyConfig[] = [
  DIFFICULTY_CONFIGS.EASY,
  DIFFICULTY_CONFIGS.MEDIUM,
  DIFFICULTY_CONFIGS.HARD,
];

/**
 * Calculates base, performance bonus, and total points strictly on the server.
 */
export function calculateScore(
  difficulty: Difficulty,
  attemptsCount: number
): { basePoints: number; bonusPoints: number; totalPoints: number } {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const matchedTier = config.bonusRules.find(
    (rule) => attemptsCount <= rule.maxAttempts
  );
  const bonusPoints = matchedTier ? matchedTier.bonus : 0;

  return {
    basePoints: config.basePoints,
    bonusPoints,
    totalPoints: config.basePoints + bonusPoints,
  };
}

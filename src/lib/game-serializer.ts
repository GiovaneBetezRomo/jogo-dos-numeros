import type { Game, Guess, Score } from "@prisma/client";

export type GameWithRelations = Game & {
  guesses: Guess[];
  score?: Score | null;
};

export interface SerializedGame {
  id: string;
  difficulty: Game["difficulty"];
  minNumber: number;
  maxNumber: number;
  status: Game["status"];
  attemptsCount: number;
  createdAt: string;
  wonAt: string | null;
  secretNumber: number | null;
  guesses: Array<{
    id: string;
    value: number;
    attemptNumber: number;
    feedback: Guess["feedback"];
    createdAt: string;
  }>;
  score: {
    basePoints: number;
    bonusPoints: number;
    totalPoints: number;
  } | null;
}

/**
 * Serializes a game for the browser while hiding secretNumber until the match is WON.
 */
export function serializeGame(game: GameWithRelations): SerializedGame {
  const isWon = game.status === "WON";

  return {
    id: game.id,
    difficulty: game.difficulty,
    minNumber: game.minNumber,
    maxNumber: game.maxNumber,
    status: game.status,
    attemptsCount: game.attemptsCount,
    createdAt: game.createdAt.toISOString(),
    wonAt: game.wonAt ? game.wonAt.toISOString() : null,
    secretNumber: isWon ? game.secretNumber : null,
    guesses: [...game.guesses]
      .sort((a, b) => a.attemptNumber - b.attemptNumber)
      .map((guess) => ({
        id: guess.id,
        value: guess.value,
        attemptNumber: guess.attemptNumber,
        feedback: guess.feedback,
        createdAt: guess.createdAt.toISOString(),
      })),
    score:
      isWon && game.score
        ? {
            basePoints: game.score.basePoints,
            bonusPoints: game.score.bonusPoints,
            totalPoints: game.score.totalPoints,
          }
        : null,
  };
}

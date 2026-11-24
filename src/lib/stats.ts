import type { Difficulty } from "@prisma/client";
import { prisma } from "./prisma";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  totalGames: number;
  totalWins: number;
  totalAttempts: number;
  accuracyRate: number;
  victoryRate: number;
  totalPoints: number;
}

export interface GlobalStatsData {
  totalUsers: number;
  activePlayers: number;
  totalGames: number;
  totalWins: number;
  totalGuesses: number;
  topPlayer: LeaderboardEntry | null;
  mostPlayedDifficulty: Difficulty | null;
  difficultyBreakdown: Record<Difficulty, number>;
  playersSummary: LeaderboardEntry[];
  recentGames: Array<{
    id: string;
    username: string;
    avatarUrl: string | null;
    difficulty: Difficulty;
    status: string;
    attemptsCount: number;
    totalPoints: number | null;
    createdAt: string;
  }>;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      games: {
        select: {
          status: true,
        },
      },
      scores: {
        select: {
          totalPoints: true,
        },
      },
      _count: {
        select: {
          guesses: true,
        },
      },
    },
  });

  const entries = users
    .map((user) => {
      const totalGames = user.games.length;
      const totalWins = user.games.filter((g) => g.status === "WON").length;
      const totalAttempts = user._count.guesses;
      const totalPoints = user.scores.reduce((sum, s) => sum + s.totalPoints, 0);
      const accuracyRate =
        totalAttempts > 0
          ? Number(((totalWins / totalAttempts) * 100).toFixed(1))
          : 0;
      const victoryRate =
        totalGames > 0
          ? Number(((totalWins / totalGames) * 100).toFixed(1))
          : 0;

      return {
        rank: 0,
        userId: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        totalGames,
        totalWins,
        totalAttempts,
        accuracyRate,
        victoryRate,
        totalPoints,
      };
    })
    .filter((entry) => entry.totalGames > 0)
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
      if (a.totalAttempts !== b.totalAttempts) {
        return a.totalAttempts - b.totalAttempts;
      }
      return a.username.localeCompare(b.username);
    });

  return entries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}

export async function getGlobalStats(): Promise<GlobalStatsData> {
  const [
    totalUsers,
    totalGames,
    totalWins,
    totalGuesses,
    difficultyGroups,
    leaderboard,
    recentRawGames,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.game.count({ where: { status: "WON" } }),
    prisma.guess.count(),
    prisma.game.groupBy({
      by: ["difficulty"],
      _count: { _all: true },
    }),
    getLeaderboard(),
    prisma.game.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        difficulty: true,
        status: true,
        attemptsCount: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
        score: {
          select: {
            totalPoints: true,
          },
        },
      },
    }),
  ]);

  const difficultyBreakdown: Record<Difficulty, number> = {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0,
  };

  for (const group of difficultyGroups) {
    difficultyBreakdown[group.difficulty] = group._count._all;
  }

  let mostPlayedDifficulty: Difficulty | null = null;
  let maxDifficultyCount = 0;
  for (const diff of ["EASY", "MEDIUM", "HARD"] as const) {
    if (difficultyBreakdown[diff] > maxDifficultyCount) {
      maxDifficultyCount = difficultyBreakdown[diff];
      mostPlayedDifficulty = diff;
    }
  }

  return {
    totalUsers,
    activePlayers: leaderboard.length,
    totalGames,
    totalWins,
    totalGuesses,
    topPlayer: leaderboard[0] ?? null,
    mostPlayedDifficulty,
    difficultyBreakdown,
    playersSummary: leaderboard,
    recentGames: recentRawGames.map((game) => ({
      id: game.id,
      username: game.user.username,
      avatarUrl: game.user.avatarUrl,
      difficulty: game.difficulty,
      status: game.status,
      attemptsCount: game.attemptsCount,
      totalPoints: game.score?.totalPoints ?? null,
      createdAt: game.createdAt.toISOString(),
    })),
  };
}

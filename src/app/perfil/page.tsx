import { redirect } from "next/navigation";
import { ProfilePanel } from "@/components/ProfilePanel";
import { serializeGame } from "@/lib/game-serializer";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?next=/perfil");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      games: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          guesses: true,
          score: true,
        },
      },
      scores: {
        select: { totalPoints: true },
      },
      _count: {
        select: {
          games: true,
          guesses: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const totalWins = await prisma.game.count({
    where: { userId: user.id, status: "WON" },
  });
  const totalPoints = user.scores.reduce((sum, s) => sum + s.totalPoints, 0);
  const totalAttempts = user._count.guesses;
  const totalGames = user._count.games;

  return (
    <ProfilePanel
      user={{
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      }}
      stats={{
        totalGames,
        totalWins,
        totalAttempts,
        totalPoints,
        accuracyRate:
          totalAttempts > 0
            ? Number(((totalWins / totalAttempts) * 100).toFixed(1))
            : 0,
      }}
      history={user.games.map(serializeGame)}
    />
  );
}

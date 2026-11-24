import { redirect } from "next/navigation";
import type { Difficulty } from "@prisma/client";
import { GameArena } from "@/components/GameArena";
import { serializeGame } from "@/lib/game-serializer";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

export const dynamic = "force-dynamic";

function parseDifficulty(param?: string): Difficulty {
  if (param === "EASY" || param === "MEDIUM" || param === "HARD") {
    return param;
  }
  return "MEDIUM";
}

export default async function JogarPage({
  searchParams,
}: {
  searchParams: { difficulty?: string };
}) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?next=/jogar");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const activeGame = await prisma.game.findFirst({
    where: {
      userId: user.id,
      status: "IN_PROGRESS",
    },
    orderBy: { createdAt: "desc" },
    include: {
      guesses: true,
      score: true,
    },
  });

  const requestedDifficulty = searchParams.difficulty
    ? parseDifficulty(searchParams.difficulty)
    : activeGame?.difficulty ?? "MEDIUM";

  const matchingActiveGame =
    activeGame &&
    (!searchParams.difficulty || activeGame.difficulty === requestedDifficulty)
      ? serializeGame(activeGame)
      : null;

  return (
    <GameArena
      player={user}
      initialGame={matchingActiveGame}
      requestedDifficulty={requestedDifficulty}
    />
  );
}

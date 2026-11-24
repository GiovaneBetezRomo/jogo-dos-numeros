import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeGame } from "@/lib/game-serializer";
import { getSessionFromCookies } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const game = await prisma.game.findFirst({
    where: {
      id: context.params.id,
      userId: session.userId,
    },
    include: {
      guesses: true,
      score: true,
    },
  });

  if (!game) {
    return NextResponse.json(
      { error: "Partida não encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json({ game: serializeGame(game) });
}

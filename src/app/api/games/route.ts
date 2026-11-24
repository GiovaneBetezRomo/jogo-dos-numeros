import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DIFFICULTY_CONFIGS } from "@/lib/game-config";
import { serializeGame } from "@/lib/game-serializer";
import { getSessionFromCookies } from "@/lib/session";
import { startGameSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const activeGame = await prisma.game.findFirst({
    where: {
      userId: session.userId,
      status: "IN_PROGRESS",
    },
    orderBy: { createdAt: "desc" },
    include: {
      guesses: true,
      score: true,
    },
  });

  return NextResponse.json({
    game: activeGame ? serializeGame(activeGame) : null,
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = startGameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dificuldade inválida." },
        { status: 400 }
      );
    }

    const { difficulty, forceNew } = parsed.data;
    const config = DIFFICULTY_CONFIGS[difficulty];

    const existingActive = await prisma.game.findFirst({
      where: {
        userId: session.userId,
        status: "IN_PROGRESS",
      },
      orderBy: { createdAt: "desc" },
      include: {
        guesses: true,
        score: true,
      },
    });

    // Resume active match of the same difficulty unless forceNew is explicitly requested.
    if (existingActive && !forceNew && existingActive.difficulty === difficulty) {
      return NextResponse.json({
        game: serializeGame(existingActive),
        resumed: true,
      });
    }

    const secretNumber = randomInt(config.min, config.max + 1);

    const newGame = await prisma.$transaction(async (tx) => {
      if (existingActive) {
        await tx.game.updateMany({
          where: {
            userId: session.userId,
            status: "IN_PROGRESS",
          },
          data: { status: "ABANDONED" },
        });
      }

      return tx.game.create({
        data: {
          userId: session.userId,
          difficulty: config.key,
          minNumber: config.min,
          maxNumber: config.max,
          secretNumber,
          status: "IN_PROGRESS",
        },
        include: {
          guesses: true,
          score: true,
        },
      });
    });

    return NextResponse.json(
      { game: serializeGame(newGame), resumed: false },
      { status: 201 }
    );
  } catch (error) {
    console.error("Start game error:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar partida." },
      { status: 500 }
    );
  }
}

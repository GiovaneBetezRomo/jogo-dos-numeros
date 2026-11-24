import { NextResponse } from "next/server";
import type { GuessFeedback } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/game-config";
import { serializeGame } from "@/lib/game-serializer";
import { getSessionFromCookies } from "@/lib/session";
import { submitGuessSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = submitGuessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Palpite inválido." },
        { status: 400 }
      );
    }

    const guessValue = parsed.data.value;

    const result = await prisma.$transaction(async (tx) => {
      const game = await tx.game.findFirst({
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
        return { kind: "error" as const, status: 404, message: "Partida não encontrada." };
      }

      if (game.status !== "IN_PROGRESS") {
        return {
          kind: "error" as const,
          status: 409,
          message: "Esta partida já foi encerrada. Inicie uma nova rodada!",
        };
      }

      if (guessValue < game.minNumber || guessValue > game.maxNumber) {
        return {
          kind: "error" as const,
          status: 400,
          message: `Digite um número entre ${game.minNumber} e ${game.maxNumber}.`,
        };
      }

      if (game.guesses.some((g) => g.value === guessValue)) {
        return {
          kind: "error" as const,
          status: 400,
          message: `Você já tentou o número ${guessValue} nesta partida.`,
        };
      }

      const attemptNumber = game.attemptsCount + 1;

      let feedback: GuessFeedback;
      let message: string;

      if (guessValue < game.secretNumber) {
        feedback = "HIGHER";
        message = "Errou! O número secreto é MAIOR.";
      } else if (guessValue > game.secretNumber) {
        feedback = "LOWER";
        message = "Errou! O número secreto é MENOR.";
      } else {
        feedback = "CORRECT";
        message = "🎉 PARABÉNS! VOCÊ ACERTOU!";
      }

      const isWin = feedback === "CORRECT";

      // Guard against concurrent double-win submissions on the same match.
      const updatedCount = await tx.game.updateMany({
        where: {
          id: game.id,
          userId: session.userId,
          status: "IN_PROGRESS",
          attemptsCount: game.attemptsCount,
        },
        data: {
          attemptsCount: attemptNumber,
          ...(isWin ? { status: "WON", wonAt: new Date() } : {}),
        },
      });

      if (updatedCount.count !== 1) {
        return {
          kind: "error" as const,
          status: 409,
          message: "Tentativa simultânea detectada. Atualize e tente novamente.",
        };
      }

      await tx.guess.create({
        data: {
          gameId: game.id,
          userId: session.userId,
          value: guessValue,
          attemptNumber,
          feedback,
        },
      });

      if (isWin) {
        const points = calculateScore(game.difficulty, attemptNumber);
        await tx.score.create({
          data: {
            userId: session.userId,
            gameId: game.id,
            difficulty: game.difficulty,
            attemptsCount: attemptNumber,
            basePoints: points.basePoints,
            bonusPoints: points.bonusPoints,
            totalPoints: points.totalPoints,
          },
        });
      }

      const updatedGame = await tx.game.findUniqueOrThrow({
        where: { id: game.id },
        include: {
          guesses: true,
          score: true,
        },
      });

      return {
        kind: "ok" as const,
        game: serializeGame(updatedGame),
        feedback,
        message,
      };
    });

    if (result.kind === "error") {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json({
      game: result.game,
      feedback: result.feedback,
      message: result.message,
    });
  } catch (error) {
    console.error("Submit guess error:", error);
    return NextResponse.json(
      { error: "Erro ao processar palpite." },
      { status: 500 }
    );
  }
}

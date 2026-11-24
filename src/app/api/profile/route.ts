import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeGame } from "@/lib/game-serializer";
import {
  getSessionCookieOptions,
  getSessionFromCookies,
  signSessionToken,
} from "@/lib/session";
import { updateProfileSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const totalWins = await prisma.game.count({
    where: { userId: user.id, status: "WON" },
  });
  const totalPoints = user.scores.reduce((sum, s) => sum + s.totalPoints, 0);
  const totalAttempts = user._count.guesses;
  const totalGames = user._count.games;

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    },
    stats: {
      totalGames,
      totalWins,
      totalAttempts,
      totalPoints,
      accuracyRate:
        totalAttempts > 0
          ? Number(((totalWins / totalAttempts) * 100).toFixed(1))
          : 0,
    },
    history: user.games.map(serializeGame),
  });
}

export async function PATCH(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { username, avatarUrl } = parsed.data;

    const duplicate = await prisma.user.findFirst({
      where: {
        id: { not: session.userId },
        username: { equals: username, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Este nome de usuário já está em uso." },
        { status: 409 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        username,
        avatarUrl: avatarUrl || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
      },
    });

    const token = await signSessionToken({
      userId: updated.id,
      username: updated.username,
      email: updated.email,
    });

    const response = NextResponse.json({ user: updated });
    response.cookies.set(getSessionCookieOptions().name, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import {
  getSessionCookieOptions,
  signSessionToken,
} from "@/lib/session";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { username, email, password, avatarUrl } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username: { equals: username, mode: "insensitive" } },
        ],
      },
      select: { email: true, username: true },
    });

    if (existing) {
      const message =
        existing.email === email
          ? "Este e-mail já está cadastrado."
          : "Este nome de usuário já está em uso.";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
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
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(getSessionCookieOptions().name, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta. Verifique a conexão com o banco." },
      { status: 500 }
    );
  }
}

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "desafio_numeros_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  username: string;
  email: string;
}

/**
 * Resolves a stable HMAC key compatible with both Edge Runtime and Node.js.
 */
async function getJwtSecretKey(): Promise<Uint8Array> {
  const explicitSecret = process.env.JWT_SECRET?.trim();
  if (explicitSecret && explicitSecret.length >= 16) {
    return new TextEncoder().encode(explicitSecret);
  }

  // Fallback keeps Vercel deployments functional if only DATABASE_URL is configured.
  const seed = process.env.DATABASE_URL?.trim() || "local-dev-only-fallback-seed";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`desafio-dos-numeros:${seed}`)
  );
  return new Uint8Array(digest);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const key = await getJwtSecretKey();
  return new SignJWT({
    userId: payload.userId,
    username: payload.username,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const key = await getJwtSecretKey();
    const { payload } = await jwtVerify(token, key);
    if (
      typeof payload.userId !== "string" ||
      typeof payload.username !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Rajdhani } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { getSessionFromCookies } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-rajdhani",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "DESAFIO DOS NÚMEROS | Arena Tática",
  description:
    "Jogo competitivo de adivinhação de números com tema Valorant, ranking global em tempo real e banco Neon PostgreSQL.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let currentUser: {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  } | null = null;

  try {
    const session = await getSessionFromCookies();
    if (session) {
      currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      });
    }
  } catch {
    currentUser = null;
  }

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${rajdhani.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans antialiased selection:bg-valorant-red selection:text-white">
        <div className="flex min-h-screen flex-col">
          <Navbar initialUser={currentUser} />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-valorant-border/60 bg-valorant-bg/80 py-6 text-center text-xs text-valorant-muted">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
              <span className="font-display tracking-wider uppercase text-valorant-text/80">
                DESAFIO DOS NÚMEROS // PROTOCOLO ARENA
              </span>
              <span>
                Desenvolvido com Next.js, Prisma, Neon PostgreSQL &amp; Deploy Vercel
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

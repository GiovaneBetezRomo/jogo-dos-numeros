import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ranking = await getLeaderboard();
    return NextResponse.json(
      { ranking },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Ranking error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar ranking." },
      { status: 500 }
    );
  }
}

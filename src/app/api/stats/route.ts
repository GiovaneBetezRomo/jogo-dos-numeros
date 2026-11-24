import { NextResponse } from "next/server";
import { getGlobalStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getGlobalStats();
    return NextResponse.json(
      { stats },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar estatísticas." },
      { status: 500 }
    );
  }
}

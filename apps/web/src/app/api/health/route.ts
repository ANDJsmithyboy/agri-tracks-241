import { connection, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Healthcheck public : base de données + runtime. */
export async function GET() {
  // connection() force le rendu dynamique (requis avec cacheComponents).
  await connection();
  const started = Date.now();
  try {
    await db()`SELECT 1`;
    return NextResponse.json({
      ok: true,
      db: "up",
      latencyMs: Date.now() - started,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 503 },
    );
  }
}

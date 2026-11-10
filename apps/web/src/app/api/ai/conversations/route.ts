import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureAiTables, isValidUuid } from "@/lib/ai-server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    await ensureAiTables();
    const sql = db();
    const rows = (await sql`
      SELECT
        id::text AS id,
        title,
        farm_id::text AS farm_id,
        created_at::text AS created_at,
        updated_at::text AS updated_at
      FROM ai_conversations
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
      LIMIT 50
    `) as Array<{
      id: string;
      title: string;
      farm_id: string | null;
      created_at: string | null;
      updated_at: string | null;
    }>;

    return NextResponse.json({
      conversations: rows.map((r) => ({
        id: r.id,
        title: r.title,
        farmId: r.farm_id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { conversations: [], warning: String(err) },
      { status: 200 },
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    farm_id?: string;
  };
  const convId = crypto.randomUUID();
  const title = (body.title || "Nouvelle conversation").trim() || "Nouvelle conversation";
  const farmId = isValidUuid(body.farm_id) ? body.farm_id : null;
  const now = new Date().toISOString();

  try {
    await ensureAiTables();
    const sql = db();
    await sql`
      INSERT INTO ai_conversations (id, user_id, farm_id, title)
      VALUES (${convId}::uuid, ${userId}, ${farmId}::uuid, ${title})
    `;
    return NextResponse.json(
      {
        id: convId,
        title,
        farmId,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        id: convId,
        title,
        farmId,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 },
    );
  }
}

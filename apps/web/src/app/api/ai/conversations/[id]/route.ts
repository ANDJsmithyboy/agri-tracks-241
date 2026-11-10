import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureAiTables, isValidUuid } from "@/lib/ai-server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json(
      { error: "Identifiant de conversation invalide" },
      { status: 400 },
    );
  }

  try {
    await ensureAiTables();
    const sql = db();
    const convRows = (await sql`
      SELECT
        id::text AS id,
        user_id,
        title,
        farm_id::text AS farm_id,
        created_at::text AS created_at,
        updated_at::text AS updated_at
      FROM ai_conversations
      WHERE id = ${id}::uuid
      LIMIT 1
    `) as Array<{
      id: string;
      user_id: string;
      title: string;
      farm_id: string | null;
      created_at: string | null;
      updated_at: string | null;
    }>;

    if (!convRows.length) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 },
      );
    }
    const conv = convRows[0];
    if (conv.user_id !== userId) {
      return NextResponse.json(
        { error: "Accès refusé à cette conversation" },
        { status: 403 },
      );
    }

    const msgRows = (await sql`
      SELECT
        id::text AS id,
        role,
        content,
        status,
        token_usage,
        created_at::text AS created_at
      FROM ai_messages
      WHERE conversation_id = ${id}::uuid
      ORDER BY created_at ASC
    `) as Array<{
      id: string;
      role: "user" | "assistant" | "system";
      content: string;
      status: string;
      token_usage: number | null;
      created_at: string | null;
    }>;

    return NextResponse.json({
      id: conv.id,
      title: conv.title,
      farmId: conv.farm_id,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
      messages: msgRows.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        status: m.status,
        tokenUsage: m.token_usage,
        createdAt: m.created_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }
  const body = (await req.json().catch(() => ({}))) as { title?: string };
  const newTitle = (body.title || "").trim().slice(0, 160);
  if (!newTitle) {
    return NextResponse.json(
      { error: "Le titre ne peut pas être vide" },
      { status: 400 },
    );
  }

  try {
    await ensureAiTables();
    const sql = db();
    const updated = (await sql`
      UPDATE ai_conversations
      SET title = ${newTitle}, updated_at = now()
      WHERE id = ${id}::uuid AND user_id = ${userId}
      RETURNING id::text AS id, title, updated_at::text AS updated_at
    `) as Array<{ id: string; title: string; updated_at: string }>;

    if (!updated.length) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      id: updated[0].id,
      title: updated[0].title,
      updatedAt: updated[0].updated_at,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  try {
    await ensureAiTables();
    const sql = db();
    const deleted = (await sql`
      DELETE FROM ai_conversations
      WHERE id = ${id}::uuid AND user_id = ${userId}
      RETURNING id::text AS id
    `) as Array<{ id: string }>;

    if (!deleted.length) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 },
      );
    }
    return NextResponse.json({ deleted: true, id: deleted[0].id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

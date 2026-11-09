import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const API_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fastapi-poufa-production.up.railway.app";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const { id } = await context.params;
  const token = await getToken();
  const body = await req.json().catch(() => ({}));

  try {
    const upstream = await fetch(
      `${API_BASE}/api/v1/ai/conversations/${id}/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      },
    );

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => "Erreur serveur IA");
      return NextResponse.json(
        { error: errText || `HTTP ${upstream.status}` },
        { status: upstream.status || 502 },
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Service FastAPI indisponible sur ${API_BASE} (${String(err)})`,
      },
      { status: 502 },
    );
  }
}


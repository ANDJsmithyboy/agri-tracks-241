import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || "http://localhost:8000";

export async function GET() {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const token = await getToken();
  try {
    const res = await fetch(`${API_BASE}/api/v1/ai/conversations`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { conversations: [], warning: String(err) },
      { status: 200 },
    );
  }
}

export async function POST(req: Request) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const token = await getToken();
  const body = await req.json().catch(() => ({}));
  try {
    const res = await fetch(`${API_BASE}/api/v1/ai/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    const fallbackId = crypto.randomUUID();
    const now = new Date().toISOString();
    return NextResponse.json(
      {
        id: fallbackId,
        title: body.title || "Nouvelle conversation",
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 },
    );
  }
}


import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { streamText } from "ai";
import {
  buildPoufaFarmContext,
  buildPoufaSystemPrompt,
  ensureConversationForUser,
  getDeepSeekProvider,
  persistAiMessage,
  resolveDeepSeekModelId,
} from "@/lib/ai-server";
import { db } from "@/lib/db";

export const maxDuration = 60;

/**
 * Route SSE legacy compatible avec les clients événementiels personnalisés
 * (`message.start` / `message.delta` / `message.complete`), propulsée
 * directement par Vercel AI SDK v7 + @ai-sdk/deepseek + Neon PostgreSQL.
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await req.json().catch(() => ({}))) as {
    content?: string;
    farm_id?: string;
  };
  const content = (body.content || "").trim();
  if (!content) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 });
  }

  let convId = id;
  try {
    convId = await ensureConversationForUser({
      conversationId: id,
      userId,
      firstUserText: content,
      farmId: body.farm_id,
    });
    await persistAiMessage({
      conversationId: convId,
      role: "user",
      content,
      status: "complete",
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN_CONVERSATION") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
  }

  const sql = db();
  const historyRows = (await sql`
    SELECT role, content
    FROM ai_messages
    WHERE conversation_id = ${convId}::uuid AND status = 'complete'
    ORDER BY created_at ASC
    LIMIT 20
  `.catch(() => [])) as Array<{ role: "user" | "assistant"; content: string }>;

  const modelMessages = historyRows.length
    ? historyRows
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }))
    : [{ role: "user" as const, content }];

  const farmContext = await buildPoufaFarmContext(userId, body.farm_id);
  const systemPrompt = buildPoufaSystemPrompt(farmContext);
  const deepseek = getDeepSeekProvider();
  const modelId = resolveDeepSeekModelId("flash");
  const assistantMsgId = crypto.randomUUID();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      sendEvent("message.start", {
        messageId: assistantMsgId,
        conversationId: convId,
      });

      let fullText = "";
      let totalTokens: number | null = null;
      try {
        const result = streamText({
          model: deepseek(modelId),
          system: systemPrompt,
          messages: modelMessages,
          temperature: 0.3,
          maxOutputTokens: 2000,
          abortSignal: req.signal,
          providerOptions: {
            deepseek: { thinking: { type: "disabled" }, userId },
          },
          onFinish: async ({ totalUsage }) => {
            if (typeof totalUsage?.totalTokens === "number") {
              totalTokens = totalUsage.totalTokens;
            }
          },
        });

        for await (const delta of result.textStream) {
          if (delta) {
            fullText += delta;
            sendEvent("message.delta", { text: delta });
          }
        }

        if (fullText.trim()) {
          await persistAiMessage({
            messageId: assistantMsgId,
            conversationId: convId,
            role: "assistant",
            content: fullText.trim(),
            status: "complete",
            tokenUsage: totalTokens,
          }).catch(() => {});
        }

        sendEvent("message.complete", {
          messageId: assistantMsgId,
          conversationId: convId,
          status: "complete",
          tokenUsage: totalTokens,
        });
      } catch (err) {
        sendEvent("message.error", {
          messageId: assistantMsgId,
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  smoothStream,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import {
  buildPoufaFarmContext,
  buildPoufaSystemPrompt,
  ensureConversationForUser,
  getDeepSeekProvider,
  persistAiMessage,
  resolveDeepSeekModelId,
  type PoufaModelTier,
} from "@/lib/ai-server";

export const maxDuration = 60;

function extractTextFromUiMessage(message: UIMessage | undefined): string {
  if (!message || !Array.isArray(message.parts)) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Session non authentifiée. Veuillez vous reconnecter." },
      { status: 401 },
    );
  }

  let body: {
    id?: string;
    messages?: UIMessage[];
    modelTier?: PoufaModelTier;
    enableThinking?: boolean;
    farmId?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) {
    return NextResponse.json(
      { error: "Aucun message fourni" },
      { status: 400 },
    );
  }

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const lastUserText = extractTextFromUiMessage(lastUserMsg).trim();
  if (!lastUserText) {
    return NextResponse.json(
      { error: "Le message utilisateur est vide" },
      { status: 400 },
    );
  }

  let convId = body.id || crypto.randomUUID();
  try {
    convId = await ensureConversationForUser({
      conversationId: convId,
      userId,
      firstUserText: lastUserText,
      farmId: body.farmId,
    });
    if (lastUserMsg) {
      await persistAiMessage({
        messageId: lastUserMsg.id,
        conversationId: convId,
        role: "user",
        content: lastUserText,
        status: "complete",
      });
    }
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN_CONVERSATION") {
      return NextResponse.json(
        { error: "Accès refusé à cette conversation" },
        { status: 403 },
      );
    }
    // Ne pas bloquer le streaming IA si la persistance secondaire rencontre un délai
  }

  const farmContext = await buildPoufaFarmContext(userId, body.farmId);
  const systemPrompt = buildPoufaSystemPrompt(farmContext);
  const tier: PoufaModelTier = body.modelTier === "pro" ? "pro" : "flash";
  const enableThinking = body.enableThinking ?? tier === "pro";

  const deepseek = getDeepSeekProvider();
  const modelId = resolveDeepSeekModelId(tier);
  let capturedTotalTokens: number | null = null;

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: deepseek(modelId),
    system: systemPrompt,
    messages: modelMessages,
    temperature: 0.3,
    maxOutputTokens: 2500,
    abortSignal: req.signal,
    experimental_transform: smoothStream({
      delayInMs: 12,
      chunking: "word",
    }),
    providerOptions: {
      deepseek: {
        thinking: { type: enableThinking ? "enabled" : "disabled" },
        userId,
      },
    },
    onFinish: async ({ totalUsage }) => {
      if (typeof totalUsage?.totalTokens === "number") {
        capturedTotalTokens = totalUsage.totalTokens;
      }
    },
  });

  return createUIMessageStreamResponse({
    keepAliveMs: 15000,
    stream: toUIMessageStream({
      stream: result.stream,
      sendReasoning: true,
      originalMessages: messages,
      onError: (error) => {
        if (error instanceof Error) {
          return `Erreur POUFA AI : ${error.message}`;
        }
        return "Erreur inattendue lors de la génération POUFA AI.";
      },
      onEnd: async ({ responseMessage, isAborted }) => {
        const answerText = extractTextFromUiMessage(responseMessage).trim();
        if (!answerText) return;
        try {
          await persistAiMessage({
            messageId: responseMessage.id,
            conversationId: convId,
            role: "assistant",
            content: answerText,
            status: isAborted ? "incomplete" : "complete",
            tokenUsage: capturedTotalTokens,
          });
        } catch {
          // Persistance best-effort
        }
      },
    }),
  });
}

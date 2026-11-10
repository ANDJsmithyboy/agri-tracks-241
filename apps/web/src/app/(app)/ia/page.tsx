"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  AlertCircle,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  Columns2,
  Copy,
  History,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import { PoufaEmblem } from "@/components/poufa-emblem";
import {
  PoufaFeedIcon,
  PoufaFlockIcon,
  PoufaSanitaryIcon,
  PoufaWeighingIcon,
} from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import {
  PoufaComposer,
  type PoufaModelTier,
} from "@/components/ai/poufa-composer";
import { AiSidebarNav } from "@/components/ai/ai-sidebar-nav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  {
    icon: PoufaFlockIcon,
    label: "Effectif & mortalités",
    prompt:
      "Résume la bande active B-2026-014 : effectif placé, mortalités enregistrées, sorties cédées et effectif actuel en bâtiment.",
  },
  {
    icon: PoufaFeedIcon,
    label: "Stocks d'aliments",
    prompt:
      "Quelles sont les réceptions récentes d'aliment et la consommation estimée de ma bande en cours ?",
  },
  {
    icon: PoufaWeighingIcon,
    label: "Indicateurs zootechniques",
    prompt:
      "Quel est le poids vif moyen, le GMQ calculé et la viabilité globale du lot ?",
  },
  {
    icon: PoufaSanitaryIcon,
    label: "Santé & traçabilité",
    prompt:
      "Quels sont les signalements sanitaires récents et les lots de traçabilité enregistrés pour cette exploitation ?",
  },
];

function FormattedMessageContent({ content }: { content: string }) {
  const segments = useMemo(() => {
    const out: Array<
      { kind: "code"; lang: string; code: string } | { kind: "markdown"; text: string }
    > = [];
    const fenceRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = fenceRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        out.push({ kind: "markdown", text: content.slice(lastIndex, match.index) });
      }
      out.push({ kind: "code", lang: match[1] || "text", code: match[2].trimEnd() });
      lastIndex = fenceRegex.lastIndex;
    }
    if (lastIndex < content.length) {
      out.push({ kind: "markdown", text: content.slice(lastIndex) });
    }
    return out;
  }, [content]);

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground">
      {segments.map((seg, sIdx) => {
        if (seg.kind === "code") {
          return (
            <pre
              key={sIdx}
              className="overflow-x-auto rounded-xl border border-border/70 bg-muted/60 p-3 font-mono text-xs leading-relaxed text-foreground"
            >
              <code>{seg.code}</code>
            </pre>
          );
        }

        const blocks = seg.text.split(/\n\n+/);
        return blocks.map((rawBlock, i) => {
          const block = rawBlock.trim();
          if (!block) return null;
          if (/^---+$/.test(block)) {
            return <hr key={`${sIdx}-${i}`} className="border-border/60 my-2" />;
          }

          const lines = block.split("\n");
          const isBulletList = lines.every((l) =>
            /^\s*([-*•]|\d+\.)\s+/.test(l.trim()),
          );
          if (isBulletList && lines.length > 0) {
            return (
              <ul
                key={`${sIdx}-${i}`}
                className="list-disc space-y-1 pl-5 text-foreground/90"
              >
                {lines.map((line, j) => (
                  <li key={j}>
                    {formatInline(line.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}
                  </li>
                ))}
              </ul>
            );
          }
          if (block.startsWith("### ")) {
            return (
              <h4
                key={`${sIdx}-${i}`}
                className="pt-2 text-sm font-semibold tracking-tight text-foreground"
              >
                {formatInline(block.replace(/^###\s+/, ""))}
              </h4>
            );
          }
          if (block.startsWith("## ")) {
            return (
              <h3
                key={`${sIdx}-${i}`}
                className="pt-2 text-base font-semibold tracking-tight text-foreground"
              >
                {formatInline(block.replace(/^##\s+/, ""))}
              </h3>
            );
          }
          if (block.startsWith("# ")) {
            return (
              <h2
                key={`${sIdx}-${i}`}
                className="pt-2 text-lg font-semibold tracking-tight text-foreground"
              >
                {formatInline(block.replace(/^#\s+/, ""))}
              </h2>
            );
          }
          return (
            <p
              key={`${sIdx}-${i}`}
              className="whitespace-pre-wrap text-foreground/90 leading-relaxed"
            >
              {formatInline(block)}
            </p>
          );
        });
      })}
    </div>
  );
}

function ReasoningAccordion({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const [expanded, setExpanded] = useState(isStreaming);

  useEffect(() => {
    if (isStreaming) setExpanded(true);
  }, [isStreaming]);

  if (!text.trim()) return null;

  return (
    <div className="mb-3 rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-xs">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5 font-medium">
          <BrainCircuit
            className={cn(
              "size-3.5 text-[var(--brand-gold)]",
              isStreaming && "animate-pulse",
            )}
          />
          <span>
            {isStreaming
              ? "Analyse zootechnique en cours…"
              : "Raisonnement POUFA AI Pro"}
          </span>
        </span>
        {expanded ? (
          <ChevronDown className="size-3.5 shrink-0" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0" />
        )}
      </button>
      {expanded && (
        <p className="mt-2 whitespace-pre-wrap border-t border-border/50 pt-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  );
}

function extractMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function extractMessageReasoning(message: UIMessage): {
  text: string;
  isStreaming: boolean;
} {
  const parts = message.parts.filter(
    (p): p is { type: "reasoning"; text: string; state?: "streaming" | "done" } =>
      p.type === "reasoning",
  );
  return {
    text: parts.map((p) => p.text).join(""),
    isStreaming: parts.some((p) => p.state === "streaming"),
  };
}

export default function PoufaAiPage() {
  const [chatSession, setChatSession] = useState<{
    id: string;
    initialMessages: UIMessage[];
  }>(() => ({
    id: crypto.randomUUID(),
    initialMessages: [],
  }));
  const [input, setInput] = useState("");
  const [modelTier, setModelTier] = useState<PoufaModelTier>("flash");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"focus" | "wide">("focus");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
        body: {
          modelTier,
          enableThinking: modelTier === "pro",
        },
      }),
    [modelTier],
  );

  const {
    messages,
    sendMessage,
    regenerate,
    stop,
    status,
    error,
    clearError,
  } = useChat({
    id: chatSession.id,
    messages: chatSession.initialMessages,
    transport,
    onFinish: () => {
      window.dispatchEvent(new CustomEvent("poufa:ai-conversations-updated"));
    },
  });

  const isStreaming = status === "submitted" || status === "streaming";

  const selectConversation = useCallback(async (convId: string) => {
    setLoadError(null);
    setDrawerOpen(false);
    try {
      const res = await fetch(`/api/ai/conversations/${convId}`);
      if (!res.ok) {
        if (res.status === 401) {
          setLoadError(
            "Session non authentifiée : connectez-vous pour consulter l'historique.",
          );
        }
        return;
      }
      const data = (await res.json()) as {
        messages?: Array<{
          id: string;
          role: "user" | "assistant" | "system";
          content: string;
        }>;
      };
      const uiMsgs: UIMessage[] = Array.isArray(data.messages)
        ? data.messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              id: m.id,
              role: m.role,
              parts: [{ type: "text", text: m.content }],
            }))
        : [];
      setChatSession({ id: convId, initialMessages: uiMsgs });
    } catch (err) {
      setLoadError(`Impossible de charger la conversation (${String(err)})`);
    }
  }, []);

  const handleNewConversation = useCallback(() => {
    void stop();
    clearError();
    setLoadError(null);
    setDrawerOpen(false);
    setChatSession({ id: crypto.randomUUID(), initialMessages: [] });
  }, [stop, clearError]);

  useEffect(() => {
    const handleSelectEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail?.id) {
        void selectConversation(customEvent.detail.id);
      }
    };
    const handleNewEvent = () => {
      handleNewConversation();
    };

    window.addEventListener("poufa:select-ai-conversation", handleSelectEvent);
    window.addEventListener("poufa:new-ai-conversation", handleNewEvent);

    return () => {
      window.removeEventListener(
        "poufa:select-ai-conversation",
        handleSelectEvent,
      );
      window.removeEventListener("poufa:new-ai-conversation", handleNewEvent);
    };
  }, [selectConversation, handleNewConversation]);

  const scrollToBottomIfNear = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || !nearBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottomIfNear();
  }, [messages, scrollToBottomIfNear]);

  const handleSendText = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isStreaming) return;
      clearError();
      setLoadError(null);
      setInput("");
      nearBottomRef.current = true;
      await sendMessage(
        { text },
        {
          body: {
            id: chatSession.id,
            modelTier,
            enableThinking: modelTier === "pro",
          },
        },
      );
    },
    [isStreaming, clearError, sendMessage, chatSession.id, modelTier],
  );

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore
    }
  };

  const displayError = loadError || error?.message || null;
  const needsAuth =
    displayError !== null &&
    (displayError.includes("401") ||
      displayError.toLowerCase().includes("authentifi"));
  const isThreadActive = messages.length > 0;
  const contentWidthClass =
    layoutMode === "focus" ? "max-w-[760px]" : "max-w-[1040px]";

  return (
    <div
      className={cn(
        "flex flex-col flex-1 transition-all duration-200",
        isFullscreen
          ? "fixed inset-0 z-50 h-dvh bg-background p-3 sm:p-6"
          : "h-[calc(100dvh-5.5rem)] min-h-[34rem]",
      )}
    >
      {/* ── Minimal Workspace Top Bar ── */}
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-border/60 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-tight text-foreground">
            POUFA AI
          </span>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <span className="text-xs text-muted-foreground">
            Assistant zootechnique SSE ({modelTier === "pro" ? "Pro" : "Flash"})
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setLayoutMode(layoutMode === "focus" ? "wide" : "focus")
            }
            title={
              layoutMode === "focus"
                ? "Passer en mode large (1040px)"
                : "Passer en mode concentration (760px)"
            }
            className="hidden sm:inline-flex h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Columns2 className="size-3.5 mr-1" aria-hidden />
            <span>{layoutMode === "focus" ? "Focus" : "Large"}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={
              isFullscreen
                ? "Quitter le plein écran"
                : "Plein écran immersif"
            }
            className="size-7 text-muted-foreground hover:text-foreground"
            aria-label="Basculer le plein écran"
          >
            {isFullscreen ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </Button>

          {isThreadActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewConversation}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Nouvelle
            </Button>
          )}

          {/* Mobile History Drawer trigger */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden size-7 text-muted-foreground"
                aria-label="Historique des conversations"
              >
                <History className="size-3.5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-2">
              <SheetHeader className="p-3 pb-1 border-b border-sidebar-border">
                <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                  <PoufaEmblem className="size-5" />
                  POUFA AI
                </SheetTitle>
              </SheetHeader>
              <AiSidebarNav
                activeId={chatSession.id}
                onSelectConversation={(id) => void selectConversation(id)}
                onNewConversation={handleNewConversation}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── Main Chat Area ── */}
      <div
        ref={scrollContainerRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          nearBottomRef.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 96;
        }}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-8"
      >
        {!isThreadActive ? (
          /* ── Quiet Luxury Centered Empty State ── */
          <div className="flex h-full min-h-[28rem] flex-col items-center justify-center text-center">
            <div className="flex flex-col items-center max-w-xl mx-auto px-4">
              <PoufaEmblem className="mb-6 size-12" />

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground tracking-tight leading-tight">
                Un regard plus clair sur votre exploitation.
              </h1>

              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Vos questions, vos données, vos décisions.
              </p>

              {/* Centered Signature Composer */}
              <div className="w-full max-w-[680px] mt-8">
                <PoufaComposer
                  value={input}
                  onChange={setInput}
                  onSubmit={() => void handleSendText(input)}
                  onStop={() => void stop()}
                  isStreaming={isStreaming}
                  placeholder="Posez une question sur votre exploitation ou vos bandes…"
                  badgeLabel="Bande active B-2026-014"
                  modelTier={modelTier}
                  onModelTierChange={setModelTier}
                />
              </div>

              {/* Discrete Suggested Prompts */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-[680px] text-left">
                {SUGGESTED_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => void handleSendText(item.prompt)}
                      className="group flex items-start gap-2.5 rounded-xl border border-border/70 bg-card/60 p-3 text-left transition-all hover:bg-card hover:border-border hover:shadow-xs"
                    >
                      <Icon className="size-4 shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {item.prompt}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ── Active Conversation Stream (Reading Column) ── */
          <div className={cn("mx-auto space-y-6 pb-28 pt-2", contentWidthClass)}>
            {displayError && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span className="flex-1">{displayError}</span>
                {needsAuth ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-7 text-xs"
                  >
                    <Link href="/connexion">Se connecter</Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void regenerate()}
                    className="h-7 text-xs"
                  >
                    Réessayer
                  </Button>
                )}
              </div>
            )}

            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              const textContent = extractMessageText(m);
              const reasoning = extractMessageReasoning(m);
              const isLastAssistant =
                !isUser && idx === messages.length - 1;
              const isMsgStreaming = isStreaming && isLastAssistant;

              return (
                <article
                  key={m.id}
                  className={cn(
                    "group relative flex gap-3 text-sm transition-all",
                    isUser ? "justify-end" : "justify-start",
                  )}
                >
                  {!isUser && (
                    <div className="size-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5 border border-border/60">
                      <PoufaEmblem className="size-4.5" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "rounded-2xl transition-all",
                      isUser
                        ? "max-w-[85%] bg-secondary/80 border border-border/60 px-4 py-3 text-foreground"
                        : "flex-1 max-w-full px-2 py-1 text-foreground",
                    )}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">
                        {textContent}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {reasoning.text && (
                          <ReasoningAccordion
                            text={reasoning.text}
                            isStreaming={reasoning.isStreaming}
                          />
                        )}

                        {isMsgStreaming &&
                          !textContent &&
                          !reasoning.text && (
                            <div className="flex items-center gap-1.5 py-2 text-xs text-muted-foreground">
                              <span className="inline-block size-1.5 rounded-full bg-[var(--brand-green)] dark:bg-[var(--brand-neon)] animate-pulse" />
                              <span>Réflexion en cours…</span>
                            </div>
                          )}

                        {textContent && (
                          <FormattedMessageContent content={textContent} />
                        )}

                        {!isMsgStreaming && textContent && (
                          <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => void handleCopy(m.id, textContent)}
                              className="flex items-center gap-1 hover:text-foreground transition-colors"
                              title="Copier la réponse"
                            >
                              {copiedId === m.id ? (
                                <>
                                  <Check className="size-3.5 text-success" />
                                  <span>Copié</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="size-3.5" />
                                  <span>Copier</span>
                                </>
                              )}
                            </button>

                            {isLastAssistant && (
                              <button
                                type="button"
                                onClick={() => void regenerate()}
                                className="flex items-center gap-1 hover:text-foreground transition-colors"
                                title="Régénérer la réponse"
                              >
                                <RotateCcw className="size-3.5" />
                                <span>Régénérer</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Anchored Bottom Composer in Active Conversation ── */}
      {isThreadActive && (
        <div className="border-t border-border/40 bg-background/95 px-4 pt-3 pb-4 backdrop-blur-sm">
          <div className={cn("mx-auto", contentWidthClass)}>
            <PoufaComposer
              value={input}
              onChange={setInput}
              onSubmit={() => void handleSendText(input)}
              onStop={() => void stop()}
              isStreaming={isStreaming}
              badgeLabel="Bande active B-2026-014"
              modelTier={modelTier}
              onModelTierChange={setModelTier}
            />
          </div>
        </div>
      )}
    </div>
  );
}

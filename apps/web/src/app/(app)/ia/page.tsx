"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Check,
  Columns2,
  Copy,
  History,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { PoufaEmblem } from "@/components/poufa-emblem";
import {
  PoufaFeedIcon,
  PoufaFlockIcon,
  PoufaSanitaryIcon,
  PoufaWeighingIcon,
} from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import { PoufaComposer } from "@/components/ai/poufa-composer";
import { AiSidebarNav } from "@/components/ai/ai-sidebar-nav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ConversationSummary {
  id: string;
  title: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "streaming" | "complete" | "error";
  createdAt?: string;
}

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
  const blocks = useMemo(() => content.split(/\n\n+/), [content]);

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
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isBulletList = lines.every((l) =>
          /^\s*([-*•]|\d+\.)\s+/.test(l.trim()),
        );
        if (isBulletList && lines.length > 0) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 text-foreground/90">
              {lines.map((line, j) => (
                <li key={j}>
                  {formatInline(line.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }
        if (block.trim().startsWith("### ")) {
          return (
            <h4
              key={i}
              className="pt-2 text-sm font-semibold tracking-tight text-foreground"
            >
              {formatInline(block.trim().replace(/^###\s+/, ""))}
            </h4>
          );
        }
        if (block.trim().startsWith("## ")) {
          return (
            <h3
              key={i}
              className="pt-2 text-base font-semibold tracking-tight text-foreground"
            >
              {formatInline(block.trim().replace(/^##\s+/, ""))}
            </h3>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
            {formatInline(block)}
          </p>
        );
      })}
    </div>
  );
}

export default function PoufaAiPage() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<"focus" | "wide">("focus");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);

  const selectConversation = useCallback(async (convId: string) => {
    setActiveConvId(convId);
    setErrorBanner(null);
    setDrawerOpen(false);
    try {
      const res = await fetch(`/api/ai/conversations/${convId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages(
          data.messages.map(
            (m: {
              id: string;
              role: "user" | "assistant";
              content: string;
              status?: "complete" | "error";
              createdAt?: string;
            }) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              status: m.status || "complete",
              createdAt: m.createdAt,
            }),
          ),
        );
      }
    } catch (err) {
      setErrorBanner(`Impossible de charger la conversation (${String(err)})`);
    }
  }, []);

  const handleNewConversation = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setActiveConvId(null);
    setMessages([]);
    setErrorBanner(null);
    setDrawerOpen(false);
  }, []);

  // Sync with adaptive sidebar custom events
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
      window.removeEventListener("poufa:select-ai-conversation", handleSelectEvent);
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

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isStreaming) return;

      setInput("");
      setLastPrompt(text);
      setErrorBanner(null);
      nearBottomRef.current = true;

      let convId = activeConvId;
      if (!convId) {
        convId = crypto.randomUUID();
        setActiveConvId(convId);
      }

      const userMsgId = crypto.randomUUID();
      const assistantPlaceholderId = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          role: "user",
          content: text,
          status: "complete",
          createdAt: nowIso,
        },
        {
          id: assistantPlaceholderId,
          role: "assistant",
          content: "",
          status: "streaming",
          createdAt: nowIso,
        },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      try {
        const res = await fetch(`/api/ai/conversations/${convId}/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error || `Erreur de communication (HTTP ${res.status})`,
          );
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const evtBlock of events) {
            const lines = evtBlock.split("\n");
            let eventType = "message";
            let dataStr = "";
            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith("data:")) {
                dataStr += line.slice(5).trim();
              }
            }
            if (!dataStr) continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (eventType === "message.delta" && parsed.text) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, content: m.content + parsed.text }
                      : m,
                  ),
                );
              } else if (eventType === "message.complete") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantPlaceholderId
                      ? { ...m, status: "complete" }
                      : m,
                  ),
                );
              } else if (eventType === "message.error") {
                throw new Error(parsed.error || "Erreur lors de la réponse");
              }
            } catch (innerErr) {
              if (eventType === "message.error") {
                throw innerErr;
              }
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholderId ? { ...m, status: "complete" } : m,
          ),
        );
        window.dispatchEvent(new CustomEvent("poufa:ai-conversations-updated"));
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? {
                    ...m,
                    content: m.content || "Génération interrompue.",
                    status: "complete",
                  }
                : m,
            ),
          );
        } else {
          const msg =
            err instanceof Error ? err.message : "Erreur réseau inattendue";
          setErrorBanner(msg);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? {
                    ...m,
                    content:
                      m.content ||
                      "La réponse n'a pas pu être générée. Vous pouvez réessayer.",
                    status: "error",
                  }
                : m,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeConvId, isStreaming],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore
    }
  };

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
          <span className="text-muted-foreground/40" aria-hidden>·</span>
          <span className="text-xs text-muted-foreground">
            Assistant zootéchnique
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Toggle Mode Focus (760px) / Large (1040px) */}
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

          {/* Plein écran immersif */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran immersif"}
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
                activeId={activeConvId}
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
                  onSubmit={() => void sendMessage(input)}
                  onStop={handleStop}
                  isStreaming={isStreaming}
                  placeholder="Posez une question sur votre exploitation ou vos bandes…"
                  badgeLabel="Bande active B-2026-014"
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
                      onClick={() => void sendMessage(item.prompt)}
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
            {errorBanner && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span className="flex-1">{errorBanner}</span>
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.role === "user";
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
                        {m.content}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {m.status === "streaming" && !m.content && (
                          <div className="flex items-center gap-1.5 py-2 text-xs text-muted-foreground">
                            <span className="inline-block size-1.5 rounded-full bg-[var(--brand-green)] dark:bg-[var(--brand-neon)] animate-pulse" />
                            <span>Réflexion en cours…</span>
                          </div>
                        )}
                        <FormattedMessageContent content={m.content} />

                        {m.status === "complete" && m.content && (
                          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => void handleCopy(m.id, m.content)}
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

                            {lastPrompt && (
                              <button
                                type="button"
                                onClick={() => void sendMessage(lastPrompt)}
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
              onSubmit={() => void sendMessage(input)}
              onStop={handleStop}
              isStreaming={isStreaming}
              badgeLabel="Bande active B-2026-014"
            />
          </div>
        </div>
      )}
    </div>
  );
}

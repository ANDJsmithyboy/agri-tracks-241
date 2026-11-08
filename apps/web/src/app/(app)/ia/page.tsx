"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  AlertCircle,
  Check,
  Copy,
  History,
  MessageSquarePlus,
  RotateCcw,
  Search,
  Send,
  Square,
  Trash2,
} from "lucide-react";
import { PoufaEmblem } from "@/components/poufa-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  farmId?: string | null;
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
    label: "Analyser ma bande",
    prompt:
      "Résume ma bande en cours avec l'effectif placé, les mortalités, les sorties et l'effectif actuel présent.",
  },
  {
    label: "Vérifier mes stocks",
    prompt:
      "Quelles sont mes réceptions d'intrants récentes et l'aliment distribué sur ma bande ?",
  },
  {
    label: "Comprendre mes indicateurs",
    prompt:
      "Quel est mon taux de mortalité, ma viabilité et la dernière pesée enregistrée ?",
  },
  {
    label: "Consulter mes signalements",
    prompt:
      "Quels signalements sanitaires et quels lots de traçabilité sont enregistrés sur mon exploitation ?",
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
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isBulletList = lines.every((l) =>
          /^\s*([-*•]|\d+\.)\s+/.test(l.trim()),
        );
        if (isBulletList && lines.length > 0) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5">
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
              className="pt-1 text-sm font-semibold tracking-tight text-foreground"
            >
              {formatInline(block.trim().replace(/^###\s+/, ""))}
            </h4>
          );
        }
        if (block.trim().startsWith("## ")) {
          return (
            <h3
              key={i}
              className="pt-1 text-base font-semibold tracking-tight text-foreground"
            >
              {formatInline(block.trim().replace(/^##\s+/, ""))}
            </h3>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {formatInline(block)}
          </p>
        );
      })}
    </div>
  );
}

export default function PoufaAiPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/conversations");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      }
    } catch {
      // Ignore initial offline/network error
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

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

  const handleDeleteConversation = useCallback(
    async (convId: string) => {
      try {
        await fetch(`/api/ai/conversations/${convId}`, { method: "DELETE" });
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (activeConvId === convId) {
          handleNewConversation();
        }
      } catch {
        // Ignore
      }
    },
    [activeConvId, handleNewConversation],
  );

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
        void loadConversations();
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
    [activeConvId, isStreaming, loadConversations],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore
    }
  };

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const HistoryList = (
    <div className="flex h-full flex-col gap-3">
      <Button
        onClick={handleNewConversation}
        variant="outline"
        className="w-full justify-start gap-2 border-border bg-card font-medium"
      >
        <MessageSquarePlus className="size-4 text-primary" aria-hidden />
        Nouvelle conversation
      </Button>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher…"
          aria-label="Rechercher une conversation"
          className="h-9 pl-8 text-xs"
        />
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {filteredConversations.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Aucune conversation récente.
          </p>
        ) : (
          filteredConversations.map((c) => {
            const active = c.id === activeConvId;
            return (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center justify-between gap-1 rounded-lg px-2.5 py-2 text-xs transition-colors",
                  active
                    ? "bg-secondary font-medium text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <button
                  type="button"
                  onClick={() => void selectConversation(c.id)}
                  className="flex-1 truncate text-left"
                >
                  {c.title}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteConversation(c.id)}
                  aria-label={`Supprimer ${c.title}`}
                  className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-[34rem] gap-5">
      {/* Desktop Conversation Sidebar */}
      <aside
        aria-label="Historique des conversations POUFA AI"
        className="hidden w-64 shrink-0 flex-col rounded-xl border border-border bg-card p-3.5 lg:flex"
      >
        {HistoryList}
      </aside>

      {/* Main Chat Workspace */}
      <section className="flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-card">
        {/* Minimal Header Bar */}
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <PoufaEmblem className="size-7" />
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-foreground">
                POUFA AI
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Votre assistant pour le suivi avicole.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewConversation}
              className="hidden sm:inline-flex"
            >
              <MessageSquarePlus className="size-4" aria-hidden />
              Nouvelle
            </Button>

            {/* Mobile History Drawer */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  aria-label="Historique des conversations"
                >
                  <History className="size-4" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-4">
                <SheetHeader className="pb-3">
                  <SheetTitle className="flex items-center gap-2 text-sm">
                    <PoufaEmblem className="size-6" />
                    POUFA AI
                  </SheetTitle>
                </SheetHeader>
                <div className="h-[calc(100dvh-5rem)]">{HistoryList}</div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Thread or Empty First Screen */}
        <div
          ref={scrollContainerRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            nearBottomRef.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 96;
          }}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-8"
        >
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
              <PoufaEmblem className="mb-4 size-14" />
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                POUFA AI
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                Votre assistant pour le suivi avicole. Posez une question sur
                vos bandes, vos stocks, vos pesées ou la traçabilité de vos
                lots.
              </p>

              <div className="mt-7 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SUGGESTED_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => void sendMessage(item.prompt)}
                    className="flex flex-col items-start rounded-xl border border-border bg-background/70 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-secondary/60"
                  >
                    <span className="text-xs font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                      {item.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-6">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      isUser ? "justify-end" : "justify-start",
                    )}
                  >
                    {!isUser && <PoufaEmblem className="mt-0.5 size-7" />}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3",
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background text-foreground",
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content}
                        </p>
                      ) : (
                        <>
                          {msg.content ? (
                            <FormattedMessageContent content={msg.content} />
                          ) : (
                            <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                              <span className="inline-block size-2 animate-pulse rounded-full bg-primary" />
                              Analyse des données de l&apos;exploitation…
                            </div>
                          )}

                          {msg.status === "streaming" && msg.content && (
                            <span
                              aria-hidden
                              className="ml-1 inline-block h-3.5 w-1.5 animate-pulse align-middle bg-primary"
                            />
                          )}

                          {msg.status !== "streaming" && msg.content && (
                            <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-border/60 pt-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleCopy(msg.id, msg.content)
                                }
                                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="size-3" aria-hidden />
                                    Copié
                                  </>
                                ) : (
                                  <>
                                    <Copy className="size-3" aria-hidden />
                                    Copier
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Recovery Banner */}
        {errorBanner && (
          <div className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive sm:mx-8">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              <span>{errorBanner}</span>
            </div>
            {lastPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void sendMessage(lastPrompt)}
                className="h-7 gap-1 text-xs"
              >
                <RotateCcw className="size-3" aria-hidden />
                Réessayer
              </Button>
            )}
          </div>
        )}

        {/* Persistent Bottom Composer */}
        <footer className="border-t border-border p-3 sm:px-6 sm:py-4">
          <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-xl border border-input bg-background px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez une question à POUFA AI…"
              aria-label="Message à POUFA AI"
              className="max-h-36 min-h-[28px] flex-1 resize-none bg-transparent py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {isStreaming ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleStop}
                aria-label="Arrêter la génération"
                className="h-8 shrink-0 gap-1.5"
              >
                <Square className="size-3.5 fill-current" aria-hidden />
                Arrêter
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={!input.trim()}
                onClick={() => void sendMessage(input)}
                aria-label="Envoyer le message"
                className="h-8 shrink-0 gap-1.5"
              >
                <Send className="size-3.5" aria-hidden />
                Envoyer
              </Button>
            )}
          </div>
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
            POUFA AI s&apos;appuie sur les données autorisées de votre ferme en
            lecture seule et ne remplace pas un diagnostic vétérinaire.
          </p>
        </footer>
      </section>
    </div>
  );
}

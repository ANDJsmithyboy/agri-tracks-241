"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConversationSummary {
  id: string;
  title: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function AiSidebarNav({
  onSelectConversation,
  onNewConversation,
  activeId,
}: {
  onSelectConversation?: (id: string) => void;
  onNewConversation?: () => void;
  activeId?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentActiveId = activeId ?? searchParams?.get("id");

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ai/conversations");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();

    const handleRefresh = () => {
      void loadConversations();
    };

    window.addEventListener("poufa:ai-conversations-updated", handleRefresh);
    return () => {
      window.removeEventListener("poufa:ai-conversations-updated", handleRefresh);
    };
  }, [loadConversations]);

  const handleSelect = (convId: string) => {
    if (onSelectConversation) {
      onSelectConversation(convId);
    } else {
      window.dispatchEvent(
        new CustomEvent("poufa:select-ai-conversation", { detail: { id: convId } }),
      );
    }
  };

  const handleNew = () => {
    if (onNewConversation) {
      onNewConversation();
    } else {
      window.dispatchEvent(new CustomEvent("poufa:new-ai-conversation"));
    }
  };

  const handleDelete = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/conversations/${convId}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      window.dispatchEvent(new CustomEvent("poufa:ai-conversations-updated"));
    } catch {
      // Ignore
    }
  };

  const filtered = conversations.filter((c) =>
    (c.title || "Nouvelle conversation")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full space-y-3 px-2 py-3 text-sm">
      {/* ── Top Return Action ── */}
      <Link
        href="/tableau-de-bord"
        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        <span>Retour à l&apos;exploitation</span>
      </Link>

      {/* ── New Conversation Button ── */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleNew}
        className="w-full justify-start gap-2 h-9 rounded-lg border-sidebar-border/80 bg-sidebar-accent/40 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent shadow-none"
      >
        <Plus className="size-3.5 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
        <span>Nouvelle conversation</span>
      </Button>

      {/* ── Search Filter ── */}
      <div className="relative">
        <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une discussion…"
          className="w-full h-8 pl-8 pr-2.5 text-xs bg-sidebar-accent/30 border border-sidebar-border/70 rounded-lg text-sidebar-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-ring/80"
        />
      </div>

      {/* ── Conversation History ── */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pt-2">
        <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Discussions récentes
        </p>

        {filtered.length === 0 ? (
          <p className="px-2.5 py-4 text-xs text-muted-foreground/70 text-center italic">
            {searchQuery ? "Aucune discussion trouvée." : "Aucune discussion récente."}
          </p>
        ) : (
          filtered.map((conv) => {
            const active = conv.id === currentActiveId;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                className={cn(
                  "group relative flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  <MessageSquare className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
                  <span className="truncate">{conv.title || "Discussion POUFA AI"}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDelete(e, conv.id)}
                  title="Supprimer"
                  aria-label="Supprimer la conversation"
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

"use client";

import {
  useRef,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { ArrowUp, BrainCircuit, Sparkles, Square, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PoufaModelTier = "flash" | "pro";

export interface PoufaComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  badgeLabel?: string;
  autoFocus?: boolean;
  modelTier?: PoufaModelTier;
  onModelTierChange?: (tier: PoufaModelTier) => void;
}

/**
 * PoufaComposer — Custom Claude-Inspired Quiet Luxury Composer (2026)
 *
 * Characteristics:
 * - Elevated soft surface (#FFFEFC in Royal Cream, #222326 in Obsidian)
 * - 20px radius with thin border (#E9E2D9 / #313235)
 * - Subtle two-layer shadow (shadow-composer)
 * - Multiline auto-resizing textarea
 * - Circular send control with optically centered upward arrow
 * - Stop-generation state with square icon
 */
export function PoufaComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder = "Posez une question sur votre élevage, vos bandes ou votre traçabilité…",
  className,
  badgeLabel = "Bande B-2026-014 active",
  autoFocus = true,
  modelTier,
  onModelTierChange,
}: PoufaComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea up to 200px
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 200);
    el.style.height = `${Math.max(52, nextHeight)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) {
        onStop?.();
      } else if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className={cn(
        "group relative flex w-full flex-col rounded-[20px] border border-border/85 bg-card transition-all duration-150 shadow-composer",
        "focus-within:border-ring/60 focus-within:ring-2 focus-within:ring-ring/15",
        disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      {/* ── Input Area ── */}
      <div className="px-4 pt-3.5 pb-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          aria-label="Message pour POUFA AI"
        />
      </div>

      {/* ── Action Lockup (Context badge + Circular Send / Stop Control) ── */}
      <div className="flex items-center justify-between px-3.5 pb-3 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {badgeLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 border border-border/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-[var(--brand-green)] dark:bg-[var(--brand-neon)]" />
              <span>{badgeLabel}</span>
            </span>
          )}
          {modelTier && onModelTierChange && (
            <div
              className="inline-flex items-center rounded-full border border-border/60 bg-secondary/40 p-0.5 text-[11px]"
              role="group"
              aria-label="Mode de modèle POUFA AI"
            >
              <button
                type="button"
                onClick={() => onModelTierChange("flash")}
                disabled={isStreaming}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium transition-colors",
                  modelTier === "flash"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Réponse rapide en temps réel (V4.1 Flash)"
              >
                <Zap className="size-3 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
                <span>Flash</span>
              </button>
              <button
                type="button"
                onClick={() => onModelTierChange("pro")}
                disabled={isStreaming}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium transition-colors",
                  modelTier === "pro"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Analyse approfondie avec raisonnement visible (V4 Pro)"
              >
                <BrainCircuit className="size-3 text-[var(--brand-gold)]" />
                <span>Pro</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isStreaming ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onStop}
              title="Arrêter la génération"
              aria-label="Arrêter la génération"
              className="size-8 rounded-full border-border/80 bg-background hover:bg-secondary text-foreground transition-all duration-150 shadow-xs"
            >
              <Square className="size-3 fill-current" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="icon"
              onClick={onSubmit}
              disabled={!canSend}
              title="Envoyer le message (Entrée)"
              aria-label="Envoyer le message"
              className={cn(
                "size-8 rounded-full bg-primary text-primary-foreground transition-all duration-150 shadow-xs",
                canSend
                  ? "opacity-100 hover:opacity-90 active:scale-95 cursor-pointer"
                  : "opacity-35 cursor-not-allowed",
              )}
            >
              <ArrowUp className="size-4 stroke-[2.25]" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


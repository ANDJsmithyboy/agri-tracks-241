"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { PoufaEmblem } from "@/components/poufa-emblem";

/**
 * Thème Clerk unifié (Royal Cream clair / Obsidian Neon sombre).
 * Évite toute imbrication de cartes et respecte l'esthétique neutre Apple-like.
 */
export const poufaClerkAppearance = {
  variables: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    borderRadius: "0.6875rem", // 11px
    spacingUnit: "0.95rem",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    logoPlacement: "none" as const,
    shimmer: false,
  },
  elements: {
    rootBox: "w-full",
    cardBox: "!w-full !shadow-none !border-0 !bg-transparent !rounded-none",
    card: "!w-full !shadow-none !border-0 !bg-transparent !p-0 !gap-5",
    main: "gap-5",
    header: "hidden",
    headerTitle:
      "!text-[16px] !font-semibold !tracking-[-0.015em] !text-[#28251F] dark:!text-[#F3F0E9]",
    headerSubtitle:
      "!text-[13px] !text-[#777168] dark:!text-[#A3A5AA] !leading-relaxed",

    // Boutons OAuth (Google)
    socialButtons: "gap-2.5",
    socialButtonsBlockButton:
      "!h-11 sm:!h-12 !rounded-[11px] !border !border-[#E4DCCE] dark:!border-[#30343A] !bg-[#FFFCF7] dark:!bg-[#17191D] hover:!bg-[#EFE9DF] dark:hover:!bg-[#1F2227] !text-[#28251F] dark:!text-[#F3F0E9] !shadow-none !transition-colors !duration-150 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#245747]/30 dark:focus-visible:!ring-[#B9F27C]/40",
    socialButtonsBlockButtonText:
      "!text-[14px] !font-medium !text-[#28251F] dark:!text-[#F3F0E9]",
    socialButtonsProviderIcon: "!size-[18px]",

    // Séparateur
    dividerRow: "!my-1",
    dividerLine: "!bg-[#E4DCCE] dark:!bg-[#30343A]",
    dividerText:
      "!text-[11px] !font-medium !uppercase !tracking-[0.08em] !text-[#777168] dark:!text-[#A3A5AA] !px-3",

    // Formulaire
    form: "gap-4",
    formFieldRow: "gap-3",
    formFieldLabel:
      "!text-[12px] !font-medium !text-[#28251F]/90 dark:!text-[#F3F0E9]/90 !mb-1.5",
    formFieldInput:
      "!h-11 sm:!h-12 !rounded-[11px] !border !border-[#E4DCCE] dark:!border-[#30343A] !bg-[#FFFCF7] dark:!bg-[#17191D] !text-[14px] !text-[#28251F] dark:!text-[#F3F0E9] placeholder:!text-[#777168]/70 dark:placeholder:!text-[#A3A5AA]/60 !px-3.5 !shadow-none !transition-colors !duration-150 focus:!border-[#245747] dark:focus:!border-[#B9F27C]/70 focus:!ring-2 focus:!ring-[#245747]/15 dark:focus:!ring-[#B9F27C]/20",
    formFieldInputShowPasswordButton:
      "!text-[#777168] dark:!text-[#A3A5AA] hover:!text-[#28251F] dark:hover:!text-[#F3F0E9] !right-2.5",
    formFieldAction:
      "!text-[12px] !font-medium !text-[#777168] dark:!text-[#A3A5AA] hover:!text-[#28251F] dark:hover:!text-[#F3F0E9] hover:!underline !underline-offset-4",
    formFieldHintText: "!text-[12px] !text-[#777168] dark:!text-[#A3A5AA]",
    formFieldErrorText:
      "!text-[12px] !font-medium !text-[#B53D39] dark:!text-[#F0716F] !mt-1.5",
    alert:
      "!rounded-[11px] !border !border-[#B53D39]/25 dark:!border-[#E05252]/30 !bg-[#B53D39]/8 dark:!bg-[#E05252]/10 !text-[#28251F] dark:!text-[#F3F0E9] !px-3.5 !py-2.5",
    alertText: "!text-[13px] !leading-snug",

    // Bouton principal (Encre sombre sur Royal Cream / Ivoire sur Obsidian)
    formButtonPrimary:
      "!h-11 sm:!h-12 !rounded-[11px] !bg-[#28251F] dark:!bg-[#F3F0E9] !text-[#FFFCF7] dark:!text-[#101216] hover:!opacity-92 active:!scale-[0.995] !text-[14px] !font-semibold !tracking-[-0.01em] !shadow-none !transition-all !duration-150 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[#245747]/40 dark:focus-visible:!ring-[#B9F27C]/60 focus-visible:!ring-offset-2 focus-visible:!ring-offset-[#F5F0E7] dark:focus-visible:!ring-offset-[#101216]",

    // Pied de composant Clerk (lien inscription / connexion + mention Clerk)
    footer:
      "!bg-transparent !bg-none !border-0 !pt-4 !mt-1 !shadow-none [&>div]:!bg-transparent [&>div]:!bg-none",
    footerAction: "!justify-center",
    footerActionText: "!text-[13px] !text-[#777168] dark:!text-[#A3A5AA]",
    footerActionLink:
      "!text-[13px] !font-semibold !text-[#28251F] dark:!text-[#F3F0E9] hover:!underline !underline-offset-4",
    identityPreview:
      "!rounded-[11px] !border !border-[#E4DCCE] dark:!border-[#30343A] !bg-[#FFFCF7] dark:!bg-[#17191D]",
    identityPreviewText: "!text-[13px] !font-medium !text-[#28251F] dark:!text-[#F3F0E9]",
    identityPreviewEditButton:
      "!text-[12px] !text-[#777168] dark:!text-[#A3A5AA] hover:!text-[#28251F] dark:hover:!text-[#F3F0E9]",
    backLink:
      "!text-[12px] !text-[#777168] dark:!text-[#A3A5AA] hover:!text-[#28251F] dark:hover:!text-[#F3F0E9]",
  },
};

interface PoufaAuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function PoufaAuthShell({
  title,
  subtitle,
  children,
}: PoufaAuthShellProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="min-h-dvh w-full flex flex-col lg:flex-row bg-[#F5F0E7] dark:bg-[#0B0D10] text-[#28251F] dark:text-[#F3F0E9] overflow-x-hidden">
      {/* ── Panneau Artistique Gauche (~46% Desktop) ── */}
      <aside
        aria-label="Identité visuelle POUFA"
        className="hidden lg:flex lg:w-[46%] lg:shrink-0 relative overflow-hidden bg-[#0B0D10] border-r border-black/10 dark:border-white/[0.07] select-none"
      >
        <Image
          src="/branding/poufa-auth-cinematic.webp"
          alt="Sculpture cristalline et topographie de traçabilité avicole POUFA"
          fill
          priority
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="object-cover object-[12%_50%]"
        />

        {/* Scrim léger pour lisibilité du titre en haut à gauche + transition vers le panneau droit */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,13,16,0.72) 0%, rgba(11,13,16,0.22) 24%, rgba(11,13,16,0.02) 48%, rgba(11,13,16,0.34) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(11,13,16,0.42) 100%)",
          }}
        />

        {/* Verrouillage haut-gauche : Emblème officiel + POUFA + descripteur */}
        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-12">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 items-center justify-center rounded-xl border border-white/12 bg-[#101216]/70 p-1.5 backdrop-blur-sm">
              <PoufaEmblem className="size-full" />
            </div>
            <div className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-[-0.015em] text-[#F3F0E9]">
                POUFA
              </span>
              <span className="block text-[12px] text-[#A3A5AA]">
                Suivi avicole et traçabilité.
              </span>
            </div>
          </div>

          <div aria-hidden className="h-4" />
        </div>
      </aside>

      {/* ── Panneau d'Authentification Droit (~54% Desktop, 100% Mobile) ── */}
      <main className="relative flex-1 lg:w-[54%] min-h-dvh flex flex-col justify-between bg-[#F5F0E7] dark:bg-[#101216] transition-colors duration-200">
        {/* Barre supérieure discrète : identité mobile + bouton thème */}
        <header className="flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6">
          <div className="flex items-center gap-2.5 lg:invisible">
            <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E4DCCE] dark:border-[#30343A] bg-[#0B0D10] p-1">
              <PoufaEmblem className="size-full" />
            </div>
            <div className="leading-tight">
              <span className="block text-[14px] font-semibold tracking-[-0.015em] text-[#28251F] dark:text-[#F3F0E9]">
                POUFA
              </span>
              <span className="block text-[11px] text-[#777168] dark:text-[#A3A5AA]">
                Suivi avicole et traçabilité.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={
              isDark
                ? "Activer le thème Royal Cream (clair)"
                : "Activer le thème Obsidian (sombre)"
            }
            title={
              isDark ? "Thème Royal Cream (clair)" : "Thème Obsidian (sombre)"
            }
            className="inline-flex size-9 items-center justify-center rounded-[10px] border border-[#E4DCCE] dark:border-[#30343A] bg-[#FFFCF7] dark:bg-[#17191D] text-[#777168] dark:text-[#A3A5AA] hover:text-[#28251F] dark:hover:text-[#F3F0E9] hover:border-[#28251F]/25 dark:hover:border-[#F3F0E9]/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245747]/40 dark:focus-visible:ring-[#B9F27C]/50"
          >
            {mounted ? (
              isDark ? (
                <Sun className="size-4" aria-hidden />
              ) : (
                <Moon className="size-4" aria-hidden />
              )
            ) : (
              <span className="size-4" aria-hidden />
            )}
          </button>
        </header>

        {/* Contenu principal centré (380-420px max-width) */}
        <section className="flex-1 flex flex-col items-center justify-center px-5 py-6 sm:px-8 sm:py-10">
          <div className="w-full max-w-[400px] animate-auth-enter">
            {/* Aperçu visuel miniature raffiné sur mobile uniquement */}
            <div className="relative mb-6 h-20 w-full overflow-hidden rounded-xl border border-[#E4DCCE] dark:border-[#30343A] bg-[#0B0D10] lg:hidden">
              <Image
                src="/branding/poufa-auth-cinematic.webp"
                alt="Identité visuelle POUFA"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 400px"
                className="object-cover object-[24%_42%]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(11,13,16,0.12) 0%, rgba(11,13,16,0.55) 100%)",
                }}
              />
            </div>

            <div className="mb-6 space-y-1.5 text-left">
              <h1 className="text-[24px] sm:text-[26px] font-semibold tracking-[-0.025em] leading-[1.2] text-[#28251F] dark:text-[#F3F0E9]">
                {title}
              </h1>
              <p className="text-[14px] leading-relaxed text-[#777168] dark:text-[#A3A5AA]">
                {subtitle}
              </p>
            </div>

            {children}
          </div>
        </section>

        {/* Attribution discrète SmartANDJ AI Technologies (toujours visible desktop & mobile) */}
        <footer className="px-5 pb-6 pt-2 text-center text-xs text-[#777168] dark:text-[#A3A5AA]">
          by{" "}
          <span className="font-medium text-[#28251F]/80 dark:text-[#F3F0E9]/85">
            SmartANDJ AI Technologies
          </span>
        </footer>
      </main>
    </div>
  );
}


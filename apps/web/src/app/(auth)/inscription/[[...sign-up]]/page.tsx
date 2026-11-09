import Image from "next/image";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "w-full shadow-none border border-border bg-card rounded-2xl p-6 sm:p-7",
    headerTitle: "text-foreground font-semibold text-lg tracking-tight",
    headerSubtitle: "text-muted-foreground text-xs leading-relaxed",
    socialButtonsBlockButton:
      "border border-border bg-background hover:bg-secondary/60 text-foreground text-sm font-medium h-11 rounded-xl transition-colors",
    socialButtonsBlockButtonText: "font-medium text-foreground text-sm",
    dividerRow: "my-4",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground text-xs uppercase tracking-wider",
    formFieldLabel: "text-foreground text-xs font-medium mb-1.5",
    formFieldInput:
      "h-11 rounded-xl border border-input bg-background text-foreground text-sm px-3.5 focus:border-ring focus:ring-1 focus:ring-ring transition-colors",
    formButtonPrimary:
      "h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-xs",
    footerActionText: "text-muted-foreground text-xs",
    footerActionLink: "text-primary font-semibold text-xs hover:underline",
    identityPreviewText: "text-foreground text-sm font-medium",
    identityPreviewEditButton: "text-primary text-xs hover:underline",
    formFieldAction: "text-primary text-xs hover:underline",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    logoPlacement: "none" as const,
  },
};

export default function InscriptionPage() {
  return (
    <div className="min-h-dvh w-full bg-background grid lg:grid-cols-12 overflow-x-hidden">
      {/* ── Left Column: Brand Showcase (Desktop only) ── */}
      <aside className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between p-10 xl:p-14 bg-secondary/35 border-r border-border relative">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="relative shrink-0 overflow-hidden rounded-xl border border-border/80 bg-card p-2 shadow-xs"
              style={{
                width: "56px",
                height: "56px",
                maxWidth: "56px",
                maxHeight: "56px",
                flexShrink: 0,
              }}
            >
              <Image
                src="/branding/poufa-symbol.svg"
                alt="Logo officiel POUFA"
                width={56}
                height={56}
                priority
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
            <div>
              <span className="font-mono text-2xl font-black tracking-tight text-foreground block">
                POUFA
              </span>
              <span className="text-xs text-muted-foreground">
                Plateforme Avicole Nationale
              </span>
            </div>
          </div>

          <Badge variant="outline" className="text-[11px] font-medium">
            Programme National KIMBA 2026 · Gabon
          </Badge>
        </div>

        <div className="space-y-6 max-w-md my-auto py-12">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl xl:text-4xl font-normal tracking-tight text-foreground leading-[1.15]">
              Rejoignez le réseau national POUFA.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connectez votre élevage au registre national et bénéficiez de l&apos;encadrement technique.
            </p>
          </div>

          <div className="space-y-3.5 pt-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground font-semibold">
                  Attribution de code officiel :
                </strong>{" "}
                identifiant unique d&apos;exploitation reconnu par la DGE.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground font-semibold">
                  Sécurité sanitaire :
                </strong>{" "}
                accès aux alertes épidémiologiques et aux visites vétérinaires.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/80 text-[11px] text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">
            SmartANDJ AI Technologies
          </p>
          <p>
            République Gabonaise · Ministère de l&apos;Agriculture et de l&apos;Élevage
          </p>
        </div>
      </aside>

      {/* ── Right Column: Clerk Sign-Up Form ── */}
      <main className="lg:col-span-7 xl:col-span-7 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 min-h-dvh">
        <div className="w-full max-w-[420px] space-y-6">
          <div className="flex flex-col items-center text-center gap-3 lg:hidden pt-4">
            <div
              className="relative shrink-0 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xs"
              style={{
                width: "48px",
                height: "48px",
                maxWidth: "48px",
                maxHeight: "48px",
                flexShrink: 0,
              }}
            >
              <Image
                src="/branding/poufa-symbol.svg"
                alt="Logo officiel POUFA"
                width={48}
                height={48}
                priority
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
            <div>
              <span className="font-mono text-2xl font-black tracking-tight text-foreground block">
                POUFA
              </span>
              <span className="text-xs text-muted-foreground">
                Création de compte opérateur
              </span>
            </div>
          </div>

          <div className="text-center lg:text-left space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Créer votre compte
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Remplissez les informations ci-dessous pour démarrer.
            </p>
          </div>

          <div className="w-full flex justify-center">
            <SignUp
              path="/inscription"
              routing="path"
              signInUrl="/connexion"
              fallbackRedirectUrl="/tableau-de-bord"
              signInFallbackRedirectUrl="/tableau-de-bord"
              appearance={clerkAppearance}
            />
          </div>

          <div className="text-center space-y-2 pt-2">
            <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground/80">
              <Link href="/connexion" className="hover:underline">
                Déjà un compte ? Se connecter
              </Link>
              <span>·</span>
              <Link href="/telecharger" className="hover:underline">
                Application mobile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

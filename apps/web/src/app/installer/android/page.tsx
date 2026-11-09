import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  HelpCircle,
  ShieldCheck,
  Smartphone,
  WifiOff,
  Zap,
} from "lucide-react";
import { PoufaEmblem } from "@/components/poufa-emblem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { POUFA_ANDROID_RELEASE } from "@/lib/android-release";

export const metadata: Metadata = {
  title: "Installer POUFA sur Android · KIMBA 2026",
  description:
    "Guide officiel d'installation de l'application native POUFA Android pour les éleveurs avicoles.",
};

export default function InstallerAndroidPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:py-10">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-xs">
          <Link href="/tableau-de-bord">
            <ArrowLeft className="size-4" />
            <span>Tableau de bord POUFA</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {POUFA_ANDROID_RELEASE.version}
          </Badge>
          <Badge variant="brand" className="text-xs">
            KIMBA 2026
          </Badge>
        </div>
      </div>

      {/* Hero Section */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center sm:text-left shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          <PoufaEmblem className="size-16 sm:size-20 shrink-0" />
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Installer POUFA sur Android
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Application mobile native Kotlin & Jetpack Compose. Conçue pour une autonomie totale en poulailler sans connexion Internet.
            </p>
          </div>
        </div>
      </div>

      {/* Main Download Card */}
      <Card className="border-2 border-primary/25 shadow-sm">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--brand-green)]/15 text-[var(--brand-green)] dark:bg-[var(--brand-neon)]/15 dark:text-[var(--brand-neon)]">
                <Smartphone className="size-6" />
              </div>
              <div>
                <CardTitle className="text-lg">POUFA Android Officiel</CardTitle>
                <CardDescription className="text-xs">
                  Fichier APK autonome · {POUFA_ANDROID_RELEASE.sizeLabel} · Version {POUFA_ANDROID_RELEASE.version}
                </CardDescription>
              </div>
            </div>
            <Badge variant="brand">100% Hors-ligne</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Primary Action Button — Direct Download */}
          <div className="space-y-2">
            <Button
              variant="brand"
              size="lg"
              className="w-full gap-2.5 text-base font-semibold shadow-xs"
              asChild
            >
              <a href={POUFA_ANDROID_RELEASE.url}>
                <Download className="size-5" />
                <span>Télécharger POUFA pour Android ({POUFA_ANDROID_RELEASE.sizeLabel})</span>
              </a>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Téléchargement direct depuis GitHub Releases · Sans passerelle tierce
            </p>
          </div>

          {/* Core Advantages */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2.5 rounded-lg border border-border p-3 text-xs">
              <WifiOff className="size-4 text-[var(--brand-green)] dark:text-[var(--brand-neon)] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-foreground">Saisie hors connexion</strong>
                <span className="text-muted-foreground">Mortalités, pesées, rations stockées dans SQLite Room.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-border p-3 text-xs">
              <Zap className="size-4 text-[var(--brand-gold)] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-foreground">Synchro automatique</strong>
                <span className="text-muted-foreground">Envoi différé vers Neon PostgreSQL au retour du réseau.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-border p-3 text-xs">
              <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-foreground">Traçabilité complète</strong>
                <span className="text-muted-foreground">Suivi des bandes et conseils zootechniques avec POUFA AI.</span>
              </div>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <HelpCircle className="size-4 text-primary" />
              <span>Guide d&apos;installation en 4 étapes</span>
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  1
                </span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Télécharger le fichier APK</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Appuyez sur le bouton vert ci-dessus. Le téléchargement démarre immédiatement dans votre navigateur.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  2
                </span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Ouvrir le fichier téléchargé</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Touchez la notification de téléchargement terminé ou ouvrez votre dossier <em>Téléchargements</em>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  3
                </span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Autoriser la source (si demandé)</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Si Android demande une confirmation, activez <em>« Autoriser cette source »</em> dans les Paramètres (Samsung, TECNO, Infinix, Xiaomi).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  4
                </span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Installer & Se connecter</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Touchez <em>Installer</em> puis <em>Ouvrir</em>. Connectez-vous une première fois pour initialiser vos fermes locales.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>Nom du binaire : <code>{POUFA_ANDROID_RELEASE.filename}</code></span>
            <span>Compatibilité : {POUFA_ANDROID_RELEASE.minAndroid}</span>
            <span className="font-mono text-[11px]">SHA-256 : {POUFA_ANDROID_RELEASE.sha256.slice(0, 16)}…</span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto text-xs">
            <Link href="/telecharger">
              Voir la page de vérification détaillée
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto text-xs">
            <Link href="/tableau-de-bord">
              Continuer sur POUFA Web
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


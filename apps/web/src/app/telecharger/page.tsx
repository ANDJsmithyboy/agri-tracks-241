import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  ExternalLink,
  HardDrive,
  Laptop,
  Monitor,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WifiOff,
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

export const metadata = {
  title: "Télécharger POUFA · Application Android & Bureau",
  description:
    "Téléchargez l'application officielle POUFA pour Android (APK natif 100% hors-ligne) et installez l'application de bureau PWA pour le suivi avicole au Gabon.",
};

export default function TelechargerPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 py-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-xs">
          <Link href="/tableau-de-bord">
            <ArrowLeft className="size-4" />
            Retour au tableau de bord
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            KIMBA 2026
          </Badge>
          <Badge variant="brand" className="text-xs">
            Build Validé
          </Badge>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <PoufaEmblem className="size-16 shrink-0" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Télécharger POUFA pour vos équipes de terrain
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
              Déployez POUFA sur vos smartphones Android pour la saisie quotidienne en poulailler sans connexion Internet, ou installez la version de bureau sur vos ordinateurs d&apos;exploitation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Dual Download Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Android Native Card */}
        <Card className="flex flex-col justify-between border-2 border-primary/20 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand-green)]/15 text-[var(--brand-green)] dark:bg-[var(--brand-neon)]/15 dark:text-[var(--brand-neon)]">
                  <Smartphone className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">POUFA Android Native</CardTitle>
                  <CardDescription className="text-xs">
                    Package universel APK (Kotlin & Jetpack Compose)
                  </CardDescription>
                </div>
              </div>
              <Badge variant="brand">Terrain & Offline</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* QR Code & Direct Scan */}
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center">
              <div className="rounded-lg border border-border bg-white p-2.5 shadow-2xs shrink-0">
                <svg
                  viewBox="0 0 140 140"
                  className="size-32 text-[#28251F]"
                  fill="currentColor"
                  aria-label="QR Code APK Android"
                >
                  <rect x="10" y="10" width="35" height="35" rx="4" fill="currentColor" />
                  <rect x="16" y="16" width="23" height="23" rx="2" fill="#FFFFFF" />
                  <rect x="22" y="22" width="11" height="11" rx="1" fill="currentColor" />
                  <rect x="95" y="10" width="35" height="35" rx="4" fill="currentColor" />
                  <rect x="101" y="16" width="23" height="23" rx="2" fill="#FFFFFF" />
                  <rect x="107" y="22" width="11" height="11" rx="1" fill="currentColor" />
                  <rect x="10" y="95" width="35" height="35" rx="4" fill="currentColor" />
                  <rect x="16" y="101" width="23" height="23" rx="2" fill="#FFFFFF" />
                  <rect x="22" y="107" width="11" height="11" rx="1" fill="currentColor" />
                  <rect x="52" y="12" width="6" height="6" rx="1" />
                  <rect x="64" y="12" width="6" height="6" rx="1" />
                  <rect x="76" y="12" width="6" height="6" rx="1" />
                  <rect x="52" y="24" width="6" height="6" rx="1" />
                  <rect x="64" y="24" width="6" height="6" rx="1" />
                  <rect x="76" y="36" width="6" height="6" rx="1" />
                  <rect x="52" y="48" width="6" height="6" rx="1" />
                  <rect x="64" y="60" width="6" height="6" rx="1" />
                  <rect x="76" y="48" width="6" height="6" rx="1" />
                  <rect x="16" y="52" width="6" height="6" rx="1" />
                  <rect x="28" y="52" width="6" height="6" rx="1" />
                  <rect x="40" y="52" width="6" height="6" rx="1" />
                  <rect x="16" y="64" width="6" height="6" rx="1" />
                  <rect x="28" y="76" width="6" height="6" rx="1" />
                  <rect x="95" y="52" width="6" height="6" rx="1" />
                  <rect x="107" y="64" width="6" height="6" rx="1" />
                  <rect x="119" y="52" width="6" height="6" rx="1" />
                  <rect x="95" y="76" width="6" height="6" rx="1" />
                  <rect x="107" y="76" width="6" height="6" rx="1" />
                  <rect x="52" y="95" width="6" height="6" rx="1" />
                  <rect x="64" y="107" width="6" height="6" rx="1" />
                  <rect x="76" y="95" width="6" height="6" rx="1" />
                  <rect x="64" y="119" width="6" height="6" rx="1" />
                  <rect x="95" y="95" width="6" height="6" rx="1" />
                  <rect x="107" y="107" width="6" height="6" rx="1" />
                  <rect x="119" y="119" width="6" height="6" rx="1" />
                  <rect x="95" y="119" width="6" height="6" rx="1" />
                </svg>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-semibold text-foreground">
                  Scanner pour installer sur mobile
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Pointez l&apos;appareil photo de votre smartphone pour télécharger directement l&apos;APK sans passer par un ordinateur.
                </p>
              </div>
            </div>

            {/* Technical Specs List */}
            <div className="space-y-2 rounded-xl border border-border bg-card p-3.5 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Version de publication</span>
                <span className="font-mono font-medium">0.1.0-kimba-demo</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Poids du fichier</span>
                <span className="font-mono font-medium">26.55 Mo</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Système minimum</span>
                <span className="font-medium">Android 8.0 (Oreo, API 26+)</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-muted-foreground">Validation CI</span>
                <span className="font-medium text-[var(--brand-green)] dark:text-[var(--brand-neon)]">
                  Pass 100% · Run #42518891662
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Technologie hors-ligne</span>
                <span className="font-medium">Room SQLite + WorkManager</span>
              </div>
            </div>

            {/* Offline Key Benefit */}
            <div className="flex items-start gap-2.5 rounded-lg border border-[var(--brand-green)]/30 bg-[var(--brand-green)]/5 p-3 text-xs text-foreground dark:border-[var(--brand-neon)]/30 dark:bg-[var(--brand-neon)]/5">
              <WifiOff className="size-4 shrink-0 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
              <p className="leading-relaxed">
                <strong>Fonctionne sans Internet :</strong> une fois connecté, toutes les saisies (mortalités, pesées, alimentation) sont enregistrées localement et synchronisées automatiquement dès le retour du réseau 3G/4G/Wi-Fi.
              </p>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button variant="brand" className="w-full gap-2 text-sm" asChild>
              <a
                href="https://github.com/smartandjai/Agri-track-241/actions/runs/42518891662"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="size-4" />
                <span>Télécharger l&apos;APK Android (26.55 Mo)</span>
              </a>
            </Button>
          </CardFooter>
        </Card>

        {/* Desktop PWA Card */}
        <Card className="flex flex-col justify-between shadow-sm">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Laptop className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">POUFA pour Bureau (PWA)</CardTitle>
                  <CardDescription className="text-xs">
                    Application de bureau autonome pour PC & Mac
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">Web App</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-xs">
              <p className="font-semibold text-foreground">
                Comment installer POUFA sur votre ordinateur :
              </p>
              <ol className="space-y-2 text-muted-foreground list-decimal pl-4">
                <li>
                  Ouvrez POUFA dans <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>.
                </li>
                <li>
                  Dans la barre d&apos;adresse en haut à droite, cliquez sur l&apos;icône <strong>Installer l&apos;application</strong> (ou menu ⋮ &gt; Installer POUFA).
                </li>
                <li>
                  POUFA s&apos;ouvre dans sa propre fenêtre indépendante avec icône sur votre bureau et dans votre barre des tâches.
                </li>
              </ol>
            </div>

            {/* Desktop Benefits */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-border p-3 space-y-1">
                <p className="font-medium text-foreground">Plein écran immersif</p>
                <p className="text-[11px] text-muted-foreground">
                  Sans barre d&apos;adresse de navigateur, navigation ultra-fluide.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1">
                <p className="font-medium text-foreground">Raccourcis ⌘K</p>
                <p className="text-[11px] text-muted-foreground">
                  Palette de commandes instantanée et recherche universelle.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1">
                <p className="font-medium text-foreground">Mode Double Écran</p>
                <p className="text-[11px] text-muted-foreground">
                  Idéal pour la saisie de masse et l&apos;analyse zootechnique.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1">
                <p className="font-medium text-foreground">POUFA AI Intégré</p>
                <p className="text-[11px] text-muted-foreground">
                  Assistant DeepSeek avec mode concentration grand écran.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Compatibilité bureau</span>
                <span className="font-medium">Windows 10/11, macOS, Linux</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mises à jour</span>
                <span className="font-medium text-[var(--brand-green)] dark:text-[var(--brand-neon)]">
                  Automatiques et instantanées
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button variant="outline" className="w-full gap-2 text-sm" asChild>
              <Link href="/tableau-de-bord">
                <Monitor className="size-4" />
                <span>Utiliser POUFA sur le Web maintenant</span>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Kimba 2026 Jury Notice */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">
          Challenge National KIMBA 2026 · République Gabonaise
        </p>
        <p>
          Développé par <strong>SmartANDJ AI Technologies SARL</strong> (Libreville, Gabon).
          Authentification unifiée Clerk · Base de données Neon PostgreSQL · Moteur d&apos;inférence DeepSeek.
        </p>
      </div>
    </div>
  );
}

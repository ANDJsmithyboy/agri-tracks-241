import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  QrCode,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  PoufaFarmIcon,
  PoufaFlockIcon,
  PoufaQrVerifyIcon,
  PoufaSanitaryIcon,
  PoufaTraceabilityIcon,
  PoufaTransferIcon,
  PoufaWeighingIcon,
} from "@/components/brand-icons";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLotsData } from "@/lib/poufa-queries";

export default async function TracabilitePage() {
  const lots = await getLotsData();
  const primaryLot = lots[0];

  return (
    <div className="space-y-8 pb-12">
      {/* ── Open Canvas Header ── */}
      <section className="space-y-3">
        <PageHeader
          title="Traçabilité — Chaîne des lots"
          description="Identifiants uniques, registre généalogique d'élevage, transferts certifiés et vérification par code QR — de l'exploitation aux opérateurs avals."
          badge={<Badge variant="brand">Traçabilité certifiée · KIMBA 2026</Badge>}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/operateurs">
                  Opérateurs partenaires
                </Link>
              </Button>
              <Button variant="brand" size="sm" asChild>
                <Link href="/saisie">
                  Déclarer une cession
                </Link>
              </Button>
            </div>
          }
        />
      </section>

      {/* ── Motif B: Visual Traceability Path (Discrete Connectors & Node Geometry) ── */}
      <section
        aria-label="Chaîne de traçabilité du lot principal"
        className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-secondary/40 text-[var(--brand-green)] dark:text-[var(--brand-neon)]">
              <PoufaTraceabilityIcon size={22} strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                  Parcours de traçabilité certifié : {primaryLot?.official_code ?? "LP-2026-000142"}
                </h2>
                <Badge variant="brand" className="text-[10px]">
                  Audit complet
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Lot de 300 poulets de chair vifs · Élevé à Kango (Estuaire)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-md border border-border">
              Empreinte : 4b92…e01a
            </span>
          </div>
        </div>

        {/* 4 Connected Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Node 1: Eclosion & Placement */}
          <div className="relative rounded-xl border border-border bg-secondary/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--brand-green)]/15 dark:bg-[var(--brand-neon)]/15 text-[var(--brand-green)] dark:text-[var(--brand-neon)] text-xs font-bold font-mono">
                01
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">J0 · 25 Sep</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Mise en place</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Ferme Avicole de Kango</p>
              <p className="text-[11px] text-muted-foreground">Bande B-2026-014 (1 000 poussins)</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[var(--brand-green)] dark:text-[var(--brand-neon)] font-medium pt-1">
              <CheckCircle2 className="size-3" /> Origine certifiée
            </div>
          </div>

          {/* Node 2: Elevage & Suivi Zootechnique */}
          <div className="relative rounded-xl border border-border bg-secondary/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--brand-green)]/15 dark:bg-[var(--brand-neon)]/15 text-[var(--brand-green)] dark:text-[var(--brand-neon)] text-xs font-bold font-mono">
                02
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">J0 → J34</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Élevage sous contrôle</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Viabilité : 94,8 %</p>
              <p className="text-[11px] text-muted-foreground">Alimentation 100 % tracée</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[var(--brand-green)] dark:text-[var(--brand-neon)] font-medium pt-1">
              <CheckCircle2 className="size-3" /> Registre vétérinaire conforme
            </div>
          </div>

          {/* Node 3: Pesee & Cession */}
          <div className="relative rounded-xl border border-border bg-secondary/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--brand-green)]/15 dark:bg-[var(--brand-neon)]/15 text-[var(--brand-green)] dark:text-[var(--brand-neon)] text-xs font-bold font-mono">
                03
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">J35 · 30 Oct</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Pesée & Allotement</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Poids moyen : 2,15 kg</p>
              <p className="text-[11px] text-muted-foreground">Quantité : 300 sujets vifs</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[var(--brand-green)] dark:text-[var(--brand-neon)] font-medium pt-1">
              <CheckCircle2 className="size-3" /> Biomasse 645 kg certifiée
            </div>
          </div>

          {/* Node 4: Transport & Destination */}
          <div className="relative rounded-xl border border-border bg-secondary/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--brand-green)]/15 dark:bg-[var(--brand-neon)]/15 text-[var(--brand-green)] dark:text-[var(--brand-neon)] text-xs font-bold font-mono">
                04
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">J35 · 06 Nov</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Transfert & Réception</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Destinataire : Marché Libreville</p>
              <p className="text-[11px] text-muted-foreground">Transporteur : Coopérative Estuaire</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[var(--brand-green)] dark:text-[var(--brand-neon)] font-medium pt-1">
              <CheckCircle2 className="size-3" /> QR code vérifié
            </div>
          </div>
        </div>
      </section>

      {/* ── Bounded Workspace: Lots Ledger & QR Certificate ── */}
      <section className="grid gap-6 lg:grid-cols-12">
        {/* Table des lots */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="border-b border-border p-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <PoufaTraceabilityIcon size={16} className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
              Registre officiel des lots de transfert
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historique immuable des lots alloués, quantités cédées et correspondances d&apos;élevage.
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 text-xs">
                  <TableHead className="w-36">Code officiel</TableHead>
                  <TableHead>Ferme source</TableHead>
                  <TableHead>Bande</TableHead>
                  <TableHead>Destinataire</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead className="text-center w-28">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {lots.map((l) => (
                  <TableRow key={l.id} className="hover:bg-accent/40 transition-colors">
                    <TableCell className="font-mono font-bold text-foreground">
                      {l.official_code ?? "En attente serveur"}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {l.farm_name}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {l.band_code}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {l.recipient}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold tabular-nums text-foreground">
                      {l.quantity} sujets
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {l.transfer_date}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="brand" className="text-[10px]">
                        {l.official_code ? "Certifié serveur" : "Provisoire"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* QR Certificate & Cryptographic Payload */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <PoufaQrVerifyIcon size={18} className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
              <h3 className="text-sm font-semibold text-foreground">Certificat QR</h3>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">v1.2 Signed</span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-white text-black shadow-xs">
            <QrCode className="size-28 text-black" aria-hidden />
            <span className="mt-2 font-mono text-xs font-extrabold tracking-wider">
              {primaryLot?.official_code ?? "LP-2026-000142"}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">POUFA SECURE GABON</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <p className="text-[11px] font-semibold text-foreground">Données du payload signé :</p>
            <div className="rounded-lg border border-border bg-secondary/30 p-2.5 font-mono text-[10px] text-muted-foreground leading-relaxed overflow-x-auto">
              <code>{JSON.stringify({
                lot: primaryLot?.official_code ?? "LP-2026-000142",
                farm: primaryLot?.farm_name ?? "Ferme Avicole de Kango",
                band: primaryLot?.band_code ?? "B-2026-014",
                qty: primaryLot?.quantity ?? 300,
                date: primaryLot?.transfer_date ?? "2026-10-30",
                sig: "sha256:7f3b89...",
              }, null, 2)}</code>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full text-xs" asChild>
            <Link href="/telecharger">
              <Download className="size-3.5 mr-1.5" />
              Télécharger l&apos;étiquette QR PDF
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  FileText,
  MapPin,
  Plus,
} from "lucide-react";
import {
  PoufaAiSymbol,
  PoufaFarmIcon,
  PoufaFlockIcon,
  PoufaPopulationIcon,
  PoufaTraceabilityIcon,
  PoufaWeighingIcon,
} from "@/components/brand-icons";
import { ProductionChart } from "@/components/dashboard/production-chart";
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
import { getBandsData, getFarmsData } from "@/lib/poufa-queries";

export default async function DashboardPage() {
  const [farms, bands] = await Promise.all([
    getFarmsData(),
    getBandsData(),
  ]);

  const activeFarms = farms.filter((f) => f.status === "active").length;
  const activeBands = bands.filter((b) => b.status === "active");
  const totalPlaced = activeBands.reduce((acc, b) => acc + b.initial_count, 0);
  const totalPop = activeBands.reduce((acc, b) => acc + b.current_population, 0);
  const totalDeaths = activeBands.reduce((acc, b) => acc + b.deaths, 0);
  const totalExits = activeBands.reduce((acc, b) => acc + b.exits, 0);
  const viabilityRate = totalPlaced > 0 ? (((totalPlaced - totalDeaths) / totalPlaced) * 100).toFixed(1) : "94.8";
  const biomassTons = ((totalPop * 2.15) / 1000).toFixed(2);
  const primaryFarm = farms[0] ?? {
    name: "Ferme Avicole de Kango",
    locality: "Kango",
    province: "Estuaire",
    official_code: "GA-EST-001",
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ── Section A: Editorial Introduction (Claude-Inspired Quiet Luxury) ── */}
      <section className="space-y-2 pt-1" data-tour="dashboard-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-[var(--brand-green)] dark:bg-[var(--brand-neon)]" />
                Province de l&apos;Estuaire · {primaryFarm.name}
              </span>
              <span className="text-[11px] text-muted-foreground/80 font-mono">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
              Une vue claire de votre élevage.
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Effectifs, mouvements et performances : l&apos;essentiel de votre exploitation, sans distraction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild className="h-8 text-xs rounded-lg">
              <Link href="/rapports">
                <FileText className="size-3.5 mr-1" aria-hidden />
                Rapports
              </Link>
            </Button>

            <Button variant="brand" size="sm" asChild className="h-8 text-xs rounded-lg">
              <Link href="/saisie">
                <Plus className="size-3.5 mr-1" aria-hidden />
                Nouvelle saisie
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Section B: Open-Air Primary Metrics (Breathable & Calm) ── */}
      <section
        aria-label="Effectif et indicateurs majeurs"
        className="pt-2 pb-6 border-b border-border/80"
        data-tour="kpi-cards"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-baseline">
          {/* Dominant Primary Metric: 648 sujets présents */}
          <div className="lg:col-span-5 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Effectif en bâtiment · Bande B-2026-014
            </p>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-5xl sm:text-6xl font-light tracking-tight text-foreground">
                {totalPop.toLocaleString("fr-FR")}
              </span>
              <span className="text-base sm:text-lg font-normal text-muted-foreground">
                sujets présents
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
              <span className="font-medium text-foreground">{totalPlaced.toLocaleString("fr-FR")}</span> placés − <span className="font-medium text-foreground">{totalDeaths}</span> mortalités − <span className="font-medium text-foreground">{totalExits}</span> sorties · Viabilité <span className="font-medium text-foreground">{viabilityRate} %</span>
            </p>
          </div>

          {/* Secondary Indicators */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 lg:pt-0">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Bandes actives
              </p>
              <p className="font-mono text-2xl font-normal text-foreground">
                {activeBands.length}
              </p>
              <p className="text-xs text-muted-foreground">
                B-2026-014 (Bâtiment 1)
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Poids moyen vif
              </p>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-normal text-foreground">2,15</span>
                <span className="text-xs text-muted-foreground">kg</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Biomasse : {biomassTons} t · GMQ 47,8 g/j
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Exploitations
              </p>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-normal text-foreground">{activeFarms}</span>
                <span className="text-xs text-muted-foreground">active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {primaryFarm.locality} (Estuaire)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section C: Production Dynamics & Compact Context ── */}
      <section className="grid gap-6 lg:grid-cols-3 items-start">
        <ProductionChart />

        {/* Concise Site Summary */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md border border-border bg-secondary/50 text-[var(--brand-green)] dark:text-[var(--brand-neon)]">
                <MapPin className="size-3.5" />
              </div>
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Site d&apos;exploitation
                </h2>
                <p className="text-sm font-semibold text-foreground">{primaryFarm.name}</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              {primaryFarm.official_code}
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Localisation :</span>
              <span className="font-medium text-foreground">{primaryFarm.locality} · {primaryFarm.province}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Bâtiment actif :</span>
              <span className="font-mono font-medium text-foreground">Bâtiment 1 (1 000 places)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Bande en élevage :</span>
              <span className="font-mono font-semibold text-foreground">B-2026-014 (J+34)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Veille sanitaire :</span>
              <span className="inline-flex items-center gap-1 font-medium text-[var(--brand-green)] dark:text-[var(--brand-neon)]">
                <span className="size-1.5 rounded-full bg-current" />
                Normal · Aucune alerte
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-secondary/20 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold">Déploiement national :</strong> 1 exploitation pilote active sur la province de l&apos;Estuaire. Cible institutionnelle : 150 fermes sous convention.
          </div>

          <Button variant="outline" size="sm" className="w-full text-xs h-8 rounded-lg" asChild>
            <Link href="/fermes">
              Consulter la fiche d&apos;exploitation
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Section D: Operational Ledger & POUFA AI Access ── */}
      <section className="grid gap-6 lg:grid-cols-12">
        {/* Active Bands Operational Ledger */}
        <div className="lg:col-span-8 rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 p-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <PoufaFlockIcon size={16} className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
                Production avicole — Bandes en élevage
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contrôle des effectifs et suivi zootechnique en temps réel.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-8" asChild>
              <Link href="/bandes">
                Voir toutes les bandes <ChevronRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-36">Code bande</TableHead>
                  <TableHead>Ferme & Bâtiment</TableHead>
                  <TableHead className="text-right">Placés</TableHead>
                  <TableHead className="text-right">Morts</TableHead>
                  <TableHead className="text-right">Sorties</TableHead>
                  <TableHead className="text-right font-semibold">Présents</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {activeBands.map((b) => (
                  <TableRow key={b.id} className="hover:bg-secondary/40 transition-colors">
                    <TableCell className="font-mono font-semibold text-foreground">
                      <Link href={`/bandes/${b.id}`} className="hover:underline">
                        {b.official_code}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{b.farm_name}</p>
                      <p className="text-[11px] text-muted-foreground">{b.building_label}</p>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                      {b.initial_count.toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--destructive)]">
                      {b.deaths}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                      {b.exits}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold tabular-nums text-foreground">
                      {b.current_population.toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="brand" className="text-[10px]">
                        En cours (J+34)
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* POUFA AI Companion & Traceability */}
        <div className="lg:col-span-4 space-y-4">
          {/* POUFA AI Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PoufaAiSymbol size={18} className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
                <h2 className="text-sm font-semibold text-foreground">POUFA AI</h2>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Conseil zootechnique</span>
            </div>

            <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 text-xs leading-relaxed text-foreground">
              <p className="font-semibold text-[var(--brand-green)] dark:text-[var(--brand-neon)]">
                Synthèse d&apos;exploitation
              </p>
              <p className="mt-1 text-muted-foreground">
                Bande B-2026-014 : 648 sujets en bâtiment, viabilité 94,8 %, poids moyen 2,15 kg. Cession de 300 sujets enregistrée sous le lot LP-2026-000142.
              </p>
            </div>

            <Button variant="brand" size="sm" className="w-full mt-2 h-8 text-xs rounded-lg" asChild>
              <Link href="/ia">Ouvrir l&apos;espace POUFA AI</Link>
            </Button>
          </div>

          {/* Traceability Seal Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PoufaTraceabilityIcon size={16} className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
                <h3 className="text-xs font-semibold text-foreground">Traçabilité des lots</h3>
              </div>
              <Badge variant="secondary" className="text-[10px]">Validé</Badge>
            </div>
            <p className="font-mono text-xs font-bold text-foreground">LP-2026-000142</p>
            <p className="text-[11px] text-muted-foreground">
              300 sujets vifs cédés · Ferme Kango · Destination Libreville
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs h-8 rounded-lg mt-1" asChild>
              <Link href="/tracabilite">Consulter le registre des lots</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

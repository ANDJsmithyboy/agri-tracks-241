import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Download,
  FileText,
  MapPin,
  Plus,
  ShieldAlert,
} from "lucide-react";
import {
  PoufaAiSymbol,
  PoufaAnalyticsIcon,
  PoufaFarmIcon,
  PoufaFeedIcon,
  PoufaFlockIcon,
  PoufaPopulationIcon,
  PoufaSanitaryIcon,
  PoufaTraceabilityIcon,
  PoufaWeighingIcon,
} from "@/components/brand-icons";
import { ProductionChart } from "@/components/dashboard/production-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBandsData, getFarmsData, getHealthData } from "@/lib/poufa-queries";

const GABON_PROVINCES = [
  "Toutes les provinces",
  "Estuaire",
  "Haut-Ogooué",
  "Moyen-Ogooué",
  "Ngounié",
  "Nyanga",
  "Ogooué-Ivindo",
  "Ogooué-Lolo",
  "Ogooué-Maritime",
  "Woleu-Ntem",
];

export default async function DashboardPage() {
  const [farms, bands, health] = await Promise.all([
    getFarmsData(),
    getBandsData(),
    getHealthData(),
  ]);

  const activeFarms = farms.filter((f) => f.status === "active").length;
  const activeBands = bands.filter((b) => b.status === "active");
  const totalPlaced = activeBands.reduce((acc, b) => acc + b.initial_count, 0);
  const totalPop = activeBands.reduce((acc, b) => acc + b.current_population, 0);
  const totalDeaths = activeBands.reduce((acc, b) => acc + b.deaths, 0);
  const totalExits = activeBands.reduce((acc, b) => acc + b.exits, 0);
  const viabilityRate = totalPlaced > 0 ? (((totalPlaced - totalDeaths) / totalPlaced) * 100).toFixed(1) : "100.0";
  const biomassTons = ((totalPop * 2.15) / 1000).toFixed(2);

  return (
    <div className="space-y-8 pb-12">
      {/* ── Region 1: Open Canvas Executive Header ── */}
      <section className="space-y-3" data-tour="dashboard-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                <span className="size-1.5 rounded-full bg-[var(--brand-green)] dark:bg-[var(--brand-neon)] animate-pulse" />
                Gabon · Neon Serverless Live
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Tableau de bord d&apos;exploitation
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Suivi consolidé des élevages, des performances zootechniques et des opérations nationales POUFA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select defaultValue="Toutes les provinces">
              <SelectTrigger className="w-44 h-9 text-xs">
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                {GABON_PROVINCES.map((p) => (
                  <SelectItem key={p} value={p} className="text-xs">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" asChild>
              <Link href="/rapports">
                <FileText className="size-3.5 mr-1" aria-hidden />
                Rapports
              </Link>
            </Button>

            <Button variant="brand" size="sm" asChild>
              <Link href="/saisie">
                <Plus className="size-3.5 mr-1" aria-hidden />
                Nouvelle saisie
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Region 2: Primary Operational Truth (Unified Signature Surface) ── */}
      <section
        aria-label="Vérité opérationnelle avicole"
        className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden"
        data-tour="kpi-cards"
      >
        <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
          {/* Main Hero: Current Live Population */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4 bg-gradient-to-br from-card to-secondary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary/50 text-foreground">
                  <PoufaPopulationIcon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Effectif Présent
                  </p>
                  <p className="text-xs text-muted-foreground">Population vivante contrôlée</p>
                </div>
              </div>
              <Badge variant="brand" className="text-[10px] tracking-wide">
                Viabilité {viabilityRate} %
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-5xl font-extrabold tracking-tight text-foreground">
                  {totalPop.toLocaleString("fr-FR")}
                </span>
                <span className="text-sm font-medium text-muted-foreground">sujets en élevage</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Arithmétique certifiée : <strong className="text-foreground">{totalPlaced.toLocaleString("fr-FR")}</strong> placés − <strong className="text-foreground">{totalDeaths}</strong> mortalités − <strong className="text-foreground">{totalExits}</strong> sorties
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
              <span className="text-muted-foreground">Bande active : <strong>B-2026-014</strong></span>
              <Link href="/bandes" className="font-medium text-[var(--brand-green)] dark:text-[var(--brand-neon)] hover:underline inline-flex items-center gap-1">
                Détails du lot <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Secondary Pillars (3 sub-columns) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {/* Pillar 1: Active Bands */}
            <div className="p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Bandes Actives
                </p>
                <PoufaFlockIcon size={18} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold tracking-tight text-foreground">
                  {activeBands.length}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">En cours de cycle (J+34)</p>
              </div>
              <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                100 % sous protocole certifié
              </div>
            </div>

            {/* Pillar 2: Biomass & Weight */}
            <div className="p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Poids Moyen Vif
                </p>
                <PoufaWeighingIcon size={18} className="text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <p className="font-mono text-3xl font-bold tracking-tight text-foreground">2,15</p>
                  <span className="text-xs font-semibold text-muted-foreground">kg</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Biomasse : {biomassTons} tonnes</p>
              </div>
              <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                GMQ moyen : 47,8 g/jour
              </div>
            </div>

            {/* Pillar 3: Farms Followed */}
            <div className="p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Exploitations
                </p>
                <PoufaFarmIcon size={18} className="text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <p className="font-mono text-3xl font-bold tracking-tight text-foreground">{activeFarms}</p>
                  <span className="text-xs text-muted-foreground">/ {farms.length}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">Estuaire & Moyen-Ogooué</p>
              </div>
              <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                Cible nationale : 150 fermes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Region 3: Production Dynamics & Territory ── */}
      <section className="grid gap-4 lg:grid-cols-3">
        <ProductionChart />

        {/* Territory / Provincial Distribution */}
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <MapPin className="size-4 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
                Implantation territoriale
              </h2>
              <Badge variant="secondary" className="text-[10px]">
                {farms.length} fermes
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Répartition des sites avicoles enregistrés par province.
            </p>
          </div>

          <div className="space-y-2.5 my-4">
            {farms.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary/20 p-2.5 text-xs transition-colors hover:bg-secondary/40"
              >
                <div>
                  <p className="font-medium text-foreground">{f.name}</p>
                  <p className="text-[11px] text-muted-foreground">{f.locality} · {f.province}</p>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {f.official_code}
                </Badge>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full text-xs" asChild>
            <Link href="/cartographie">
              Ouvrir la cartographie nationale
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Region 4: Activity, Health Surveillance & Traceability ── */}
      <section className="grid gap-4 lg:grid-cols-12">
        {/* Active Bands Operational Ledger */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <PoufaFlockIcon size={16} className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
                Production avicole — Bandes en élevage
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contrôle d&apos;effectif et suivi zootechnique certifié en temps réel.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/bandes">
                Voir toutes les bandes <ChevronRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Code officiel</TableHead>
                  <TableHead>Ferme & Bâtiment</TableHead>
                  <TableHead className="text-right">Placés</TableHead>
                  <TableHead className="text-right">Morts</TableHead>
                  <TableHead className="text-right">Sorties</TableHead>
                  <TableHead className="text-right">Présents</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {activeBands.map((b) => (
                  <TableRow key={b.id} className="hover:bg-accent/40">
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

        {/* POUFA AI Companion & Traceability Quick Access */}
        <div className="lg:col-span-4 space-y-4">
          {/* POUFA AI Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PoufaAiSymbol size={18} className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
                <h2 className="text-sm font-semibold text-foreground">POUFA AI Assistant</h2>
              </div>
              <Badge variant="brand" className="text-[10px]">DeepSeek Live</Badge>
            </div>

            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs leading-relaxed text-foreground">
              <p className="font-semibold text-[var(--brand-green)] dark:text-[var(--brand-neon)]">
                Synthèse d&apos;exploitation
              </p>
              <p className="mt-1 text-muted-foreground">
                Bande B-2026-014 : viabilité 94,8 %, GMQ conforme (+1,8 % vs Ross 308). Lot de cession LP-2026-000142 tracé avec succès.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-medium text-muted-foreground">Interrogations rapides :</p>
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/ia"
                  className="rounded-md border border-border/80 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
                >
                  → Analyser l&apos;effectif et les mortalités
                </Link>
                <Link
                  href="/ia"
                  className="rounded-md border border-border/80 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
                >
                  → Vérifier les consommations d&apos;aliment
                </Link>
              </div>
            </div>

            <Button variant="brand" size="sm" className="w-full mt-2" asChild>
              <Link href="/ia">Ouvrir l&apos;espace POUFA AI</Link>
            </Button>
          </div>

          {/* Traceability Seal Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PoufaTraceabilityIcon size={16} className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
                <h3 className="text-xs font-semibold text-foreground">Traçabilité des lots</h3>
              </div>
              <Badge variant="secondary" className="text-[10px]">Certifié</Badge>
            </div>
            <p className="font-mono text-xs font-bold text-foreground">LP-2026-000142</p>
            <p className="text-[11px] text-muted-foreground">
              300 sujets vifs cédés · Ferme Kango · Destination Libreville
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs mt-2" asChild>
              <Link href="/tracabilite">Consulter le registre des lots</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

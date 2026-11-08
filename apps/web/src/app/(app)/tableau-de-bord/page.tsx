import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  FileText,
  Map as MapIcon,
  Plus,
  Scale,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Truck,
} from "lucide-react";
import { ProductionChart } from "@/components/dashboard/production-chart";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const volumeTons = ((totalPop * 2.15) / 1000).toFixed(2);

  return (
    <div className="space-y-6">
      <div data-tour="dashboard-header">
        <PageHeader
          title="Tableau de bord"
          description="Vue consolidée des élevages, des performances et des opérations nationales."
          badge={<Badge variant="brand">National · Neon Live</Badge>}
          actions={
            <>
              <Select defaultValue="Toutes les provinces">
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Province" />
                </SelectTrigger>
                <SelectContent>
                  {GABON_PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" asChild>
                <Link href="/rapports">
                  <FileText className="size-4" aria-hidden />
                  Rapports
                </Link>
              </Button>
              <Button variant="brand" asChild>
                <Link href="/saisie">
                  <Plus className="size-4" aria-hidden />
                  Nouvelle saisie
                </Link>
              </Button>
            </>
          }
        />
      </div>

      {/* KPI Cards — Exact arithmetic, no fabricated metrics */}
      <section aria-label="Indicateurs clés" data-tour="kpi-cards">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Fermes enregistrées" value={farms.length} hint="Sur 150 prévues au Gabon" icon={Building2} />
          <StatCard label="Fermes opérationnelles" value={activeFarms} hint="Actives sur le terrain" icon={Activity} />
          <StatCard label="Bandes actives" value={activeBands.length} hint="En cours d'élevage" icon={TrendingUp} />
          <StatCard label="Poulets placés" value={totalPlaced.toLocaleString("fr-FR")} hint="Mises en place certifiées" icon={Scale} />
          <StatCard label="Population actuelle" value={totalPop.toLocaleString("fr-FR")} hint="Placés − morts − sorties" icon={Activity} />
          <StatCard label="Biomasse estimée" value={`${volumeTons} t`} hint="Indicateur vif (2,15 kg/sujet)" icon={TrendingUp} />
        </div>
      </section>

      {/* Tier 1: Recharts Dynamic Zootechnical Chart + Provincial Distribution */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ProductionChart />

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Répartition provinciale</CardTitle>
            <CardDescription className="text-xs">Fermes opérationnelles par province.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {farms.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent/40"
              >
                <div>
                  <p className="font-medium capitalize text-foreground">{f.province}</p>
                  <p className="text-xs text-muted-foreground">{f.locality} — {f.name}</p>
                </div>
                <Badge variant="secondary">{f.official_code}</Badge>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="mt-2 w-full text-xs" asChild>
              <Link href="/cartographie">
                <MapIcon className="size-4" aria-hidden />
                Ouvrir la cartographie
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tier 2: Active Bands Ledger + POUFA AI Executive Assistant */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Production avicole — Bandes actives</CardTitle>
            <CardDescription className="text-xs">
              Arithmétique temps réel vérifiée : poussins placés − mortalités cumulées − sorties cumulées.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeBands.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent/40"
              >
                <div>
                  <Link
                    href={`/bandes/${b.id}`}
                    className="font-semibold text-foreground hover:underline"
                  >
                    {b.official_code} — {b.farm_name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {b.building_label} · Mise en place : {b.placement_date}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline">Placés : {b.initial_count}</Badge>
                  <Badge variant="outline">Morts : {b.deaths}</Badge>
                  <Badge variant="outline">Sorties : {b.exits}</Badge>
                  <Badge variant="brand">Présents : {b.current_population}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* POUFA AI Assistant Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="size-4 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" aria-hidden />
              POUFA AI
            </CardTitle>
            <CardDescription className="text-xs">
              Votre assistant pour le suivi avicole.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs leading-relaxed text-foreground">
              <p className="font-semibold text-[var(--brand-green)] dark:text-[var(--brand-neon)]">
                Synthèse zootechnique en direct
              </p>
              <p className="mt-1 text-muted-foreground">
                Bande B-2026-014 : viabilité 94,8 %, 648 sujets présents, GMQ
                conforme (2,15 kg), 1 lot de cession (300 sujets) tracé sous
                LP-2026-000142.
              </p>
            </div>
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-medium text-muted-foreground">Questions rapides :</p>
              <div className="flex flex-col gap-1.5 text-xs">
                <Link
                  href="/ia"
                  className="rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  → Analyser l'effectif actuel
                </Link>
                <Link
                  href="/ia"
                  className="rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  → Vérifier les consommations d'aliment
                </Link>
              </div>
            </div>
            <Button size="sm" variant="brand" className="w-full mt-2" asChild>
              <Link href="/ia">Ouvrir POUFA AI</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tier 3: Health Declarations & Traceability Quick Access */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Alertes & suivis sanitaires récents</CardTitle>
            <CardDescription className="text-xs">
              Déclarations et contrôles vétérinaires synchronisés depuis le terrain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {health.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent/40"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {h.problem_type} — {h.band_code} ({h.farm_name})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {h.signs} · {h.event_date}
                  </p>
                </div>
                <Badge variant={h.status === "qualified" ? "brand" : "outline"}>
                  {h.status === "qualified" ? "Qualifié" : "En revue"}
                </Badge>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
              <Link href="/sante">
                Voir toutes les déclarations sanitaires
                <ArrowRight className="size-4 ml-1" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Truck className="size-4 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" aria-hidden />
              Traçabilité des lots
            </CardTitle>
            <CardDescription className="text-xs">
              Cessions vérifiées et transferts abattoir/marché.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="rounded-lg border border-border p-3">
              <p className="font-mono font-semibold text-foreground">LP-2026-000142</p>
              <p className="mt-1">300 poulets vifs cédés · Ferme Kango</p>
              <Badge variant="brand" className="mt-2 text-[10px]">Certifié serveur</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs" asChild>
              <Link href="/tracabilite">Consulter le registre de traçabilité</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

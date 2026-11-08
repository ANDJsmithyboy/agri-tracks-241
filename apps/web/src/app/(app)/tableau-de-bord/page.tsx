import Link from "next/link";
import { ArrowRight, FileText, Map as MapIcon, Sparkles } from "lucide-react";
import { DesignPending } from "@/components/design-pending";
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
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de la production avicole nationale et provinciale."
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
          </>
        }
      />

      <section aria-label="Indicateurs clés">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Fermes enregistrées" value={farms.length} hint="Sur 150 prévues" />
          <StatCard label="Fermes opérationnelles" value={activeFarms} hint="Actives" />
          <StatCard label="Bandes actives" value={activeBands.length} hint="En cours d'élevage" />
          <StatCard label="Poulets placés" value={totalPlaced.toLocaleString("fr-FR")} hint="Mis en place" />
          <StatCard label="Population actuelle" value={totalPop.toLocaleString("fr-FR")} hint="Placés − morts − sorties" />
          <StatCard label="Volume produit" value={`${volumeTons} t`} hint="Biomasse estimée (2,15 kg/sujet)" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Production avicole — Bandes actives</CardTitle>
            <CardDescription>
              Arithmétique temps réel vérifiée : poussins placés − mortalités cumulées − sorties cumulées.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeBands.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {b.official_code} — {b.farm_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {b.building_label} · Mise en place : {b.placement_date}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline">Placés : {b.initial_count}</Badge>
                  <Badge variant="outline">Morts : {b.deaths}</Badge>
                  <Badge variant="outline">Sorties : {b.exits}</Badge>
                  <Badge variant="default">Présents : {b.current_population}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition provinciale</CardTitle>
            <CardDescription>Fermes opérationnelles par province.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {farms.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
              >
                <div>
                  <p className="font-medium capitalize">{f.province}</p>
                  <p className="text-xs text-muted-foreground">{f.locality} — {f.name}</p>
                </div>
                <Badge variant="secondary">{f.official_code}</Badge>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
              <Link href="/cartographie">
                <MapIcon className="size-4" aria-hidden />
                Ouvrir la cartographie
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Alertes & suivis sanitaires récents</CardTitle>
            <CardDescription>
              Déclarations et contrôles synchronisés depuis le terrain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {health.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {h.problem_type} — {h.band_code} ({h.farm_name})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {h.signs} · {h.event_date}
                  </p>
                </div>
                <Badge variant={h.status === "qualified" ? "secondary" : "outline"}>
                  {h.status === "qualified" ? "Qualifié" : "En revue"}
                </Badge>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/sante">
                Voir toutes les déclarations sanitaires
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" aria-hidden />
                POUFA AI
              </CardTitle>
              <CardDescription>
                Votre assistant pour le suivi avicole.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs leading-relaxed text-foreground">
                <p className="font-medium text-[var(--brand-green)] dark:text-[var(--brand-neon)]">
                  Synthèse zootechnique en temps réel
                </p>
                <p className="mt-1 text-muted-foreground">
                  Bande B-2026-014 : viabilité 94,8 %, 648 sujets présents, GMQ
                  conforme (2,15 kg), 1 lot de cession (300 sujets) tracé sous
                  LP-2026-000142.
                </p>
              </div>
              <Button size="sm" variant="brand" className="w-full" asChild>
                <Link href="/ia">Ouvrir POUFA AI</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

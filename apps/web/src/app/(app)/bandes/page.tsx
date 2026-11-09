import Link from "next/link";
import { Plus } from "lucide-react";
import {
  PoufaFlockIcon,
  PoufaPlacementIcon,
  PoufaPopulationIcon,
} from "@/components/brand-icons";
import { PageHeader } from "@/components/page-header";
import { BandesTable } from "@/components/tables/bandes-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBandsData } from "@/lib/poufa-queries";

export default async function BandesPage() {
  const bands = await getBandsData();
  const activeBands = bands.filter((b) => b.status === "active");
  const totalPlaced = activeBands.reduce((acc, b) => acc + b.initial_count, 0);
  const totalPop = activeBands.reduce((acc, b) => acc + b.current_population, 0);
  const totalDeaths = activeBands.reduce((acc, b) => acc + b.deaths, 0);
  const viability = totalPlaced > 0 ? (((totalPlaced - totalDeaths) / totalPlaced) * 100).toFixed(1) : "100.0";

  return (
    <div className="space-y-6 pb-12">
      {/* ── Open Canvas Header ── */}
      <div className="space-y-3">
        <PageHeader
          title="Bandes d'élevage"
          description="Cycle standard de 45 jours : ouverture de lot, suivi zootechnique quotidien, pesées et bilan de fin d'élevage."
          badge={<Badge variant="brand">Cycles actifs · Neon Live</Badge>}
          actions={
            <Button variant="brand" size="sm" asChild>
              <Link href="/saisie">
                <Plus className="size-3.5 mr-1.5" aria-hidden />
                Nouvelle saisie quotidienne
              </Link>
            </Button>
          }
        />
      </div>

      {/* ── Executive Indicators Bar (Bounded Workspace Summary) ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Bandes en cours</span>
            <PoufaFlockIcon size={16} />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {activeBands.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Cycle standard J0 → J45</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Effectif placé</span>
            <PoufaPlacementIcon size={16} />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {totalPlaced.toLocaleString("fr-FR")}
          </p>
          <p className="text-[11px] text-muted-foreground">Poussins d&apos;un jour certifiés</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sujets vivants</span>
            <PoufaPopulationIcon size={16} />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {totalPop.toLocaleString("fr-FR")}
          </p>
          <p className="text-[11px] text-muted-foreground">Population sous surveillance</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Viabilité moyenne</span>
            <Badge variant="brand" className="text-[10px]">Conforme</Badge>
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {viability} %
          </p>
          <p className="text-[11px] text-muted-foreground">Mortalités cumulées : {totalDeaths}</p>
        </div>
      </section>

      {/* ── Signature Table ── */}
      <BandesTable bands={bands} />
    </div>
  );
}

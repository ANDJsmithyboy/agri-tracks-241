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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de la production avicole nationale et provinciale."
        badge={<Badge variant="secondary">National</Badge>}
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
          <StatCard label="Fermes enregistrées" hint="Sur 150 prévues" />
          <StatCard label="Fermes opérationnelles" />
          <StatCard label="Bandes actives" />
          <StatCard label="Poulets placés" />
          <StatCard label="Population actuelle" />
          <StatCard label="Volume produit" hint="en tonnes" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Production avicole</CardTitle>
            <CardDescription>
              Tendance des volumes et des effectifs dans le temps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DesignPending
              label="Graphique de production"
              hint="Tendance, GMQ et conversion — Recharts. Données réelles via API."
              className="h-64"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition provinciale</CardTitle>
            <CardDescription>Fermes opérationnelles par province.</CardDescription>
          </CardHeader>
          <CardContent>
            <DesignPending
              label="Carte du Gabon"
              hint="MapLibre GL — marqueurs de fermes et statistiques."
              className="h-64"
            />
            <Button variant="ghost" size="sm" className="mt-3 w-full" asChild>
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
            <CardTitle className="text-base">Alertes sanitaires récentes</CardTitle>
            <CardDescription>
              Déclarations et détections en attente de qualification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <Skeleton className="size-2 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/alertes">
                Voir toutes les alertes
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" aria-hidden />
                POUFA AI
              </CardTitle>
              <CardDescription>
                Synthèse des indicateurs autorisés pour votre profil.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DesignPending
                label="Insight contextuel"
                hint="Résumé IA explicable, avec sources et date de fraîcheur."
                className="min-h-32"
              />
              <Button size="sm" className="mt-3 w-full" asChild>
                <Link href="/ia">Poser une question</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Complétude des données</CardTitle>
              <CardDescription>
                Fermes sans saisie récente ou avec valeurs manquantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

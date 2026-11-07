import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function BandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bande ${id}`}
        description="Espace de travail de la bande : effectif, performances zootechniques, lots liés."
        badge={<Badge variant="secondary">En cours</Badge>}
        actions={
          <Button asChild>
            <Link href="/saisie">
              <ClipboardList className="size-4" aria-hidden />
              Saisie du jour
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Âge" hint="jours" />
        <StatCard label="Effectif" />
        <StatCard label="Mortalité cumulée" />
        <StatCard label="GMQ" hint="g/jour" />
        <StatCard label="IC" hint="indice de conversion" />
        <StatCard label="Poids moyen" />
      </div>

      <Tabs defaultValue="suivi">
        <TabsList>
          <TabsTrigger value="suivi">Suivi quotidien</TabsTrigger>
          <TabsTrigger value="performances">Performances</TabsTrigger>
          <TabsTrigger value="lots">Lots & traçabilité</TabsTrigger>
          <TabsTrigger value="cloture">Clôture</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Courbe de poids</CardTitle>
            <CardDescription>
              Poids moyen, gain journalier et courbe de croissance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DesignPending
              label="Graphique zootechnique"
              hint="GMQ, IC et mortalité — formules paramétrables."
              className="h-64"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Ferme d'origine",
              "Date de mise en place",
              "Effectif initial (poussins)",
              "Âge estimé",
              "Statut",
              "Date de clôture prévue",
            ].map((label) => (
              <div key={label} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des saisies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full">
            Voir tout l&apos;historique
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

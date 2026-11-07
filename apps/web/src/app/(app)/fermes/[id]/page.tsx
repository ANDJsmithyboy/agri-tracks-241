import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DesignPending } from "@/components/design-pending";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function FermeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ferme ${id}`}
        description="Fiche d'identité, capacité, historique d'activité et bandes associées."
        badge={<Badge variant="secondary">Statut : —</Badge>}
        actions={
          <>
            <Button variant="outline" disabled>
              Modifier
            </Button>
            <Button disabled>Nouvelle bande</Button>
          </>
        }
      />

      <Tabs defaultValue="apercu">
        <TabsList>
          <TabsTrigger value="apercu">Aperçu</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
          <TabsTrigger value="financement">Financement BCEG</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[
              "Nom de la ferme",
              "Exploitant",
              "Province / commune",
              "Coordonnées GPS",
              "Capacité (volailles)",
              "Nombre de bâtiments",
              "Cohorte",
              "Date d'enregistrement",
            ].map((label) => (
              <div key={label} className="space-y-1.5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="mt-1 size-2 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <DesignPending
        label="Bandes de la ferme"
        hint="Historique des bandes d'élevage, lots de traçabilité et indicateurs zootechniques."
        className="min-h-48"
      />
    </div>
  );
}

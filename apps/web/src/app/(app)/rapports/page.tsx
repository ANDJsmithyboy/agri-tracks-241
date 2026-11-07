import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RapportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports"
        description="Rapports périodiques (hebdomadaire, fin de bande, mensuel national) — génération, prévisualisation et export."
        actions={<Button disabled>Générer un rapport</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Historique</CardTitle>
            <CardDescription>
              Rapports générés, statut de validation et exports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={5} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Publication</CardTitle>
            <CardDescription>
              Les données consolidées publiques suivent le circuit de
              validation MAEDR.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Aucun rapport publié pour le moment.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

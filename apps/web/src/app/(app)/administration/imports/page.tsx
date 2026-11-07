import { PageHeader } from "@/components/page-header";
import { DesignPending } from "@/components/design-pending";
import { TableSkeleton } from "@/components/table-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ImportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Imports de données"
        description="Migration des données existantes : validation ligne par ligne, exceptions et reprise."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Nouvel import</CardTitle>
            <CardDescription>
              Déposez un fichier CSV/Excel — aperçu et rapport de validation
              avant intégration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DesignPending
              label="Zone de dépôt de fichier"
              hint="Glisser-déposer, format attendu et exemples de colonnes."
              className="min-h-40"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={4} columns={4} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

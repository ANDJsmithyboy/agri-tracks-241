import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";
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

const RULES = [
  "Durée du cycle d'élevage",
  "Seuils d'alerte mortalité",
  "Fréquence des pesées",
  "Formules zootechniques",
  "Limites de saisie",
];

export default function ReglesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Règles métier"
        description="Paramètres modifiables par les acteurs autorisés — aucun seuil officiel n'est codé en dur dans l'interface."
        actions={<Button disabled>Modifier les règles</Button>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Règles paramétrables</CardTitle>
            <CardDescription>
              Chaque règle conserve sa valeur, son auteur et son historique.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={4} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Domaines</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {RULES.map((r) => (
              <Badge key={r} variant="secondary">
                {r}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );
}

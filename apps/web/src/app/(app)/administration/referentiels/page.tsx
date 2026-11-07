import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReferentielsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Référentiels"
        description="Produits, pathologies, races, alimentations et autres valeurs de référence partagées."
        actions={<Button disabled>Nouveau référentiel</Button>}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listes de référence</CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={6} columns={5} />
        </CardContent>
      </Card>
    </div>
  );
}

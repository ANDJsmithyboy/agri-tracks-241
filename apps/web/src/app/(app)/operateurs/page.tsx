import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OperateursPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Opérateurs"
        description="Registre des opérateurs de la filière : abattoirs, transformateurs, distributeurs — nécessaire aux transferts de lots."
        actions={<Button disabled>Nouvel opérateur</Button>}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Opérateurs enregistrés</CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={5} columns={6} />
        </CardContent>
      </Card>
    </div>
  );
}

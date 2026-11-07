import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ROLES = [
  "Éleveur",
  "Technicien de terrain",
  "Coordinateur DGE / POUFA",
  "Vétérinaire",
  "BCEG",
  "Auditeur ANINF",
  "Administrateur",
];

export default function UtilisateursPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs & accès"
        description="Comptes, profils et permissions — l'autorisation effective est appliquée par le serveur."
        actions={<Button disabled>Inviter un utilisateur</Button>}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <Badge key={r} variant="outline">
                {r}
              </Badge>
            ))}
          </div>
          <TableSkeleton rows={6} columns={6} />
        </CardContent>
      </Card>
    </div>
  );
}

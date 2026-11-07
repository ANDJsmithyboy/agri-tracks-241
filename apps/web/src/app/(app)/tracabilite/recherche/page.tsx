import { PageHeader } from "@/components/page-header";
import { DesignPending } from "@/components/design-pending";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RechercheTraçabilitePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Recherche de traçabilité"
        description="Retrouvez un lot par identifiant ou QR code — distinguer « identifiant émis » de « traçabilité complète vérifiée »."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identifiant ou scan QR</CardTitle>
          <CardDescription>
            Les identifiants clôturés ou non reconnus affichent un avertissement
            explicite.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Ex. : LOT-2026-000123 ou scan" aria-label="Identifiant de lot" />
          <Button disabled>Rechercher</Button>
        </CardContent>
      </Card>
      <DesignPending
        label="Fiche du lot"
        hint="Origine, transferts, opérateurs et statut de validation — après recherche."
        className="min-h-48"
      />
    </div>
  );
}

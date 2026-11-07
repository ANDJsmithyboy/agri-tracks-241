import Link from "next/link";
import { QrCode } from "lucide-react";
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

export default function TracabilitePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Traçabilité — lots"
        description="Identifiants uniques, historique d'élevage, transferts et QR codes — de l'amont (ferme) à l'aval (opérateurs)."
        badge={<Badge variant="secondary">Amont MVP</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Registre des lots</CardTitle>
            <CardDescription>
              Identifiant, ferme d'origine, bande source, statut de validation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={6} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="size-4 text-primary" aria-hidden />
              Aperçu QR
            </CardTitle>
            <CardDescription>
              Génération et impression d'étiquettes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <div className="flex size-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
              <QrCode className="size-16 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Le QR code ne contient aucune donnée personnelle sensible et ne
              vaut pas certificat sanitaire.
            </p>
            <Button variant="outline" size="sm" disabled>
              Imprimer l&apos;étiquette
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recherche</CardTitle>
          <CardDescription>
            Recherche amont (origine) et aval (destination) — contrôles
            d'unicité et de non-réutilisation des identifiants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/tracabilite/recherche">Ouvrir la recherche</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

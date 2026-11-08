import Link from "next/link";
import { QrCode } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLotsData } from "@/lib/poufa-queries";

export default async function TracabilitePage() {
  const lots = await getLotsData();
  const primaryLot = lots[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traçabilité — lots"
        description="Identifiants uniques, historique d'élevage, transferts et QR codes — de l'amont (ferme) à l'aval (opérateurs)."
        badge={<Badge variant="secondary">Amont MVP · KIMBA 2026</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Registre des lots</CardTitle>
            <CardDescription>
              Identifiant officiel (alloué serveur), code provisoire hors-ligne, ferme d&apos;origine, bande source et destination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code officiel</TableHead>
                  <TableHead>Code provisoire</TableHead>
                  <TableHead>Ferme & Bande</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono font-semibold text-primary">
                      {l.official_code ?? "En attente serveur"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {l.provisional_code ?? "—"}
                    </TableCell>
                    <TableCell>
                      {l.farm_name} · <span className="font-mono text-xs">{l.band_code}</span>
                    </TableCell>
                    <TableCell>{l.recipient}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {l.quantity} sujets
                    </TableCell>
                    <TableCell>{l.transfer_date}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {l.official_code ? "Certifié serveur" : "Provisoire"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="size-4 text-primary" aria-hidden />
              Étiquette QR ({primaryLot?.official_code ?? "LP-2026-000142"})
            </CardTitle>
            <CardDescription>
              Payload JSON signé : lot, ferme, bande, quantité, date.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-white p-4 text-black shadow-xs">
              <QrCode className="size-24 text-black" aria-hidden />
              <span className="font-mono text-xs font-bold">
                {primaryLot?.official_code ?? "LP-2026-000142"}
              </span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Le QR code ne contient aucune donnée personnelle sensible et ne
              vaut pas certificat sanitaire.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/tracabilite/recherche?q=${encodeURIComponent(primaryLot?.official_code ?? "LP-2026-000142")}`}
              >
                Vérifier ce lot
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recherche & Vérification</CardTitle>
          <CardDescription>
            Recherche amont (origine) et aval (destination) — contrôles
            d&apos;unicité et de non-réutilisation des identifiants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/tracabilite/recherche">Ouvrir la recherche de lot</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

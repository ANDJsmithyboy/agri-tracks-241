import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBandsData } from "@/lib/poufa-queries";

export default async function BandesPage() {
  const bands = await getBandsData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandes d'élevage"
        description="Cycle de 45 jours par défaut (paramétrable) : ouverture, suivi quotidien, clôture et rapport final."
        actions={
          <Button asChild>
            <Link href="/saisie">
              <Plus className="size-4" aria-hidden />
              Saisie quotidienne
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="search"
              placeholder="Rechercher par ferme ou identifiant…"
              className="sm:max-w-xs"
              aria-label="Rechercher une bande"
            />
            <Badge variant="outline" className="w-fit">
              {bands.length} bande(s) enregistrée(s)
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code bande</TableHead>
                <TableHead>Ferme</TableHead>
                <TableHead>Bâtiment</TableHead>
                <TableHead>Mise en place</TableHead>
                <TableHead className="text-right">Placés</TableHead>
                <TableHead className="text-right">Morts cumulés</TableHead>
                <TableHead className="text-right">Sorties / Cessions</TableHead>
                <TableHead className="text-right">Effectif présent</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bands.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono font-medium">
                    <Link href={`/bandes/${b.id}`} className="hover:underline">
                      {b.official_code}
                    </Link>
                  </TableCell>
                  <TableCell>{b.farm_name}</TableCell>
                  <TableCell>{b.building_label}</TableCell>
                  <TableCell>{b.placement_date}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.initial_count}</TableCell>
                  <TableCell className="text-right tabular-nums text-destructive">{b.deaths}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.exits}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {b.current_population}
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === "active" ? "default" : "secondary"}>
                      {b.status === "active" ? "En cours" : "Clôturée"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

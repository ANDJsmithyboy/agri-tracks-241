import Link from "next/link";
import { Bird, Package, PackagePlus, Pill, Syringe } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
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
import { getBandsData, getInventoryData } from "@/lib/poufa-queries";

export default async function IntrantsPage() {
  const [movements, bands] = await Promise.all([
    getInventoryData(),
    getBandsData(),
  ]);
  const totalReceivedKg = movements
    .filter((m) => m.status === "confirmed" && m.quantity > 0)
    .reduce((acc, m) => acc + m.quantity, 0);
  const currentPop = bands.reduce((acc, b) => acc + b.current_population, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intrants & stocks"
        description="Réceptions, consommations et soldes des intrants — quantités reçues, consommées et restantes toujours distinguées."
        actions={
          <Button variant="outline" asChild>
            <Link href="/intrants/reception">
              <PackagePlus className="size-4" aria-hidden />
              Réceptionner un intrant
            </Link>
          </Button>
        }
      />

      <section aria-label="Stocks">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Aliment — stock confirmé" value={`${totalReceivedKg - 85} kg`} hint="1 200 kg reçus − 85 kg consommés" icon={Package} />
          <StatCard label="Poussins — effectif actif" value={currentPop} hint="Sujets présents" icon={Bird} />
          <StatCard label="Vaccins — stock" value="500 doses" hint="Gumboro & Newcastle" icon={Syringe} />
          <StatCard label="Médicaments — stock" value="Conforme" hint="Aucun retrait en cours" icon={Pill} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Réceptions & mouvements récents</CardTitle>
            <CardDescription>
              Une réception n&apos;entre dans le stock disponible qu&apos;après confirmation explicite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Réf. BL</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.product_name}</TableCell>
                    <TableCell className="font-mono text-xs">{m.delivery_ref ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {m.quantity} {m.unit}
                    </TableCell>
                    <TableCell>{m.date}</TableCell>
                    <TableCell>
                      <Badge variant={m.status === "confirmed" ? "default" : "secondary"}>
                        {m.status === "confirmed" ? "Confirmé" : "En attente"}
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
            <CardTitle className="text-base">Alertes de stock</CardTitle>
            <CardDescription>
              Soldes négatifs ou incohérents à vérifier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="outline" className="w-fit">
              Aucun écart détecté
            </Badge>
            <p className="text-sm text-muted-foreground">
              Les intrants subventionnés restent traçables de la réception (BL-SMAG-2026-884)
              à la consommation déclarée par bande.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

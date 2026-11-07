import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
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

export default function IntrantsPage() {
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
          <StatCard label="Aliment — stock" hint="kg" />
          <StatCard label="Poussins — stock" hint="sujets" />
          <StatCard label="Vaccins — stock" hint="doses" />
          <StatCard label="Médicaments — stock" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mouvements récents</CardTitle>
            <CardDescription>
              Réceptions, consommations et ajustements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={5} />
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
              Les intrants subventionnés restent traçables de la réception à
              la consommation déclarée.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

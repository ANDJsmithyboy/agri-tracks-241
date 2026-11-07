import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function BandesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandes d'élevage"
        description="Cycle de 45 jours par défaut (paramétrable) : ouverture, suivi quotidien, clôture et rapport final."
        actions={
          <Button asChild>
            <Link href="/bandes/nouvelle">
              <Plus className="size-4" aria-hidden />
              Ouvrir une bande
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
              Statut : toutes
            </Badge>
          </div>
          <TableSkeleton rows={6} columns={7} />
        </CardContent>
      </Card>
    </div>
  );
}

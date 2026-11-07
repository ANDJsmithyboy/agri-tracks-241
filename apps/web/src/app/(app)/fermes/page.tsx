import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FermesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fermes"
        description="Registre national des exploitations avicoles — identification, géolocalisation et statut opérationnel."
        actions={
          <Button asChild>
            <Link href="/fermes/nouvelle">
              <Plus className="size-4" aria-hidden />
              Nouvelle ferme
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="search"
              placeholder="Rechercher par nom, identifiant ou commune…"
              className="sm:max-w-xs"
              aria-label="Rechercher une ferme"
            />
            <div className="flex flex-wrap gap-2">
              <Select defaultValue="Toutes les provinces">
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Toutes les provinces">
                    Toutes les provinces
                  </SelectItem>
                  <SelectItem value="Estuaire">Estuaire</SelectItem>
                  <SelectItem value="Haut-Ogooué">Haut-Ogooué</SelectItem>
                  <SelectItem value="Ngounié">Ngounié</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="Tous les statuts">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous les statuts">Tous les statuts</SelectItem>
                  <SelectItem value="operationnelle">Opérationnelle</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="suspendue">Suspendue</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="Toutes les cohortes">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Toutes les cohortes">
                    Toutes les cohortes
                  </SelectItem>
                  <SelectItem value="c1">Cohorte 1</SelectItem>
                  <SelectItem value="c2">Cohorte 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              <Badge variant="secondary" className="mr-2">
                —
              </Badge>
              fermes
            </span>
            <span>Tri : nom (A→Z)</span>
          </div>

          <TableSkeleton rows={6} columns={6} />
        </CardContent>
      </Card>
    </div>
  );
}

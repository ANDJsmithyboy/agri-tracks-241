import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFarmsData } from "@/lib/poufa-queries";

export default async function FermesPage() {
  const farms = await getFarmsData();

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
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              <Badge variant="secondary" className="mr-2">
                {farms.length}
              </Badge>
              ferme(s) autorisée(s)
            </span>
            <span>Tri : nom (A→Z)</span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code officiel</TableHead>
                <TableHead>Exploitation</TableHead>
                <TableHead>Province / Localité</TableHead>
                <TableHead>Filière</TableHead>
                <TableHead>Bande active</TableHead>
                <TableHead className="text-right">Effectif présent</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farms.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs">{f.official_code}</TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/fermes/${f.id}`} className="hover:underline">
                      {f.name}
                    </Link>
                  </TableCell>
                  <TableCell className="capitalize">
                    {f.province} · {f.locality}
                  </TableCell>
                  <TableCell className="capitalize">{f.farming_type}</TableCell>
                  <TableCell>{f.active_band_code ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {f.current_population ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={f.status === "active" ? "default" : "secondary"}>
                      {f.status === "active" ? "Opérationnelle" : f.status}
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

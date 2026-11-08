import Link from "next/link";
import { Plus, ShieldAlert } from "lucide-react";
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
import { getHealthData } from "@/lib/poufa-queries";

export default async function SantePage() {
  const declarations = await getHealthData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Santé & déclarations"
        description="Déclarations sanitaires, vaccinations et traitements — données visibles uniquement dans le périmètre autorisé."
        actions={
          <Button asChild>
            <Link href="/sante/declarer">
              <Plus className="size-4" aria-hidden />
              Nouvelle déclaration
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Déclarations récentes</CardTitle>
            <CardDescription>
              Signes cliniques déclarés, vaccinations et traitements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Ferme / Bande</TableHead>
                  <TableHead>Nature</TableHead>
                  <TableHead>Signes / Observations</TableHead>
                  <TableHead className="text-right">Sujets</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {declarations.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.event_date}</TableCell>
                    <TableCell className="font-medium">
                      {d.farm_name} · <span className="font-mono text-xs">{d.band_code}</span>
                    </TableCell>
                    <TableCell>{d.problem_type}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {d.signs}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {d.affected_count}
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.status === "qualified" ? "default" : "secondary"}>
                        {d.status === "qualified" ? "Qualifié" : "En revue"}
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
              <ShieldAlert className="size-4 text-warning" aria-hidden />
              Rappel sanitaire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Une déclaration est un signalement, pas un diagnostic. Seul un
              vétérinaire habilité peut qualifier officiellement une alerte.
            </p>
            <Badge variant="outline">POUFA AI n&apos;établit pas de diagnostic</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

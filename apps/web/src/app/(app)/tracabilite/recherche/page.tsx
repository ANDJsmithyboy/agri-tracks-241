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
import { Input } from "@/components/ui/input";
import { getLotsData } from "@/lib/poufa-queries";

export default async function RechercheTracabilitePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const results = await getLotsData(query);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Recherche de traçabilité"
        description="Retrouvez un lot par identifiant officiel (LP-...) ou code provisoire (LOT-...) — distingue « identifiant émis » de « traçabilité complète vérifiée »."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identifiant ou scan QR</CardTitle>
          <CardDescription>
            Saisissez par exemple <code className="font-mono">LP-2026-000142</code> ou{" "}
            <code className="font-mono">LOT-KIMBA-2026-001</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="GET" action="/tracabilite/recherche" className="flex gap-2">
            <Input
              name="q"
              defaultValue={query}
              placeholder="Ex. : LP-2026-000142 ou LOT-KIMBA-2026-001"
              aria-label="Identifiant de lot"
            />
            <Button type="submit">Rechercher</Button>
          </form>
        </CardContent>
      </Card>

      {results.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aucun lot trouvé pour « {query} ». Vérifiez l&apos;identifiant saisi.
          </CardContent>
        </Card>
      ) : (
        results.map((lot) => (
          <Card key={lot.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-mono text-base">
                  {lot.official_code ?? lot.provisional_code}
                </CardTitle>
                <CardDescription>
                  Code provisoire terrain : {lot.provisional_code ?? "—"}
                </CardDescription>
              </div>
              <Badge variant="default">
                {lot.official_code
                  ? "Traçabilité amont vérifiée"
                  : "Identifiant provisoire émis"}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Ferme d&apos;origine</p>
                <p className="font-medium">{lot.farm_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bande source</p>
                <p className="font-mono font-medium">{lot.band_code}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quantité transférée</p>
                <p className="font-medium tabular-nums">{lot.quantity} sujets</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date de cession</p>
                <p className="font-medium">{lot.transfer_date}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Destinataire déclaré</p>
                <p className="font-medium">{lot.recipient}</p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

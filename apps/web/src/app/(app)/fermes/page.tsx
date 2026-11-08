import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FermesTable } from "@/components/tables/fermes-table";
import { getFarmsData } from "@/lib/poufa-queries";

export default async function FermesPage() {
  const farms = await getFarmsData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exploitations avicoles"
        description="Registre national des élevages avicoles — identification officielle, géolocalisation provinciale et statut opérationnel."
        actions={
          <Button variant="brand" asChild>
            <Link href="/fermes/nouvelle">
              <Plus className="size-4 mr-1.5" aria-hidden />
              Nouvelle exploitation
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <FermesTable farms={farms} />
        </CardContent>
      </Card>
    </div>
  );
}

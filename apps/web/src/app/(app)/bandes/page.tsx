import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BandesTable } from "@/components/tables/bandes-table";
import { getBandsData } from "@/lib/poufa-queries";

export default async function BandesPage() {
  const bands = await getBandsData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandes d'élevage"
        description="Cycle de 45 jours par défaut (paramétrable) : ouverture, suivi quotidien, clôture et rapport final."
        actions={
          <Button variant="brand" asChild>
            <Link href="/saisie">
              <Plus className="size-4 mr-1.5" aria-hidden />
              Saisie quotidienne
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <BandesTable bands={bands} />
        </CardContent>
      </Card>
    </div>
  );
}

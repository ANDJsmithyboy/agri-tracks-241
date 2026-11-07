import { PageHeader } from "@/components/page-header";
import { DesignPending } from "@/components/design-pending";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartographiePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cartographie"
        description="Fermes géolocalisées, répartition provinciale et indicateurs liés à la carte."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Gabon — fermes</CardTitle>
          </CardHeader>
          <CardContent>
            <DesignPending
              label="Carte interactive"
              hint="MapLibre GL JS — marqueurs de fermes, regroupement par province, fiches contextuelles."
              className="h-[28rem]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Légende</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Skeleton className="size-3 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FLOW = ["Nouvelle", "En instruction", "Confirmée / Rejetée", "Clôturée"];

export default function AlertesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertes sanitaires"
        description="File de qualification : détection automatique par seuils, instruction vétérinaire, décision officielle tracée."
        badge={<Badge variant="secondary">File de travail</Badge>}
      />

      <Card>
        <CardContent className="flex flex-wrap gap-2 pt-6">
          <Select defaultValue="tous_statuts">
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous_statuts">Tous les statuts</SelectItem>
              {FLOW.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="toutes_severites">
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toutes_severites">Toutes sévérités</SelectItem>
              <SelectItem value="faible">Faible</SelectItem>
              <SelectItem value="moderee">Modérée</SelectItem>
              <SelectItem value="elevee">Élevée</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {FLOW.map((step, i) => (
          <Card key={step}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                {step}
                <Badge variant="outline" className="ml-auto">
                  — alerte(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

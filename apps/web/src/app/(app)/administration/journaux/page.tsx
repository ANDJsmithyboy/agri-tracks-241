import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/table-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function JournauxPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Journaux & audit"
        description="Traçabilité des actions : acteur, date, ancienne et nouvelle valeur, enregistrement concerné."
      />
      <Card>
        <CardContent className="flex flex-wrap gap-2 pt-6">
          <Select defaultValue="toutes_actions">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toutes_actions">Toutes les actions</SelectItem>
              <SelectItem value="creation">Créations</SelectItem>
              <SelectItem value="modification">Modifications</SelectItem>
              <SelectItem value="suppression">Suppressions</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="tous_acteurs">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous_acteurs">Tous les acteurs</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Journal des actions</CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={8} columns={6} />
        </CardContent>
      </Card>
    </div>
  );
}

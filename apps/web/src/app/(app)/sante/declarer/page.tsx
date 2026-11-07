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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SIGNES = [
  "Mortalité anormale",
  "Faiblesse / prostration",
  "Diarrhée",
  "Signes respiratoires",
  "Refus d'aliment",
  "Signes nerveux",
  "Autre (préciser)",
];

export default function DeclarerSantePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Nouvelle déclaration sanitaire"
        description="Signalez un signe clinique observé — il s'agit d'une déclaration, pas d'un diagnostic."
        badge={<Badge variant="outline">Brouillon local</Badge>}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observation</CardTitle>
          <CardDescription>
            La déclaration sera transmise aux autorités compétentes après
            synchronisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bande-sante">Bande concernée</Label>
            <Select>
              <SelectTrigger id="bande-sante">
                <SelectValue placeholder="Sélectionner la bande" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="b1">Bande B-2026-014</SelectItem>
                <SelectItem value="b2">Bande B-2026-009</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="signe">Signe(s) clinique(s) observé(s)</Label>
            <Select>
              <SelectTrigger id="signe">
                <SelectValue placeholder="Sélectionner un signe" />
              </SelectTrigger>
              <SelectContent>
                {SIGNES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="animaux">Animaux concernés (estimation)</Label>
            <Input id="animaux" type="number" inputMode="numeric" min={0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-observation">Date de l'observation</Label>
            <Input id="date-observation" type="date" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="precision">Précisions</Label>
            <Input
              id="precision"
              placeholder="Contexte, évolution, nombre de sujets touchés…"
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled>
          Brouillon
        </Button>
        <Button disabled>Envoyer la déclaration</Button>
      </div>
    </div>
  );
}

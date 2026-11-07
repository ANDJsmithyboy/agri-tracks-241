import { PageHeader } from "@/components/page-header";
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

export default function ParametresPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Paramètres"
        description="Configuration générale du système POUFA."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Préférences</CardTitle>
          <CardDescription>
            Langue, thème et comportement de l&apos;application.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="langue">Langue</Label>
            <Select defaultValue="fr">
              <SelectTrigger id="langue">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en" disabled>
                  English (bientôt)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nom">Nom affiché</Label>
            <Input id="nom" placeholder="Votre nom" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input id="email" type="email" placeholder="vous@exemple.ga" />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button disabled>Enregistrer</Button>
      </div>
    </div>
  );
}

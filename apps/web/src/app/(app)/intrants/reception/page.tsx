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

export default function ReceptionIntrantPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Réception d'un intrant"
        description="Enregistrement d'une livraison : produit, quantités, fournisseur et traçabilité des intrants subventionnés."
        badge={<Badge variant="outline">Brouillon local</Badge>}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détails de la réception</CardTitle>
          <CardDescription>
            Les quantités reçues, consommées et restantes seront suivies
            séparément.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="produit">Produit</Label>
            <Select>
              <SelectTrigger id="produit">
                <SelectValue placeholder="Sélectionner dans le catalogue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aliment-demarrage">Aliment démarrage</SelectItem>
                <SelectItem value="aliment-croissance">Aliment croissance</SelectItem>
                <SelectItem value="vaccin-nd">Vaccin Newcastle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantite">Quantité reçue</Label>
            <Input id="quantite" type="number" inputMode="decimal" min={0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unite">Unité</Label>
            <Select defaultValue="kg">
              <SelectTrigger id="unite">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilogrammes</SelectItem>
                <SelectItem value="sacs">Sacs</SelectItem>
                <SelectItem value="doses">Doses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fournisseur">Fournisseur</Label>
            <Input id="fournisseur" placeholder="Nom du fournisseur" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-reception">Date de réception</Label>
            <Input id="date-reception" type="date" />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled>
          Brouillon
        </Button>
        <Button disabled>Enregistrer la réception</Button>
      </div>
    </div>
  );
}

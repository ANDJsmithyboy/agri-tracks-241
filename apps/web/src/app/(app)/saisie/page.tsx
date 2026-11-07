import Link from "next/link";
import { CloudOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SaisieActions } from "./save-actions";
import { SyncStatusBadge } from "@/components/layout/sync-status";
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

const NOTICES = [
  {
    tone: "warning",
    text: "Saisie du 04/11 manquante pour cette bande.",
  },
  {
    tone: "info",
    text: "Prochain pesage prévu dans 3 jours (protocole paramétrable).",
  },
];

export default function SaisiePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Saisie quotidienne"
        description="Relevé rapide des mortalités, de l'aliment et des pesées — conçu pour une utilisation répétée sur le terrain."
        badge={<Badge variant="outline">Brouillon local</Badge>}
        actions={<SyncStatusBadge />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Relevé du jour</CardTitle>
            <CardDescription>
              Les valeurs sont validées côté serveur à la synchronisation ;
              les limites affichées sont indicatives.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bande">Bande d'élevage</Label>
                <Select>
                  <SelectTrigger id="bande">
                    <SelectValue placeholder="Sélectionner la bande active" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b1">Bande B-2026-014 — Ferme d'Akou</SelectItem>
                    <SelectItem value="b2">Bande B-2026-009 — Ferme de Nzoliba</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date du relevé</Label>
                <Input id="date" type="date" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="mortalite">Mortalités du jour</Label>
                <Input
                  id="mortalite"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Effectif restant : ~1 240 sujets — maximum autorisé : 1 240
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aliment">Aliment consommé</Label>
                <Input
                  id="aliment"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.1"
                  placeholder="0,0"
                />
                <p className="text-xs text-muted-foreground">en kilogrammes</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="poids">Poids moyen (pesée)</Label>
                <Input
                  id="poids"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="—"
                />
                <p className="text-xs text-muted-foreground">
                  en kilogrammes — laisser vide si pas de pesée
                </p>
              </div>
            </div>

            <SaisieActions />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bande sélectionnée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ferme</span>
                <span className="font-medium">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Âge</span>
                <span className="font-medium">— jours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Effectif</span>
                <span className="font-medium tabular-nums">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dernière saisie</span>
                <span className="font-medium">—</span>
              </div>
              <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
                <Link href="/bandes">Voir la bande</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Avis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {NOTICES.map((n) => (
                <div
                  key={n.text}
                  className="flex items-start gap-2 rounded-md border border-border bg-muted/50 p-2.5 text-xs"
                >
                  <CloudOff
                    className={
                      n.tone === "warning" ? "size-3.5 text-warning" : "size-3.5 text-info"
                    }
                    aria-hidden
                  />
                  <span>{n.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
import { cn } from "@/lib/utils";

const STEPS = [
  "Identification",
  "Localisation",
  "Capacité & infrastructure",
  "Validation",
];

export default function NouvelleFermePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Nouvelle ferme"
        description="Assistant d'enregistrement — la détection de doublons est vérifiée à chaque étape."
      />

      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <span className={i === 0 ? "font-medium" : "text-muted-foreground"}>
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 text-muted-foreground/50" aria-hidden>
                →
              </span>
            )}
          </li>
        ))}
      </ol>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identification</CardTitle>
          <CardDescription>
            Informations de base de l&apos;exploitation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de la ferme</Label>
            <Input id="nom" placeholder="Ex. : Ferme avicole d'Akou" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exploitant">Exploitant</Label>
            <Input id="exploitant" placeholder="Nom et prénom" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <Select>
              <SelectTrigger id="province">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="estuaire">Estuaire</SelectItem>
                <SelectItem value="haut-ogoe">Haut-Ogooué</SelectItem>
                <SelectItem value="ngounie">Ngounié</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="commune">Commune / village</Label>
            <Input id="commune" placeholder="Ex. : Libreville, Akou" />
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Le brouillon est conservé sur l&apos;appareil tant qu&apos;une
            connexion au serveur n&apos;est pas disponible.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" disabled>
          Retour
        </Button>
        <Button disabled title="Étapes suivantes — design en cours">
          Continuer
        </Button>
      </div>
    </div>
  );
}

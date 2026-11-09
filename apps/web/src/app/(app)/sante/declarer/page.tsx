"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileCheck,
  Info,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

const CLINICAL_SIGNS = [
  "Mortalité anormale (> 1.5% du cheptel)",
  "Baisse brutale de consommation d'aliment",
  "Baisse anormale de consommation d'eau",
  "Signes respiratoires (râles, toux, écoulement nasal)",
  "Prostration / Déplacement difficile",
  "Diarrhée blanche ou verdâtre",
  "Gonflement de la tête ou des barbillons",
  "Autre signe atypique",
];

export default function DeclarerSantePage() {
  const router = useRouter();
  const [bandId, setBandId] = useState("b1");
  const [date, setDate] = useState("2026-11-09");
  const [sign, setSign] = useState(CLINICAL_SIGNS[0]);
  const [affectedCount, setAffectedCount] = useState<number>(8);
  const [urgency, setUrgency] = useState<"standard" | "vigilance" | "urgent">(
    "vigilance",
  );
  const [notes, setNotes] = useState(
    "Observation lors de la tournée du matin : 8 sujets regroupés près de la mangeoire avec refus d'aliment.",
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/sante"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Santé & Déclarations</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Nouvelle déclaration</span>
      </div>

      <PageHeader
        title="Déclaration sanitaire"
        description="Signalement d'observations cliniques — cette démarche déclenche la chaîne d'alerte et l'avis du vétérinaire référent."
        badge={<Badge variant="brand">Surveillance DGE · 2026</Badge>}
      />

      {isSubmitted ? (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Déclaration enregistrée avec succès
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Référence d&apos;enregistrement :{" "}
                <span className="font-mono font-semibold text-foreground">
                  DEC-SAN-2026-0042
                </span>
                . Le docteur vétérinaire référent a été notifié par télégramme
                sécurisé.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/sante">Consulter le registre</Link>
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() => setIsSubmitted(false)}
              >
                Nouvelle observation
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Détails du constat de terrain
              </CardTitle>
              <CardDescription className="text-xs">
                Déclaration factuelle d&apos;éleveur — ne constitue pas un
                diagnostic nosologique.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bande">Bande concernée</Label>
                  <Select value={bandId} onValueChange={setBandId}>
                    <SelectTrigger id="bande">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b1">
                        Bande B-2026-014 (Akanda · 648 sujets)
                      </SelectItem>
                      <SelectItem value="b2">
                        Bande B-2026-009 (Nzoliba · 1 200 sujets)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date de l&apos;observation</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signe">Observation clinique principale</Label>
                <Select value={sign} onValueChange={setSign}>
                  <SelectTrigger id="signe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLINICAL_SIGNS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nb">Sujets concernés (estimation)</Label>
                  <Input
                    id="nb"
                    type="number"
                    min={1}
                    max={1000}
                    value={affectedCount}
                    onChange={(e) => setAffectedCount(Number(e.target.value))}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Représente {(affectedCount / 6.48).toFixed(1)}% du cheptel
                    présent (648)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgence">Degré de vigilance</Label>
                  <Select
                    value={urgency}
                    onValueChange={(val) =>
                      setUrgency(val as "standard" | "vigilance" | "urgent")
                    }
                  >
                    <SelectTrigger id="urgence">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard — Observation de suivi
                      </SelectItem>
                      <SelectItem value="vigilance">
                        Vigilance — Suspicion nécessitant conseil
                      </SelectItem>
                      <SelectItem value="urgent">
                        Urgent — Risque contagieux aigu
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Précisions & Circonstances</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Décrivez les symptômes, le comportement des oiseaux, l'emplacement dans le bâtiment..."
                />
              </div>

              {/* Photo Evidence simulator */}
              <div className="rounded-lg border border-border p-3.5 bg-secondary/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Camera className="size-3.5 text-primary" />
                    Preuve photographique de terrain
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    Optionnel
                  </Badge>
                </div>
                {hasPhoto ? (
                  <div className="flex items-center justify-between bg-card rounded-md border border-border p-2 text-xs">
                    <span className="text-muted-foreground font-mono truncate max-w-xs">
                      IMG_20261109_074812_observation.jpg (1.8 Mo)
                    </span>
                    <button
                      type="button"
                      onClick={() => setHasPhoto(false)}
                      className="text-red-500 hover:underline text-[11px]"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setHasPhoto(true)}
                  >
                    Ajouter un cliché depuis l&apos;appareil
                  </Button>
                )}
              </div>

              {/* Regulatory Notice */}
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-muted-foreground flex gap-2.5">
                <Info className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Conformément au code pastoral et sanitaire, toute mortalité
                  groupée supérieure au seuil d&apos;alerte journalier (1.5%) fait
                  l&apos;objet d&apos;une visite de contrôle sur site sous 24h par
                  l&apos;inspecteur vétérinaire provincial.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/sante">Annuler</Link>
            </Button>
            <Button type="submit" variant="brand">
              <ShieldAlert className="size-4 mr-1.5" />
              Transmettre la déclaration
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Check,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Plus,
  ShieldCheck,
  User,
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
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Identification" },
  { id: 2, label: "Localisation" },
  { id: 3, label: "Infrastructures" },
  { id: 4, label: "Validation" },
];

const PROVINCES = [
  "Estuaire",
  "Haut-Ogooué",
  "Moyen-Ogooué",
  "Ngounié",
  "Nyanga",
  "Ogooué-Ivindo",
  "Ogooué-Lolo",
  "Ogooué-Maritime",
  "Woleu-Ntem",
];

export default function NouvelleFermePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Form State
  const [name, setName] = useState("Ferme Avicole Espoir du Gabon");
  const [owner, setOwner] = useState("Jean-Claude Obiang");
  const [phone, setPhone] = useState("+241 07 65 43 21");
  const [farmingType, setFarmingType] = useState("Chair");
  const [province, setProvince] = useState("Estuaire");
  const [locality, setLocality] = useState("Ntoum — PK 38");
  const [gps, setGps] = useState("0.3789° N, 9.7612° E");
  const [capacity, setCapacity] = useState("5000");
  const [buildingCount, setBuildingCount] = useState("2");
  const [ventilation, setVentilation] = useState("Dynamique");

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsDone(true);
      }, 700);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/fermes"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Exploitations avicoles</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Nouvelle ferme</span>
      </div>

      <PageHeader
        title="Enregistrement d'une exploitation"
        description="Inscription au registre national KIMBA 2026 — attribution d'un code officiel POUFA et rattachement sanitaire."
        badge={<Badge variant="brand">Formulaire homologué</Badge>}
      />

      {/* ── Stepper Header ── */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isPassed = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "size-7 rounded-full flex items-center justify-center text-xs font-semibold font-mono transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                  isPassed && "bg-emerald-500 text-white",
                  !isActive && !isPassed && "bg-muted text-muted-foreground",
                )}
              >
                {isPassed ? <Check className="size-3.5" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:inline",
                  isActive && "text-foreground font-semibold",
                  isPassed && "text-foreground",
                  !isActive && !isPassed && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              {idx < STEPS.length - 1 && (
                <div className="w-8 sm:w-16 h-px bg-border mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {isDone ? (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="size-14 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">
                Exploitation enregistrée avec succès
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Code officiel attribué :{" "}
                <span className="font-mono font-bold text-primary text-sm">
                  GA-EST-2026-080
                </span>
                . Le dossier d&apos;inspection sanitaire initiale a été
                transmis à la direction provinciale.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" asChild>
                <Link href="/fermes">Retour au registre</Link>
              </Button>
              <Button variant="brand" asChild>
                <Link href="/fermes">Consulter la fiche</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {currentStep === 1 && "Étape 1 : Identification de l'élevage"}
              {currentStep === 2 && "Étape 2 : Localisation provinciale & GPS"}
              {currentStep === 3 && "Étape 3 : Infrastructures & Bâtiments"}
              {currentStep === 4 && "Étape 4 : Récapitulatif & Agrément"}
            </CardTitle>
            <CardDescription className="text-xs">
              {currentStep === 1 && "Nom officiel, exploitant et orientation zootechnique."}
              {currentStep === 2 && "Positionnement territorial pour la carte de biosécurité."}
              {currentStep === 3 && "Capacités de logement et dispositifs techniques d'élevage."}
              {currentStep === 4 && "Vérification des renseignements avant attribution du code officiel."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de l&apos;exploitation / Raison sociale</Label>
                  <Input
                    id="nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex. : Ferme Avicole d'Akou"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exploitant">Nom de l&apos;exploitant / Gérant</Label>
                    <Input
                      id="exploitant"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone de contact</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type d&apos;élevage principal</Label>
                  <Select value={farmingType} onValueChange={setFarmingType}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chair">
                        Poulet de chair (Cycle standard 45 jours)
                      </SelectItem>
                      <SelectItem value="Ponte">
                        Poules pondeuses (Production d&apos;œufs de consommation)
                      </SelectItem>
                      <SelectItem value="Mixte">
                        Mixte (Chair + Pondeuses)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger id="province">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commune">Commune / Village / PK</Label>
                    <Input
                      id="commune"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gps">Coordonnées GPS (Latitude, Longitude)</Label>
                  <Input
                    id="gps"
                    value={gps}
                    onChange={(e) => setGps(e.target.value)}
                    placeholder="0.3842° N, 9.4538° E"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Relevé GPS obligatoire pour l&apos;intégration dans la
                    cartographie de veille sanitaire.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="capa">Capacité totale déclarée (volailles)</Label>
                    <Input
                      id="capa"
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bat">Nombre de bâtiments opérationnels</Label>
                    <Input
                      id="bat"
                      type="number"
                      value={buildingCount}
                      onChange={(e) => setBuildingCount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vent">Dispositif de ventilation</Label>
                  <Select value={ventilation} onValueChange={setVentilation}>
                    <SelectTrigger id="vent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dynamique">
                        Ventilation dynamique tunnel (Extracteurs motorisés)
                      </SelectItem>
                      <SelectItem value="Statique">
                        Ventilation naturelle statique avec rideaux
                      </SelectItem>
                      <SelectItem value="Mixte">
                        Ventilation mixte (Naturelle + Brasseurs d&apos;air)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4 bg-secondary/15 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-semibold text-foreground text-sm">
                      {name}
                    </span>
                    <Badge variant="brand">Code provisoire : GA-EST-2026-080</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Exploitant</span>
                      <span className="font-semibold">{owner}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Téléphone</span>
                      <span className="font-mono">{phone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Localisation</span>
                      <span>{province} · {locality}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Coordonnées GPS</span>
                      <span className="font-mono">{gps}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Filière</span>
                      <span>Poulet de {farmingType.toLowerCase()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Capacité utile</span>
                      <span className="font-mono font-bold text-foreground">
                        {Number(capacity).toLocaleString("fr-FR")} volailles ({buildingCount} bât.)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground flex gap-2">
                  <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p>
                    L&apos;exploitant s&apos;engage à respecter le cahier des
                    charges de biosécurité du programme KIMBA 2026 et à renseigner
                    quotidiennement le journal zootechnique.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
              >
                Précédent
              </Button>
              <Button
                type="button"
                variant="brand"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {currentStep === 4 ? (
                  isSubmitting ? "Enregistrement en cours..." : "Valider l'enregistrement"
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="size-3.5 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

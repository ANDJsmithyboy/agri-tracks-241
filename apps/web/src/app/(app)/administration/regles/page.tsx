import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  Info,
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

interface BusinessRule {
  id: string;
  domain: string;
  label: string;
  currentValue: string;
  unit: string;
  description: string;
  authority: string;
  lastModified: string;
}

const RULES: BusinessRule[] = [
  {
    id: "rule-1",
    domain: "Cycle d'élevage",
    label: "Durée standard du cycle de chair",
    currentValue: "45",
    unit: "jours",
    description:
      "Nombre de jours entre la mise en place (J0) et la date de clôture normale. Conditionne le calendrier sanitaire et les rappels de pesée.",
    authority: "DGE / Cahier des charges KIMBA",
    lastModified: "12 Jan 2026",
  },
  {
    id: "rule-2",
    domain: "Mortalité",
    label: "Seuil d'alerte mortalité journalière",
    currentValue: "1.5",
    unit: "% du cheptel présent",
    description:
      "Lorsque le taux de mortalité quotidien dépasse ce seuil, une alerte est générée et le vétérinaire référent est notifié.",
    authority: "DGE / OIE-WOAH",
    lastModified: "12 Jan 2026",
  },
  {
    id: "rule-3",
    domain: "Mortalité",
    label: "Seuil d'alerte mortalité cumulée",
    currentValue: "8.0",
    unit: "% de l'effectif initial",
    description:
      "Si la mortalité cumulée du cycle atteint ce seuil, le lot est placé sous surveillance renforcée avec avis vétérinaire obligatoire.",
    authority: "DGE / Protocole POUFA",
    lastModified: "12 Jan 2026",
  },
  {
    id: "rule-4",
    domain: "Pesées",
    label: "Fréquence de pesée protocolaire",
    currentValue: "7",
    unit: "jours entre deux pesées",
    description:
      "Intervalle entre deux pesées d'échantillon. Rappels automatiques générés dans l'application.",
    authority: "Programme KIMBA",
    lastModified: "01 Sep 2026",
  },
  {
    id: "rule-5",
    domain: "Pesées",
    label: "Taille minimale d'échantillon de pesée",
    currentValue: "30",
    unit: "sujets par pesée",
    description:
      "Nombre minimum de sujets pesés pour qu'un contrôle soit statistiquement significatif.",
    authority: "Standard Cobb 500",
    lastModified: "01 Sep 2026",
  },
  {
    id: "rule-6",
    domain: "Alimentation",
    label: "Indice de conversion cible (IC)",
    currentValue: "1.65",
    unit: "kg aliment / kg poids vif",
    description:
      "Ratio de conversion alimentaire de référence pour un cycle standard de 45 jours sur souche Cobb 500.",
    authority: "Guide Cobb 500 (Édition 2026)",
    lastModified: "15 Oct 2026",
  },
  {
    id: "rule-7",
    domain: "Vide sanitaire",
    label: "Durée minimale du vide sanitaire",
    currentValue: "14",
    unit: "jours",
    description:
      "Période d'inoccupation réglementaire entre deux cycles d'élevage consécutifs dans un même bâtiment.",
    authority: "DGE / Code pastoral",
    lastModified: "12 Jan 2026",
  },
  {
    id: "rule-8",
    domain: "Saisie quotidienne",
    label: "Heure limite de saisie quotidienne",
    currentValue: "23:59",
    unit: "heure locale (WAT)",
    description:
      "Passé ce délai, la saisie est marquée comme tardive dans le journal d'audit. Aucun blocage technique — la donnée est toujours acceptée.",
    authority: "Protocole POUFA terrain",
    lastModified: "01 Sep 2026",
  },
];

const domainGroups = RULES.reduce<Record<string, BusinessRule[]>>((acc, r) => {
  (acc[r.domain] ??= []).push(r);
  return acc;
}, {});

export default function ReglesPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/administration"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Administration</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Règles métier</span>
      </div>

      <PageHeader
        title="Règles métier paramétrables"
        description="Seuils, durées, fréquences et formules — chaque valeur conserve son historique de modification et son autorité d'origine."
        badge={<Badge variant="brand">Paramètres institutionnels</Badge>}
        actions={
          <Button variant="brand" size="sm" disabled>
            <Edit className="size-3.5 mr-1.5" />
            Modifier les règles
          </Button>
        }
      />

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-muted-foreground flex gap-2.5">
        <Info className="size-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Les seuils officiels ne sont jamais codés en dur dans
          l&apos;interface. Toute modification est soumise à validation par
          un acteur habilité et enregistrée dans la piste d&apos;audit.
        </p>
      </div>

      {Object.entries(domainGroups).map(([domain, rules]) => (
        <Card key={domain}>
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold">{domain}</CardTitle>
            <CardDescription className="text-xs">
              {rules.length} règle{rules.length > 1 ? "s" : ""} paramétrable
              {rules.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {rules.map((rule) => (
              <div key={rule.id} className="py-4 first:pt-4 last:pb-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">
                      {rule.label}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                      {rule.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="size-3 text-emerald-500" />
                        {rule.authority}
                      </span>
                      <span className="font-mono">
                        Dernière mise à jour : {rule.lastModified}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xl font-bold text-primary">
                      {rule.currentValue}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {rule.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

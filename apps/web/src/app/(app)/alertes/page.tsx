import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { PoufaSanitaryIcon } from "@/components/brand-icons";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AlertItem {
  id: string;
  code: string;
  farm: string;
  band: string;
  trigger: string;
  severity: "faible" | "moderee" | "elevee";
  status: "nouvelle" | "en_instruction" | "confirmee" | "cloturee";
  date: string;
  assignedTo: string;
  description: string;
}

const ALERTS: AlertItem[] = [
  {
    id: "alt-1",
    code: "ALT-SAN-2026-008",
    farm: "Ferme Pilote KIMBA — Akanda",
    band: "B-2026-014",
    trigger: "Mortalité journalière > 1.5%",
    severity: "moderee",
    status: "cloturee",
    date: "25 Oct 2026",
    assignedTo: "Dr. Jean-Pierre Ekomi",
    description:
      "Pic de mortalité J10 (16 sujets / 984 = 1.63%). Stress thermique consécutif à panne ventilation nocturne. Réparation effectuée. Taux revenu à la normale J12.",
  },
  {
    id: "alt-2",
    code: "ALT-SAN-2026-007",
    farm: "Ferme de Nzoliba",
    band: "B-2026-009",
    trigger: "Saisie manquante > 48 heures",
    severity: "faible",
    status: "cloturee",
    date: "18 Oct 2026",
    assignedTo: "Patrick Ondo",
    description:
      "Absence de saisie pendant le week-end. Technicien de terrain a confirmé la reprise normale lundi — aucun signe clinique détecté lors de la visite.",
  },
  {
    id: "alt-3",
    code: "ALT-SAN-2026-006",
    farm: "Agri-Bitam Aviculture",
    band: "B-2026-018",
    trigger: "Mortalité cumulée > 8%",
    severity: "elevee",
    status: "confirmee",
    date: "10 Oct 2026",
    assignedTo: "Dr. Marie-Claire Biyogo",
    description:
      "Mortalité cumulée de 9.2% en 21 jours. Investigation vétérinaire confirmée : coccidiose sous-clinique diagnostiquée. Traitement anticoccidien administré. Surveillance renforcée en cours.",
  },
];

const SEVERITY_MAP = {
  faible: { label: "Faible", className: "bg-secondary text-muted-foreground" },
  moderee: { label: "Modérée", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  elevee: { label: "Élevée", className: "bg-red-500/15 text-red-500 border-red-500/30" },
};

const STATUS_MAP = {
  nouvelle: { label: "Nouvelle", icon: AlertTriangle, color: "text-red-500" },
  en_instruction: { label: "En instruction", icon: Eye, color: "text-amber-500" },
  confirmee: { label: "Confirmée", icon: ShieldAlert, color: "text-primary" },
  cloturee: { label: "Clôturée", icon: CheckCircle2, color: "text-emerald-500" },
};

export default function AlertesPage() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Alertes sanitaires"
        description="File de qualification : détection automatique par seuils, instruction vétérinaire, décision officielle tracée."
        badge={<Badge variant="brand">Surveillance DGE · 2026</Badge>}
      />

      {/* Summary Bar */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Alertes ouvertes
            </span>
            <ShieldAlert className="size-4 text-amber-500" />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            1
          </p>
          <p className="text-[10px] text-muted-foreground">En instruction vétérinaire</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Alertes résolues
            </span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-emerald-500">
            2
          </p>
          <p className="text-[10px] text-muted-foreground">Fermées après investigation</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Fermes sous suivi
            </span>
            <PoufaSanitaryIcon size={16} />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            1
          </p>
          <p className="text-[10px] text-muted-foreground">Agri-Bitam (surveillance)</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Épidémies actives
            </span>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-emerald-500">
            0
          </p>
          <p className="text-[10px] text-emerald-500 font-medium">
            Aucun foyer déclaré
          </p>
        </div>
      </section>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-5">
          <Select defaultValue="tous_statuts">
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous_statuts">Tous les statuts</SelectItem>
              <SelectItem value="nouvelle">Nouvelles</SelectItem>
              <SelectItem value="en_instruction">En instruction</SelectItem>
              <SelectItem value="confirmee">Confirmées</SelectItem>
              <SelectItem value="cloturee">Clôturées</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="toutes_severites">
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toutes_severites">Toutes sévérités</SelectItem>
              <SelectItem value="faible">Faible</SelectItem>
              <SelectItem value="moderee">Modérée</SelectItem>
              <SelectItem value="elevee">Élevée</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="font-mono text-[11px] ml-auto">
            {ALERTS.length} alertes enregistrées
          </Badge>
        </CardContent>
      </Card>

      {/* Alert Cards */}
      <div className="space-y-4">
        {ALERTS.map((alert) => {
          const severity = SEVERITY_MAP[alert.severity];
          const status = STATUS_MAP[alert.status];
          const StatusIcon = status.icon;
          return (
            <Card key={alert.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between pb-3 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`size-4 ${status.color}`} />
                    <CardTitle className="text-base font-semibold">
                      {alert.code}
                    </CardTitle>
                    <Badge variant="outline" className={`text-[10px] ${severity.className}`}>
                      Sévérité {severity.label}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                      {status.label}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {alert.farm} · Bande {alert.band}
                  </CardDescription>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                  {alert.date}
                </span>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Déclencheur</span>
                    <span className="font-semibold text-foreground">{alert.trigger}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Assigné à</span>
                    <span className="font-semibold text-foreground">{alert.assignedTo}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary/15 p-3 text-xs text-muted-foreground border border-border">
                  <span className="font-semibold text-foreground block mb-1">
                    Synthèse de l&apos;investigation
                  </span>
                  {alert.description}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

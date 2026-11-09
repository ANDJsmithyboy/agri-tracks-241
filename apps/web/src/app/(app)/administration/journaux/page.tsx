"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Filter,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: "create" | "update" | "delete" | "sync";
  entity: string;
  entityId: string;
  summary: string;
  oldValue?: string;
  newValue?: string;
}

const AUDIT_LOG: AuditEntry[] = [
  {
    id: "log-1",
    timestamp: "09 Nov 2026 · 07:45:12",
    actor: "Marc Ndong Mengue",
    actorRole: "Éleveur",
    action: "create",
    entity: "Saisie quotidienne",
    entityId: "DR-2026-08421",
    summary: "Enregistrement J42 : 1 mortalité, 112.5 kg aliment, 235 L eau",
  },
  {
    id: "log-2",
    timestamp: "08 Nov 2026 · 16:22:08",
    actor: "Patrick Ondo",
    actorRole: "Technicien",
    action: "update",
    entity: "Bande B-2026-014",
    entityId: "B-2026-014",
    summary: "Mise à jour du poids moyen après pesée J41",
    oldValue: "1 680 g",
    newValue: "1 850 g",
  },
  {
    id: "log-3",
    timestamp: "06 Nov 2026 · 14:10:33",
    actor: "Dr. Jean-Pierre Ekomi",
    actorRole: "Vétérinaire",
    action: "create",
    entity: "Lot de traçabilité",
    entityId: "LP-2026-000142",
    summary: "Certification de la cession de 300 sujets vifs vers abattoir",
  },
  {
    id: "log-4",
    timestamp: "06 Nov 2026 · 13:45:19",
    actor: "Marc Ndong Mengue",
    actorRole: "Éleveur",
    action: "create",
    entity: "Sortie de cheptel",
    entityId: "EXIT-2026-0088",
    summary: "Expédition de 300 sujets vifs — Lot LP-2026-000142",
  },
  {
    id: "log-5",
    timestamp: "03 Nov 2026 · 09:15:42",
    actor: "Dr. Jean-Pierre Ekomi",
    actorRole: "Vétérinaire",
    action: "create",
    entity: "Inspection sanitaire",
    entityId: "INS-2026-0041",
    summary: "Visite de contrôle périodique — Résultat : Conforme DGE",
  },
  {
    id: "log-6",
    timestamp: "02 Nov 2026 · 11:30:55",
    actor: "Marc Ndong Mengue",
    actorRole: "Éleveur",
    action: "create",
    entity: "Réception d'intrants",
    entityId: "REC-2026-0904",
    summary: "Livraison SMAG : 1 200 kg Aliment Croissance (BL-SMAG-2026-884)",
  },
  {
    id: "log-7",
    timestamp: "02 Nov 2026 · 10:00:00",
    actor: "Système POUFA",
    actorRole: "Synchronisation",
    action: "sync",
    entity: "Base de données",
    entityId: "SYNC-2026-14882",
    summary: "Synchronisation complète réussie — 42 enregistrements transmis",
  },
  {
    id: "log-8",
    timestamp: "30 Oct 2026 · 08:22:11",
    actor: "Patrick Ondo",
    actorRole: "Technicien",
    action: "create",
    entity: "Pesée officielle",
    entityId: "WGH-2026-0035",
    summary: "Pesée J35 : échantillon 35 sujets, poids moyen 1 680 g",
  },
];

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: "Création", color: "text-emerald-500" },
  update: { label: "Modification", color: "text-amber-500" },
  delete: { label: "Suppression", color: "text-red-500" },
  sync: { label: "Synchronisation", color: "text-primary" },
};

export default function JournauxPage() {
  const [actionFilter, setActionFilter] = useState("all");
  const [actorFilter, setActorFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = AUDIT_LOG.filter((entry) => {
    if (actionFilter !== "all" && entry.action !== actionFilter) return false;
    if (actorFilter !== "all" && entry.actor !== actorFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        entry.summary.toLowerCase().includes(q) ||
        entry.entity.toLowerCase().includes(q) ||
        entry.entityId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueActors = [...new Set(AUDIT_LOG.map((e) => e.actor))];

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
        <span className="text-foreground font-medium">Journaux & Audit</span>
      </div>

      <PageHeader
        title="Journal d'audit & Piste de traçabilité"
        description="Historique immuable des actions — acteur, horodatage, ancienne et nouvelle valeur, identifiant d'enregistrement."
        badge={<Badge variant="brand">Piste d&apos;audit certifiée</Badge>}
      />

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-5">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue placeholder="Type d'action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              <SelectItem value="create">Créations</SelectItem>
              <SelectItem value="update">Modifications</SelectItem>
              <SelectItem value="delete">Suppressions</SelectItem>
              <SelectItem value="sync">Synchronisations</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actorFilter} onValueChange={setActorFilter}>
            <SelectTrigger className="w-52 h-8 text-xs">
              <SelectValue placeholder="Tous les acteurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les acteurs</SelectItem>
              {uniqueActors.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher dans le journal…"
              className="pl-8 h-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="font-mono text-[11px]">
            {filtered.length} entrée{filtered.length > 1 ? "s" : ""}
          </Badge>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead>Horodatage</TableHead>
                  <TableHead>Acteur & Rôle</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entité / Référence</TableHead>
                  <TableHead>Description de l&apos;opération</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => {
                  const actionInfo = ACTION_LABELS[entry.action];
                  return (
                    <TableRow key={entry.id} className="hover:bg-secondary/20">
                      <TableCell className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                        {entry.timestamp}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold text-foreground">
                          {entry.actor}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {entry.actorRole}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-semibold ${actionInfo.color}`}
                        >
                          {actionInfo.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-foreground">
                          {entry.entity}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {entry.entityId}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-sm">
                        <p className="truncate">{entry.summary}</p>
                        {entry.oldValue && entry.newValue && (
                          <p className="text-[10px] mt-0.5">
                            <span className="line-through text-red-400">
                              {entry.oldValue}
                            </span>{" "}
                            →{" "}
                            <span className="text-emerald-500 font-semibold">
                              {entry.newValue}
                            </span>
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

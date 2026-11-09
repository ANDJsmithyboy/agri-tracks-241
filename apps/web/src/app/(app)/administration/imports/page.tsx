"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  Download,
  FileSpreadsheet,
  Info,
  Upload,
  XCircle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImportRecord {
  id: string;
  filename: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  totalRows: number;
  accepted: number;
  rejected: number;
  status: "completed" | "partial" | "failed";
}

const IMPORT_HISTORY: ImportRecord[] = [
  {
    id: "imp-1",
    filename: "fermes_cohorte1_estuaire.xlsx",
    type: "Fermes",
    uploadDate: "12 Jan 2026",
    uploadedBy: "Admin système",
    totalRows: 28,
    accepted: 28,
    rejected: 0,
    status: "completed",
  },
  {
    id: "imp-2",
    filename: "exploitations_haut_ogooue.csv",
    type: "Fermes",
    uploadDate: "15 Jan 2026",
    uploadedBy: "Patrick Ondo",
    totalRows: 14,
    accepted: 12,
    rejected: 2,
    status: "partial",
  },
  {
    id: "imp-3",
    filename: "referentiel_aliments_v2.xlsx",
    type: "Référentiels",
    uploadDate: "20 Sep 2026",
    uploadedBy: "Admin système",
    totalRows: 18,
    accepted: 18,
    rejected: 0,
    status: "completed",
  },
  {
    id: "imp-4",
    filename: "batiments_capacites_all.csv",
    type: "Bâtiments",
    uploadDate: "25 Jan 2026",
    uploadedBy: "Admin système",
    totalRows: 156,
    accepted: 148,
    rejected: 8,
    status: "partial",
  },
];

export default function ImportsPage() {
  const [isDragging, setIsDragging] = useState(false);

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
        <span className="text-foreground font-medium">Imports de données</span>
      </div>

      <PageHeader
        title="Migration & Import de données"
        description="Intégration des données existantes depuis des fichiers Excel ou CSV — validation ligne par ligne avec rapport d'exceptions."
        badge={<Badge variant="brand">Migration KIMBA 2026</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Drop Zone */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Nouvel import
            </CardTitle>
            <CardDescription className="text-xs">
              Déposez un fichier structuré — le système génère un aperçu et un
              rapport de validation avant intégration définitive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary/10 hover:border-primary/40"
              }`}
            >
              <CloudUpload className="size-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">
                Glisser-déposer votre fichier ici
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Formats acceptés : .xlsx, .csv, .xls — Taille maximale 20 Mo
              </p>
              <Button variant="outline" size="sm">
                <Upload className="size-3.5 mr-1.5" />
                Parcourir les fichiers
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Modèles de colonnes attendus
              </h4>
              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                <div className="rounded-lg border border-border p-2.5 bg-card flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-emerald-500" />
                  <div>
                    <span className="font-semibold text-foreground block">
                      Fermes & Exploitations
                    </span>
                    <span className="text-muted-foreground">
                      nom, exploitant, province, commune, GPS, capacité
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-border p-2.5 bg-card flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-primary" />
                  <div>
                    <span className="font-semibold text-foreground block">
                      Bâtiments & Capacités
                    </span>
                    <span className="text-muted-foreground">
                      ferme_id, label, surface_m2, capacite, ventilation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bilan des importations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">Imports effectués</span>
                <span className="font-mono font-bold">
                  {IMPORT_HISTORY.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">Lignes intégrées</span>
                <span className="font-mono font-bold text-emerald-500">
                  {IMPORT_HISTORY.reduce((a, i) => a + i.accepted, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">Lignes rejetées</span>
                <span className="font-mono font-bold text-amber-500">
                  {IMPORT_HISTORY.reduce((a, i) => a + i.rejected, 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-border bg-secondary/15 p-3 text-xs text-muted-foreground flex gap-2">
            <Info className="size-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Les doublons sont détectés automatiquement par comparaison de nom,
              GPS et identifiant unique. Aucune donnée n&apos;est écrasée sans
              confirmation explicite.
            </p>
          </div>
        </div>
      </div>

      {/* Import History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Historique des imports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead>Fichier source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Opérateur</TableHead>
                  <TableHead className="text-right">Lignes</TableHead>
                  <TableHead className="text-right">Acceptées</TableHead>
                  <TableHead className="text-right">Rejetées</TableHead>
                  <TableHead>Résultat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {IMPORT_HISTORY.map((imp) => (
                  <TableRow key={imp.id} className="hover:bg-secondary/20">
                    <TableCell className="font-mono text-xs text-foreground font-medium">
                      {imp.filename}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {imp.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {imp.uploadDate}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {imp.uploadedBy}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {imp.totalRows}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-500 font-semibold">
                      {imp.accepted}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {imp.rejected > 0 ? (
                        <span className="text-amber-500 font-semibold">
                          {imp.rejected}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {imp.status === "completed" ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-500">
                          <CheckCircle2 className="size-3.5" />
                          Complet
                        </span>
                      ) : imp.status === "partial" ? (
                        <span className="flex items-center gap-1 text-[11px] text-amber-500">
                          <Info className="size-3.5" />
                          Partiel
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-red-500">
                          <XCircle className="size-3.5" />
                          Échoué
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

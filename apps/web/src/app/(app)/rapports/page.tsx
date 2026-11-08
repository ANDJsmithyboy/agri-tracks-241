import Link from "next/link";
import { Download, Eye, FileCheck, FileSpreadsheet, FileText, QrCode } from "lucide-react";
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

const OFFICIAL_REPORTS = [
  {
    id: "REP-2026-W45",
    title: "Rapport Hebdomadaire Zootechnique — S45",
    scope: "Bande B-2026-014 (Ferme Kango)",
    type: "Technique",
    date: "08 Nov 2026",
    size: "2,4 Mo",
    status: "Validé MAEDR",
    badgeVariant: "brand" as const,
  },
  {
    id: "REP-2026-LOT-142",
    title: "Certificat de Traçabilité & Cession de Lot",
    scope: "Lot LP-2026-000142 (300 sujets)",
    type: "Traçabilité",
    date: "06 Nov 2026",
    size: "840 Ko",
    status: "Validé Vétérinaire",
    badgeVariant: "brand" as const,
  },
  {
    id: "REP-2026-IC-M10",
    title: "Indice de Consommation & Bilan Alimentaire",
    scope: "Ferme Kango — Cycle 45j",
    type: "Économique",
    date: "01 Nov 2026",
    size: "1,8 Mo",
    status: "Certifié",
    badgeVariant: "secondary" as const,
  },
  {
    id: "REP-2026-NAT-OCT",
    title: "Synthèse Mensuelle Nationale Filière Avicole",
    scope: "Gabon (Consolidé 9 Provinces)",
    type: "National",
    date: "31 Oct 2026",
    size: "5,1 Mo",
    status: "Publié",
    badgeVariant: "brand" as const,
  },
];

export default function RapportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports institutionnels"
        description="Rapports technico-économiques, bilans zootechniques et attestations officielles de traçabilité certifiés par l'administration avicole."
        badge={<Badge variant="brand">Certifié KIMBA 2026</Badge>}
        actions={
          <Button variant="brand" className="gap-2">
            <FileSpreadsheet className="size-4" aria-hidden />
            Exporter les données (CSV / Excel)
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Rapports et attestations officiels
            </CardTitle>
            <CardDescription className="text-xs">
              Documents générés à partir des données réelles archivées sur la base Neon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30">
                    <TableHead>Document & Périmètre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date d'émission</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {OFFICIAL_REPORTS.map((r) => (
                    <TableRow key={r.id} className="hover:bg-accent/40 transition-colors">
                      <TableCell>
                        <div className="flex items-start gap-2.5">
                          <FileText className="size-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden />
                          <div>
                            <p className="font-semibold text-foreground text-sm">{r.title}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              {r.id} · {r.scope} · {r.size}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{r.type}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {r.date}
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.badgeVariant} className="text-xs">{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            title="Visualiser le rapport"
                            aria-label={`Visualiser ${r.title}`}
                          >
                            <Eye className="size-4" aria-hidden />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            title="Télécharger l'attestation PDF"
                            aria-label={`Télécharger ${r.title}`}
                          >
                            <Download className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <FileCheck className="size-4 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" aria-hidden />
                Protocole de certification
              </CardTitle>
              <CardDescription className="text-xs">
                Cadre de conformité national gabonais (MAEDR).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                Chaque rapport POUFA consolide l'ensemble des opérations déclarées
                (mises en place, pesées, consommations d'intrants et sorties de lots).
              </p>
              <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-1.5">
                <p className="font-semibold text-foreground">Garantie d'intégrité :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Traçabilité cryptographique par hash unique</li>
                  <li>Horodatage UTC infalsifiable</li>
                  <li>Idempotence des opérations terrain</li>
                </ul>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                <Link href="/tracabilite">
                  <QrCode className="size-3.5 mr-1" aria-hidden />
                  Contrôler un lot par QR Code
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

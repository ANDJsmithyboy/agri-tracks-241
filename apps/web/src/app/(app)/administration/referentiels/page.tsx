"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Plus,
  Search,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReferentialItem {
  id: string;
  domain: string;
  code: string;
  label: string;
  description: string;
  unit?: string;
  lastModified: string;
  modifiedBy: string;
}

const REFERENTIALS: ReferentialItem[] = [
  { id: "r1", domain: "Alimentation", code: "ALM-DEMARR", label: "Aliment Démarrage Miette", description: "Aliment complet pour poussins J0-J10, protéines 23%", unit: "kg (sacs 50 kg)", lastModified: "15 Oct 2026", modifiedBy: "Admin système" },
  { id: "r2", domain: "Alimentation", code: "ALM-CROISS", label: "Aliment Croissance Granulé", description: "Aliment de croissance J11-J28, protéines 21%", unit: "kg (sacs 50 kg)", lastModified: "15 Oct 2026", modifiedBy: "Admin système" },
  { id: "r3", domain: "Alimentation", code: "ALM-FINIT", label: "Aliment Finition Granulé", description: "Aliment de finition J29-J45, protéines 19%", unit: "kg (sacs 50 kg)", lastModified: "15 Oct 2026", modifiedBy: "Admin système" },
  { id: "r4", domain: "Vaccins", code: "VAC-ND-HB1", label: "Vaccin Newcastle HB1", description: "Vaccin vivant atténué Newcastle souche HB1 — eau de boisson", unit: "Flacon 1 000 doses", lastModified: "01 Sep 2026", modifiedBy: "Dr. Ekomi" },
  { id: "r5", domain: "Vaccins", code: "VAC-GUMBORO", label: "Vaccin Gumboro IBD", description: "Vaccin vivant Gumboro souche intermédiaire", unit: "Flacon 1 000 doses", lastModified: "01 Sep 2026", modifiedBy: "Dr. Ekomi" },
  { id: "r6", domain: "Pathologies", code: "PATH-NEWC", label: "Maladie de Newcastle", description: "Maladie virale à déclaration obligatoire (OIE/WOAH)", lastModified: "12 Jan 2026", modifiedBy: "DGE" },
  { id: "r7", domain: "Pathologies", code: "PATH-GUMBORO", label: "Maladie de Gumboro", description: "Bursite infectieuse aiguë — immunodépression", lastModified: "12 Jan 2026", modifiedBy: "DGE" },
  { id: "r8", domain: "Races", code: "RACE-COBB500", label: "Cobb 500", description: "Souche chair standard internationale — courbe de croissance référence", lastModified: "12 Jan 2026", modifiedBy: "DGE" },
  { id: "r9", domain: "Races", code: "RACE-ROSS308", label: "Ross 308", description: "Souche chair alternative — rendement carcasse élevé", lastModified: "12 Jan 2026", modifiedBy: "DGE" },
  { id: "r10", domain: "Produits vétérinaires", code: "MED-POLYVIT", label: "Complexe Polyvitaminé AV-Total", description: "Vitamines A, D3, E, K — eau de boisson stress thermique", unit: "Litre", lastModified: "20 Oct 2026", modifiedBy: "Dr. Ekomi" },
];

export default function ReferentielsPage() {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");

  const domains = [...new Set(REFERENTIALS.map((r) => r.domain))];
  const filtered = REFERENTIALS.filter((r) => {
    if (domainFilter !== "all" && r.domain !== domainFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.label.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/administration" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="size-3.5" />
          <span>Administration</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Référentiels</span>
      </div>

      <PageHeader
        title="Référentiels partagés"
        description="Catalogue d'aliments, vaccins, pathologies, races et produits vétérinaires — données de référence utilisées dans toutes les saisies."
        badge={<Badge variant="brand">Données normalisées DGE</Badge>}
        actions={
          <Button variant="brand" size="sm" disabled>
            <Plus className="size-3.5 mr-1.5" />
            Ajouter une entrée
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-5">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setDomainFilter("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${domainFilter === "all" ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}
            >
              Tous ({REFERENTIALS.length})
            </button>
            {domains.map((d) => (
              <button
                key={d}
                onClick={() => setDomainFilter(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${domainFilter === d ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}
              >
                {d} ({REFERENTIALS.filter((r) => r.domain === d).length})
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher…" className="pl-8 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead>Code</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Description & Caractéristiques</TableHead>
                  <TableHead>Modifié par</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-secondary/20">
                    <TableCell className="font-mono text-xs font-bold text-primary">{r.code}</TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">{r.label}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{r.domain}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {r.description}
                      {r.unit && <span className="block text-[10px] font-mono mt-0.5">Unité : {r.unit}</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.modifiedBy}</TableCell>
                    <TableCell className="text-right text-[11px] font-mono text-muted-foreground">{r.lastModified}</TableCell>
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

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronRight, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { FarmRow } from "@/lib/poufa-queries";

export type { FarmRow };

const GABON_PROVINCES = [
  "Toutes les provinces",
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

export function FermesTable({ farms }: { farms: FarmRow[] }) {
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("Toutes les provinces");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof FarmRow>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    return farms
      .filter((f) => {
        if (province !== "Toutes les provinces" && f.province.toLowerCase() !== province.toLowerCase()) {
          return false;
        }
        if (statusFilter !== "all" && f.status !== statusFilter) {
          return false;
        }
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.official_code.toLowerCase().includes(q) ||
          f.locality.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [farms, search, province, statusFilter, sortField, sortAsc]);

  function toggleSort(field: keyof FarmRow) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, code…"
            className="pl-9 h-9 text-xs"
            aria-label="Rechercher une ferme"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={province} onValueChange={setProvince}>
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GABON_PROVINCES.map((p) => (
                <SelectItem key={p} value={p} className="text-xs">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tous statuts</SelectItem>
              <SelectItem value="active" className="text-xs">Actives</SelectItem>
              <SelectItem value="pending" className="text-xs">En attente</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline" className="text-xs">
            {filtered.length} ferme(s)
          </Badge>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 text-xs">
              <TableHead className="cursor-pointer" onClick={() => toggleSort("official_code")}>
                <div className="flex items-center gap-1 font-semibold">
                  Code <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                <div className="flex items-center gap-1 font-semibold">
                  Exploitation avicole <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("province")}>
                <div className="flex items-center gap-1 font-semibold">
                  Localisation <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Filière</TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("building_count_declared")}>
                <div className="flex items-center justify-end gap-1 font-semibold">
                  Bâtiments <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="text-right">Bande active</TableHead>
              <TableHead className="text-right">Effectif</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-28 text-center text-xs text-muted-foreground">
                  Aucune exploitation trouvée selon vos filtres.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((f) => (
                <TableRow key={f.id} className="hover:bg-accent/40 transition-colors text-xs">
                  <TableCell className="font-mono font-semibold text-foreground">
                    <Link href={`/fermes/${f.id}`} className="hover:underline">
                      {f.official_code}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{f.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="size-3 shrink-0" aria-hidden />
                      <span>{f.locality} ({f.province})</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {f.farming_type === "broiler" ? "Poulet de chair" : "Pondeuse"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    {f.building_count_declared}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {f.active_band_code ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-foreground">
                    {f.current_population?.toLocaleString("fr-FR") ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={f.status === "active" ? "brand" : "secondary"}>
                      {f.status === "active" ? "Opérationnelle" : "En cours"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/fermes/${f.id}`} aria-label={`Consulter ${f.name}`}>
                      <ChevronRight className="size-4 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

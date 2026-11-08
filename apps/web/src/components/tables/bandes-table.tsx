"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { BandRow } from "@/lib/poufa-queries";

export type { BandRow };

export function BandesTable({ bands }: { bands: BandRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">("all");
  const [sortField, setSortField] = useState<keyof BandRow>("placement_date");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    return bands
      .filter((b) => {
        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          b.official_code.toLowerCase().includes(q) ||
          b.farm_name.toLowerCase().includes(q) ||
          b.building_label.toLowerCase().includes(q)
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
  }, [bands, search, statusFilter, sortField, sortAsc]);

  function toggleSort(field: keyof BandRow) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par code, ferme…"
            className="pl-9 h-9 text-xs"
            aria-label="Rechercher une bande"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5 text-xs bg-secondary/30">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Toutes ({bands.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              En cours
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("closed")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                statusFilter === "closed"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Clôturées
            </button>
          </div>
          <Badge variant="outline" className="text-xs">
            {filtered.length} affichée(s)
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
                  Code bande <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("farm_name")}>
                <div className="flex items-center gap-1 font-semibold">
                  Ferme <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Bâtiment</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("placement_date")}>
                <div className="flex items-center gap-1 font-semibold">
                  Mise en place <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("initial_count")}>
                <div className="flex items-center justify-end gap-1 font-semibold">
                  Placés <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="text-right">Morts</TableHead>
              <TableHead className="text-right">Sorties</TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("current_population")}>
                <div className="flex items-center justify-end gap-1 font-semibold">
                  Présents <ArrowUpDown className="size-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-28 text-center text-xs text-muted-foreground">
                  Aucune bande ne correspond aux critères de recherche.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow key={b.id} className="hover:bg-accent/40 transition-colors text-xs">
                  <TableCell className="font-mono font-semibold text-foreground">
                    <Link href={`/bandes/${b.id}`} className="hover:underline">
                      {b.official_code}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{b.farm_name}</TableCell>
                  <TableCell className="text-muted-foreground">{b.building_label}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{b.placement_date}</TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">{b.initial_count}</TableCell>
                  <TableCell className="text-right tabular-nums text-destructive font-medium">{b.deaths}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{b.exits}</TableCell>
                  <TableCell className="text-right tabular-nums font-bold text-foreground">
                    {b.current_population}
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === "active" ? "brand" : "secondary"}>
                      {b.status === "active" ? "En cours" : "Clôturée"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/bandes/${b.id}`} aria-label={`Consulter ${b.official_code}`}>
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

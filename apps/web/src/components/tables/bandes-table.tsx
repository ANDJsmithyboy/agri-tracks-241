"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import {
  PoufaFlockIcon,
  PoufaPlacementIcon,
  PoufaPopulationIcon,
} from "@/components/brand-icons";
import { Badge } from "@/components/ui/badge";
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
      {/* ── Precision Control Bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par code bande, ferme, bâtiment…"
            className="pl-9 h-9 text-xs bg-background/50"
            aria-label="Rechercher une bande"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5 text-xs bg-secondary/30">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
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
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              En cours
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("closed")}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                statusFilter === "closed"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Clôturées
            </button>
          </div>

          <span className="text-[11px] font-mono text-muted-foreground px-1">
            {filtered.length} affichée(s)
          </span>
        </div>
      </div>

      {/* ── Signature POUFA Enterprise Data Grid ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 text-[11px] uppercase tracking-wider font-semibold border-b border-border">
                <TableHead className="w-36 cursor-pointer py-3" onClick={() => toggleSort("official_code")}>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <PoufaFlockIcon size={14} className="text-muted-foreground" />
                    <span>Code bande</span>
                    <ArrowUpDown className="size-3 text-muted-foreground ml-auto" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("farm_name")}>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <span>Exploitation</span>
                    <ArrowUpDown className="size-3 text-muted-foreground ml-auto" />
                  </div>
                </TableHead>
                <TableHead className="w-28 text-foreground">Bâtiment</TableHead>
                <TableHead className="w-32 cursor-pointer" onClick={() => toggleSort("placement_date")}>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <span>Mise en place</span>
                    <ArrowUpDown className="size-3 text-muted-foreground ml-auto" />
                  </div>
                </TableHead>
                <TableHead className="w-24 text-right cursor-pointer" onClick={() => toggleSort("initial_count")}>
                  <div className="flex items-center justify-end gap-1.5 text-foreground">
                    <span>Placés</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead className="w-20 text-right text-foreground">Morts</TableHead>
                <TableHead className="w-20 text-right text-foreground">Sorties</TableHead>
                <TableHead className="w-28 text-right cursor-pointer" onClick={() => toggleSort("current_population")}>
                  <div className="flex items-center justify-end gap-1.5 text-foreground font-bold">
                    <span>Présents</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead className="w-28 text-center text-foreground">Statut</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-xs text-muted-foreground">
                    Aucune bande d&apos;élevage ne correspond aux critères sélectionnés.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((b) => {
                  const deathRate = b.initial_count > 0 ? ((b.deaths / b.initial_count) * 100).toFixed(1) : "0.0";
                  return (
                    <TableRow key={b.id} className="hover:bg-accent/40 transition-colors group">
                      <TableCell className="font-mono font-semibold text-foreground py-3">
                        <Link href={`/bandes/${b.id}`} className="hover:underline flex items-center gap-1.5">
                          {b.official_code}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">{b.farm_name}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-[11px]">
                        {b.building_label}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground text-[11px]">
                        {b.placement_date}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {b.initial_count.toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-[var(--destructive)]">
                        {b.deaths}{" "}
                        <span className="text-[10px] text-muted-foreground">({deathRate}%)</span>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {b.exits.toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold tabular-nums text-foreground">
                        {b.current_population.toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={b.status === "active" ? "brand" : "secondary"}
                          className="text-[10px]"
                        >
                          {b.status === "active" ? "En cours (J+34)" : "Clôturée"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/bandes/${b.id}`}
                          aria-label={`Consulter ${b.official_code}`}
                          className="inline-flex size-6 items-center justify-center rounded text-muted-foreground group-hover:text-foreground group-hover:bg-accent"
                        >
                          <ChevronRight className="size-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

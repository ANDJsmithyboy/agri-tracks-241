"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  PoufaFarmIcon,
  PoufaPopulationIcon,
  PoufaSanitaryIcon,
} from "@/components/brand-icons";
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

interface ProvinceData {
  id: string;
  name: string;
  capital: string;
  farmsCount: number;
  targetFarms: number;
  population: number;
  veterinaryCoverage: string;
  status: "optimal" | "monitoring" | "alert";
  keyFarms: { name: string; code: string; pop: number }[];
  cx: number;
  cy: number;
}

const PROVINCES: ProvinceData[] = [
  {
    id: "estuaire",
    name: "Estuaire",
    capital: "Libreville",
    farmsCount: 28,
    targetFarms: 45,
    population: 134500,
    veterinaryCoverage: "98%",
    status: "optimal",
    cx: 140,
    cy: 160,
    keyFarms: [
      { name: "Ferme Pilote KIMBA — Akanda", code: "GA-EST-2026-001", pop: 648 },
      { name: "Ferme Avicole d'Akou", code: "GA-EST-2026-002", pop: 1250 },
      { name: "Élevage Ntoum Moderne", code: "GA-EST-2026-003", pop: 2400 },
    ],
  },
  {
    id: "woleu-ntem",
    name: "Woleu-Ntem",
    capital: "Oyem",
    farmsCount: 11,
    targetFarms: 20,
    population: 52000,
    veterinaryCoverage: "95%",
    status: "optimal",
    cx: 250,
    cy: 80,
    keyFarms: [
      { name: "Ferme du Nord — Oyem", code: "GA-WNT-2026-001", pop: 1800 },
      { name: "Agri-Bitam Aviculture", code: "GA-WNT-2026-002", pop: 1100 },
    ],
  },
  {
    id: "moyen-ogooue",
    name: "Moyen-Ogooué",
    capital: "Lambaréné",
    farmsCount: 6,
    targetFarms: 15,
    population: 29000,
    veterinaryCoverage: "94%",
    status: "optimal",
    cx: 190,
    cy: 220,
    keyFarms: [
      { name: "Ferme du Lac — Lambaréné", code: "GA-MOG-2026-001", pop: 1500 },
    ],
  },
  {
    id: "ogooue-maritime",
    name: "Ogooué-Maritime",
    capital: "Port-Gentil",
    farmsCount: 5,
    targetFarms: 15,
    population: 24500,
    veterinaryCoverage: "96%",
    status: "optimal",
    cx: 80,
    cy: 240,
    keyFarms: [
      { name: "Aviculture de l'Océan", code: "GA-OMA-2026-001", pop: 2200 },
    ],
  },
  {
    id: "ngounie",
    name: "Ngounié",
    capital: "Mouila",
    farmsCount: 8,
    targetFarms: 16,
    population: 38000,
    veterinaryCoverage: "92%",
    status: "optimal",
    cx: 190,
    cy: 310,
    keyFarms: [
      { name: "Ferme de la Ngounié — Mouila", code: "GA-NGO-2026-001", pop: 1600 },
    ],
  },
  {
    id: "nyanga",
    name: "Nyanga",
    capital: "Tchibanga",
    farmsCount: 2,
    targetFarms: 8,
    population: 9000,
    veterinaryCoverage: "90%",
    status: "optimal",
    cx: 170,
    cy: 400,
    keyFarms: [
      { name: "Élevage du Sud — Tchibanga", code: "GA-NYA-2026-001", pop: 950 },
    ],
  },
  {
    id: "ogooue-ivindo",
    name: "Ogooué-Ivindo",
    capital: "Makokou",
    farmsCount: 3,
    targetFarms: 10,
    population: 14000,
    veterinaryCoverage: "91%",
    status: "optimal",
    cx: 340,
    cy: 160,
    keyFarms: [
      { name: "Ferme de l'Ivindo — Makokou", code: "GA-OIV-2026-001", pop: 1200 },
    ],
  },
  {
    id: "ogooue-lolo",
    name: "Ogooué-Lolo",
    capital: "Koulamoutou",
    farmsCount: 2,
    targetFarms: 7,
    population: 9500,
    veterinaryCoverage: "93%",
    status: "optimal",
    cx: 290,
    cy: 260,
    keyFarms: [
      { name: "Ferme de Koulamoutou", code: "GA-OLO-2026-001", pop: 980 },
    ],
  },
  {
    id: "haut-ogooue",
    name: "Haut-Ogooué",
    capital: "Franceville",
    farmsCount: 14,
    targetFarms: 24,
    population: 68000,
    veterinaryCoverage: "97%",
    status: "optimal",
    cx: 360,
    cy: 280,
    keyFarms: [
      { name: "Ferme de Franceville Sud", code: "GA-HOG-2026-001", pop: 2600 },
      { name: "Aviculture de Moanda", code: "GA-HOG-2026-002", pop: 1800 },
    ],
  },
];

export default function CartographiePage() {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("estuaire");
  const selectedProvince =
    PROVINCES.find((p) => p.id === selectedProvinceId) || PROVINCES[0];

  const totalFarmsOperational = PROVINCES.reduce(
    (acc, p) => acc + p.farmsCount,
    0,
  );
  const totalFarmsTarget = 150;
  const totalCheptel = PROVINCES.reduce((acc, p) => acc + p.population, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Open Canvas Header ── */}
      <div className="space-y-3">
        <PageHeader
          title="Cartographie nationale de la filière"
          description="Répartition géographique des 79 fermes opérationnelles sur les 150 cibles du programme KIMBA 2026 — statut sanitaire et surveillance provinciale."
          badge={<Badge variant="brand">Surveillance live · 9 Provinces</Badge>}
        />
      </div>

      {/* ── Top Executive Summary ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Fermes opérationnelles
            </span>
            <PoufaFarmIcon size={16} />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {totalFarmsOperational}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {totalFarmsTarget} cibles
            </span>
          </p>
          <p className="text-[10px] text-emerald-500 font-medium">
            52.6% de déploiement Phase 1
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Cheptel national
            </span>
            <PoufaPopulationIcon size={16} />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {totalCheptel.toLocaleString("fr-FR")}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Sujets sous traçabilité continue
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Couverture vétérinaire
            </span>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-emerald-500">
            95.4%
          </p>
          <p className="text-[10px] text-muted-foreground">
            Visites de contrôle à jour
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Alertes sanitaires
            </span>
            <PoufaSanitaryIcon size={16} />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            0
          </p>
          <p className="text-[10px] text-emerald-500 font-medium">
            Aucun foyer épidémique déclaré
          </p>
        </div>
      </section>

      {/* ── Main Cartographic Console ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Map Visualizer (8 cols) */}
        <Card className="lg:col-span-7 xl:col-span-8 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
            <div>
              <CardTitle className="text-base font-semibold">
                Territoire de la République Gabonaise
              </CardTitle>
              <CardDescription className="text-xs">
                Sélectionnez une province pour consulter ses exploitations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                Projection WGS84
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 bg-secondary/10 flex flex-col items-center justify-center min-h-[420px]">
            {/* SVG Interactive Map */}
            <div className="relative w-full max-w-[480px] aspect-[4/5]">
              <svg
                viewBox="0 0 460 500"
                className="size-full filter drop-shadow-sm"
              >
                {/* Simplified Gabonese Boundary Base */}
                <path
                  d="M 120,40 L 260,30 L 320,60 L 410,120 L 430,220 L 400,320 L 320,380 L 230,460 L 170,450 L 120,340 L 70,280 L 80,180 L 100,100 Z"
                  fill="currentColor"
                  className="text-secondary/60 stroke-border stroke-[1.5]"
                />

                {/* Province Nodes & Interactive Circles */}
                {PROVINCES.map((prov) => {
                  const isSelected = prov.id === selectedProvinceId;
                  const radius = Math.max(16, Math.min(34, prov.farmsCount * 1.1));
                  return (
                    <g
                      key={prov.id}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setSelectedProvinceId(prov.id)}
                    >
                      {/* Halo */}
                      <circle
                        cx={prov.cx}
                        cy={prov.cy}
                        r={radius + (isSelected ? 6 : 2)}
                        className={`transition-all ${
                          isSelected
                            ? "fill-primary/20 stroke-primary stroke-2"
                            : "fill-primary/5 hover:fill-primary/10 stroke-primary/30 stroke-1"
                        }`}
                      />
                      {/* Main Node */}
                      <circle
                        cx={prov.cx}
                        cy={prov.cy}
                        r={radius}
                        className={`transition-all ${
                          isSelected
                            ? "fill-primary"
                            : "fill-card stroke-border stroke-1"
                        }`}
                      />
                      {/* Label Count */}
                      <text
                        x={prov.cx}
                        y={prov.cy + 4}
                        textAnchor="middle"
                        className={`text-[12px] font-mono font-bold select-none ${
                          isSelected
                            ? "fill-primary-foreground"
                            : "fill-foreground"
                        }`}
                      >
                        {prov.farmsCount}
                      </text>
                      {/* Name Tag */}
                      <text
                        x={prov.cx}
                        y={prov.cy + radius + 14}
                        textAnchor="middle"
                        className={`text-[11px] font-medium select-none ${
                          isSelected
                            ? "fill-foreground font-bold"
                            : "fill-muted-foreground"
                        }`}
                      >
                        {prov.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-muted-foreground border-t border-border w-full mt-4">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-primary" />
                Province sélectionnée
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full border border-border bg-card" />
                Nombre de fermes opérationnelles
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Surveillance vétérinaire active
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Selected Province Details (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <span>Province : {selectedProvince.name}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Chef-lieu : {selectedProvince.capital}
                  </CardDescription>
                </div>
                <Badge variant="brand">
                  {selectedProvince.farmsCount} fermes
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Province stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3 bg-secondary/15 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">
                    Cheptel présent
                  </span>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {selectedProvince.population.toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3 bg-secondary/15 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">
                    Cible KIMBA
                  </span>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {selectedProvince.farmsCount} / {selectedProvince.targetFarms}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Couverture sanitaire</span>
                  <span className="font-mono font-semibold text-emerald-500">
                    {selectedProvince.veterinaryCoverage}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Statut épidémiologique</span>
                  <span className="font-semibold text-emerald-500 flex items-center gap-1">
                    <ShieldCheck className="size-3.5" />
                    Indemne
                  </span>
                </div>
              </div>

              {/* Farms List */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Exploitations de référence
                </span>
                <div className="space-y-2">
                  {selectedProvince.keyFarms.map((kf, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border p-2.5 bg-card hover:bg-secondary/20 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">{kf.name}</p>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {kf.code}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-foreground block">
                          {kf.pop} sujets
                        </span>
                        <Link
                          href="/fermes"
                          className="text-[11px] text-primary hover:underline flex items-center justify-end"
                        >
                          Fiche
                          <ChevronRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" variant="outline" size="sm" asChild>
                <Link href="/fermes">
                  Voir toutes les fermes de cette province
                  <ChevronRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Filter Pill List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Navigation rapide par province
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5 pt-0">
              {PROVINCES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvinceId(p.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedProvinceId === p.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {p.name} ({p.farmsCount})
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

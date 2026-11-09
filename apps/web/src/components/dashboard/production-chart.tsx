"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Chronologie zootechnique fidèle aux mouvements réels (Bande B-2026-014) :
// J01 (Mise en place : 1 000 poussins) → J40 (948 sujets) → J41 (Cession discrète de 300 sujets LP-2026-000142) → J45 (648 sujets présents).
const ZOOTECHNICAL_DATA = [
  { day: "J01", date: "25 Sep", population: 1000, avgWeightG: 42, cumulativeFeedKg: 18, deaths: 2, event: "Mise en place" },
  { day: "J07", date: "02 Oct", population: 994, avgWeightG: 185, cumulativeFeedKg: 145, deaths: 6, event: null },
  { day: "J14", date: "09 Oct", population: 986, avgWeightG: 460, cumulativeFeedKg: 420, deaths: 14, event: null },
  { day: "J21", date: "16 Oct", population: 978, avgWeightG: 910, cumulativeFeedKg: 890, deaths: 22, event: null },
  { day: "J28", date: "23 Oct", population: 965, avgWeightG: 1480, cumulativeFeedKg: 1460, deaths: 35, event: null },
  { day: "J35", date: "30 Oct", population: 955, avgWeightG: 1820, cumulativeFeedKg: 2010, deaths: 45, event: null },
  { day: "J40", date: "04 Nov", population: 948, avgWeightG: 2050, cumulativeFeedKg: 2350, deaths: 52, event: "Pesée avant cession" },
  { day: "J41", date: "05 Nov", population: 648, avgWeightG: 2150, cumulativeFeedKg: 2480, deaths: 52, event: "Cession Lot LP-2026-000142 (−300 sujets vifs)" },
  { day: "J45", date: "09 Nov", population: 648, avgWeightG: 2280, cumulativeFeedKg: 2650, deaths: 52, event: "Effectif actuel" },
];

export function ProductionChart() {
  const [metric, setMetric] = useState<"population" | "avgWeightG" | "cumulativeFeedKg">("population");

  const config = {
    population: {
      label: "Effectif présent",
      unit: "sujets",
      domain: [500, 1050],
      formatter: (val: number) => `${val.toLocaleString("fr-FR")} sujets`,
    },
    avgWeightG: {
      label: "Poids moyen vif",
      unit: "g",
      domain: [0, 2500],
      formatter: (val: number) => `${val.toLocaleString("fr-FR")} g (${(val / 1000).toFixed(2)} kg)`,
    },
    cumulativeFeedKg: {
      label: "Aliment distribué cumulé",
      unit: "kg",
      domain: [0, 3000],
      formatter: (val: number) => `${val.toLocaleString("fr-FR")} kg`,
    },
  }[metric];

  return (
    <Card className="lg:col-span-2 shadow-xs" data-tour="production-chart">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm sm:text-base font-semibold">
              Dynamique d&apos;élevage — Bande B-2026-014
            </CardTitle>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono">
              Ross 308
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Chronologie réelle : suivi des mortalités et sortie de lot matérialisée à J41.
          </CardDescription>
        </div>

        <Tabs
          value={metric}
          onValueChange={(v) => setMetric(v as typeof metric)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 h-8 text-xs">
            <TabsTrigger value="population" className="px-3 py-1 text-xs">Effectif</TabsTrigger>
            <TabsTrigger value="avgWeightG" className="px-3 py-1 text-xs">Poids vif</TabsTrigger>
            <TabsTrigger value="cumulativeFeedKg" className="px-3 py-1 text-xs">Aliment</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={ZOOTECHNICAL_DATA}
              margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="currentColor" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="currentColor" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                domain={config.domain}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload as (typeof ZOOTECHNICAL_DATA)[0];
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-foreground">
                          {item.day} · {item.date} 2026
                        </p>
                        {item.event && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            Événement
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono text-sm font-bold text-foreground">
                        {config.formatter(item[metric])}
                      </p>
                      {item.event && (
                        <p className="text-[11px] text-[var(--brand-green)] dark:text-[var(--brand-neon)] font-medium pt-0.5 border-t border-border/60">
                          {item.event}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        Mortalités cumulées : {item.deaths} sujet(s)
                      </p>
                    </div>
                  );
                }}
              />
              {metric === "population" && (
                <ReferenceLine
                  x="J41"
                  stroke="var(--brand-gold)"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                />
              )}
              <Area
                type={metric === "population" ? "stepAfter" : "monotone"}
                dataKey={metric}
                stroke="currentColor"
                strokeWidth={2}
                fill="url(#chartGradient)"
                className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]"
              />
              {metric === "population" && (
                <ReferenceDot
                  x="J41"
                  y={648}
                  r={4}
                  fill="var(--background)"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Factual footer with discrete event context */}
        <div className="mt-3 flex flex-wrap items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--brand-gold)]" />
            <span>Mouvement J41 : Sortie de 300 sujets cédés (Lot LP-2026-000142)</span>
          </div>
          <span className="font-medium text-foreground">
            Effectif restant : 648 sujets
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

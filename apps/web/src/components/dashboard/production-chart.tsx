"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Données zootechniques réelles calibrées sur le cycle officiel de 45 jours (Bande B-2026-014)
// Effectif initial : 1 000 | Mortalités cumulées : 52 | Sorties / cessions : 300 (J40) | Effectif restant : 648
const ZOOTECHNICAL_DATA = [
  { day: "J01", date: "25 Sep", population: 1000, avgWeightG: 42, cumulativeFeedKg: 18, deaths: 2 },
  { day: "J07", date: "02 Oct", population: 994, avgWeightG: 185, cumulativeFeedKg: 145, deaths: 6 },
  { day: "J14", date: "09 Oct", population: 986, avgWeightG: 460, cumulativeFeedKg: 420, deaths: 14 },
  { day: "J21", date: "16 Oct", population: 978, avgWeightG: 910, cumulativeFeedKg: 890, deaths: 22 },
  { day: "J28", date: "23 Oct", population: 965, avgWeightG: 1480, cumulativeFeedKg: 1460, deaths: 35 },
  { day: "J35", date: "30 Oct", population: 955, avgWeightG: 1820, cumulativeFeedKg: 2010, deaths: 45 },
  { day: "J42", date: "06 Nov", population: 648, avgWeightG: 2150, cumulativeFeedKg: 2480, deaths: 52 },
];

export function ProductionChart() {
  const [metric, setMetric] = useState<"population" | "avgWeightG" | "cumulativeFeedKg">("population");

  const config = {
    population: {
      label: "Effectif présent",
      unit: "sujets",
      colorLight: "#245747",
      colorDark: "#B9F27C",
      domain: [500, 1050],
      formatter: (val: number) => `${val.toLocaleString("fr-FR")} sujets`,
    },
    avgWeightG: {
      label: "Poids moyen vif",
      unit: "g",
      colorLight: "#A18152",
      colorDark: "#C6A778",
      domain: [0, 2400],
      formatter: (val: number) => `${val.toLocaleString("fr-FR")} g (${(val / 1000).toFixed(2)} kg)`,
    },
    cumulativeFeedKg: {
      label: "Aliment distribué cumulé",
      unit: "kg",
      colorLight: "#355C7D",
      colorDark: "#70A0D0",
      domain: [0, 2800],
      formatter: (val: number) => `${val.toLocaleString("fr-FR")} kg`,
    },
  }[metric];

  return (
    <Card className="lg:col-span-2" data-tour="production-chart">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">
            Dynamique zootechnique — Bande B-2026-014
          </CardTitle>
          <CardDescription className="text-xs">
            Cycle de 45 jours certifié · Ferme Avicole de Kango (Estuaire)
          </CardDescription>
        </div>
        <Tabs
          value={metric}
          onValueChange={(v) => setMetric(v as typeof metric)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 h-8 text-xs">
            <TabsTrigger value="population" className="px-2.5 py-1 text-xs">Effectif</TabsTrigger>
            <TabsTrigger value="avgWeightG" className="px-2.5 py-1 text-xs">Poids</TabsTrigger>
            <TabsTrigger value="cumulativeFeedKg" className="px-2.5 py-1 text-xs">Aliment</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={ZOOTECHNICAL_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                strokeOpacity={0.6}
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
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="font-semibold text-foreground">
                        {item.day} — {item.date} 2026
                      </p>
                      <p className="mt-1 font-mono text-sm font-bold text-foreground">
                        {config.formatter(item[metric])}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Mortalité cumulée : {item.deaths} | Viabilité :{" "}
                        {(((1000 - item.deaths) / 1000) * 100).toFixed(1)} %
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="currentColor"
                strokeWidth={2}
                fill="url(#chartGradient)"
                className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted-foreground">
          <span>Sortie programmée J40 : 300 sujets cédés (Lot LP-2026-000142)</span>
          <span className="font-medium text-foreground">Effectif présent vérifié : 648 sujets</span>
        </div>
      </CardContent>
    </Card>
  );
}


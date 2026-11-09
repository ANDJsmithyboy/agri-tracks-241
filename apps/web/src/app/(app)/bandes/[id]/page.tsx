import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  Info,
  Scale,
  ShieldCheck,
  TrendingUp,
  Truck,
  Wheat,
} from "lucide-react";
import {
  PoufaFlockIcon,
  PoufaPlacementIcon,
  PoufaPopulationIcon,
  PoufaSanitaryIcon,
  PoufaTraceabilityIcon,
  PoufaWeighingIcon,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBandsData } from "@/lib/poufa-queries";

export default async function BandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bands = await getBandsData();
  const band =
    bands.find((b) => b.id === id || b.official_code === id) || bands[0] || {
      id: "b1",
      official_code: "B-2026-014",
      farm_name: "Ferme Pilote KIMBA — Akanda",
      building_label: "Bâtiment A — Chair",
      placement_date: "2026-10-15",
      initial_count: 1000,
      deaths: 52,
      exits: 300,
      current_population: 648,
      status: "active",
    };

  const initialCount = band.initial_count || 1000;
  const deaths = band.deaths || 52;
  const exits = band.exits || 300;
  const currentPop = band.current_population || 648;
  const viabilityPct = (
    ((initialCount - deaths) / initialCount) *
    100
  ).toFixed(1);
  const mortalityPct = ((deaths / initialCount) * 100).toFixed(1);

  // Daily records sample (canonical real sequence)
  const dailyRecords = [
    {
      date: "08 Nov 2026",
      day: "J42",
      deaths: 1,
      population: 648,
      feed: 112.5,
      water: 235,
      notes: "Saisie normale · Comportement calme",
    },
    {
      date: "07 Nov 2026",
      day: "J41",
      deaths: 0,
      population: 649,
      feed: 114.0,
      water: 240,
      notes: "Pesée échantillon 30 sujets : 1 850 g",
    },
    {
      date: "06 Nov 2026",
      day: "J40",
      deaths: 2,
      population: 649,
      feed: 111.0,
      water: 232,
      notes: "Sortie de 300 sujets pour cession (Lot LP-2026-000142)",
    },
    {
      date: "05 Nov 2026",
      day: "J39",
      deaths: 1,
      population: 951,
      feed: 148.0,
      water: 310,
      notes: "Préparation sélection sujets pour abattoir",
    },
    {
      date: "04 Nov 2026",
      day: "J38",
      deaths: 2,
      population: 952,
      feed: 146.5,
      water: 305,
      notes: "RAS · Ventilation active 24°C",
    },
    {
      date: "03 Nov 2026",
      day: "J37",
      deaths: 0,
      population: 954,
      feed: 145.0,
      water: 300,
      notes: "Contrôle vétérinaire de routine — Conforme",
    },
    {
      date: "02 Nov 2026",
      day: "J36",
      deaths: 1,
      population: 954,
      feed: 144.0,
      water: 298,
      notes: "Fin sac de rappel vitamines",
    },
  ];

  // Official weighings
  const weighings = [
    {
      day: "J7",
      date: "22 Oct 2026",
      sample: 30,
      meanWeight: "185 g",
      standardTarget: "180 g",
      delta: "+5 g",
      status: "optimal",
    },
    {
      day: "J14",
      date: "29 Oct 2026",
      sample: 30,
      meanWeight: "430 g",
      standardTarget: "420 g",
      delta: "+10 g",
      status: "optimal",
    },
    {
      day: "J21",
      date: "05 Nov 2026",
      sample: 30,
      meanWeight: "850 g",
      standardTarget: "840 g",
      delta: "+10 g",
      status: "optimal",
    },
    {
      day: "J28",
      date: "12 Nov 2026",
      sample: 35,
      meanWeight: "1 290 g",
      standardTarget: "1 270 g",
      delta: "+20 g",
      status: "optimal",
    },
    {
      day: "J35",
      date: "19 Nov 2026",
      sample: 35,
      meanWeight: "1 680 g",
      standardTarget: "1 660 g",
      delta: "+20 g",
      status: "optimal",
    },
    {
      day: "J42",
      date: "26 Nov 2026",
      sample: 40,
      meanWeight: "1 850 g",
      standardTarget: "1 820 g",
      delta: "+30 g",
      status: "optimal",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ── Breadcrumb & Open Canvas Header ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/bandes"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Bandes d&apos;élevage</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-mono font-medium">
            {band.official_code}
          </span>
        </div>

        <PageHeader
          title={`Bande ${band.official_code}`}
          description={`${band.farm_name} · ${band.building_label} · Mise en place le ${band.placement_date} (J42 / 45)`}
          badge={<Badge variant="brand">En cours · J42</Badge>}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/rapports">
                  <Download className="size-3.5 mr-1.5" />
                  Fiche de lot PDF
                </Link>
              </Button>
              <Button variant="brand" size="sm" asChild>
                <Link href="/saisie">
                  <ClipboardList className="size-3.5 mr-1.5" />
                  Saisie du jour
                </Link>
              </Button>
            </div>
          }
        />
      </div>

      {/* ── Executive Zootechnical Stat Bar (Quiet Luxury) ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Effectif présent
            </span>
            <PoufaPopulationIcon size={16} />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {currentPop}
          </p>
          <p className="text-[10px] text-muted-foreground">
            1 000 - 52 (morts) - 300 (sortis)
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Viabilité
            </span>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-emerald-500">
            {viabilityPct}%
          </p>
          <p className="text-[10px] text-muted-foreground">
            Mortalité cumulée : {mortalityPct}% ({deaths})
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Poids moyen
            </span>
            <PoufaWeighingIcon size={16} />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            1 850 g
          </p>
          <p className="text-[10px] text-emerald-500 font-medium">
            +30 g vs standard Cobb 500
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              GMQ moyen
            </span>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            44.0 g/j
          </p>
          <p className="text-[10px] text-muted-foreground">Gain moyen quotidien</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Indice IC
            </span>
            <Wheat className="size-4 text-amber-500" />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            1.62
          </p>
          <p className="text-[10px] text-muted-foreground">
            Aliment / Gain vif (cible 1.65)
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Âge d&apos;élevage
            </span>
            <Calendar className="size-4 text-muted-foreground" />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            J42
          </p>
          <p className="text-[10px] text-muted-foreground">
            Clôture prévue J45 (+3 j)
          </p>
        </div>
      </section>

      {/* ── Operational Workspace Tabs ── */}
      <Tabs defaultValue="dynamique" className="space-y-6">
        <TabsList className="bg-secondary/40 border border-border p-1">
          <TabsTrigger value="dynamique">Dynamique & Croissance</TabsTrigger>
          <TabsTrigger value="suivi">Relevé quotidien</TabsTrigger>
          <TabsTrigger value="pesees">Pesées d&apos;échantillon</TabsTrigger>
          <TabsTrigger value="sorties">Sorties & Lots</TabsTrigger>
          <TabsTrigger value="cloture">Clôture sanitaire</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: DYNAMIQUE & CROISSANCE ── */}
        <TabsContent value="dynamique" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Growth Curve Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Courbe de croissance pondérale
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Poids vif mesuré (g) comparé à la courbe de référence Cobb
                      500
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-emerald-500" />
                      Élevage réel
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-2.5 rounded-full bg-muted-foreground/40" />
                      Standard Cobb 500
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full flex flex-col justify-between py-2">
                  <div className="relative h-48 w-full">
                    {/* SVG Curve */}
                    <svg
                      viewBox="0 0 600 200"
                      className="size-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      {/* Grid Lines */}
                      <line
                        x1="0"
                        y1="40"
                        x2="600"
                        y2="40"
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeDasharray="4 4"
                      />
                      <line
                        x1="0"
                        y1="90"
                        x2="600"
                        y2="90"
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeDasharray="4 4"
                      />
                      <line
                        x1="0"
                        y1="140"
                        x2="600"
                        y2="140"
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeDasharray="4 4"
                      />

                      {/* Standard Reference Curve (Dashed) */}
                      <path
                        d="M 30,185 Q 180,150 300,105 T 570,35"
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.3"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />

                      {/* Real Growth Curve */}
                      <path
                        d="M 30,185 Q 180,145 300,100 T 570,28"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.5"
                      />

                      {/* Real Data Points */}
                      <circle cx="30" cy="185" r="4.5" fill="#10b981" />
                      <circle cx="120" cy="165" r="4.5" fill="#10b981" />
                      <circle cx="210" cy="140" r="4.5" fill="#10b981" />
                      <circle cx="300" cy="100" r="4.5" fill="#10b981" />
                      <circle cx="390" cy="65" r="4.5" fill="#10b981" />
                      <circle cx="480" cy="40" r="4.5" fill="#10b981" />
                      <circle cx="570" cy="28" r="5.5" fill="#10b981" />
                    </svg>
                  </div>

                  {/* Horizontal Labels */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-2 border-t border-border">
                    <span>J0 (42g)</span>
                    <span>J7 (185g)</span>
                    <span>J14 (430g)</span>
                    <span>J21 (850g)</span>
                    <span>J28 (1 290g)</span>
                    <span>J35 (1 680g)</span>
                    <span className="text-emerald-500 font-semibold">
                      J42 (1 850g)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flock Population Accounting */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Équilibre du cheptel
                </CardTitle>
                <CardDescription className="text-xs">
                  Traçabilité arithmétique rigoureuse
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Poussins mis en place (J0)</span>
                    <span className="font-mono font-semibold">1 000</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Mortalités cumulées</span>
                    <span className="font-mono text-amber-500 font-semibold">
                      - 52 (5.2%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-1.5 border-b border-border">
                    <span className="text-muted-foreground">Présents avant cession</span>
                    <span className="font-mono font-semibold">948</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-1.5 border-b border-border">
                    <span className="text-muted-foreground">
                      Sortie abattoir (Lot LP-142)
                    </span>
                    <span className="font-mono text-primary font-semibold">
                      - 300
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base py-2 font-bold bg-secondary/30 px-3 rounded-lg">
                    <span>Effectif présent actuel</span>
                    <span className="font-mono text-primary text-lg">648</span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1.5 border border-border">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Info className="size-3.5 text-primary" />
                    <span>Événement clé du cycle</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    La sortie de 300 poulets vifs à J40 est enregistrée sous le lot
                    officiel <strong>LP-2026-000142</strong>, certifiée par le
                    vétérinaire provincial et répertoriée dans la chaîne nationale.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 2: RELEVÉ QUOTIDIEN ── */}
        <TabsContent value="suivi" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Journal zootechnique quotidien
                </CardTitle>
                <CardDescription className="text-xs">
                  Relevés de terrain saisis sur mobile ou portail web
                </CardDescription>
              </div>
              <Button size="sm" variant="brand" asChild>
                <Link href="/saisie">
                  <ClipboardList className="size-3.5 mr-1.5" />
                  Nouvelle saisie
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30">
                      <TableHead>Date & Âge</TableHead>
                      <TableHead className="text-right">Mortalités</TableHead>
                      <TableHead className="text-right">Effectif</TableHead>
                      <TableHead className="text-right">Aliment (kg)</TableHead>
                      <TableHead className="text-right">Eau (L)</TableHead>
                      <TableHead>Observations & Événements</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyRecords.map((r, i) => (
                      <TableRow key={i} className="hover:bg-secondary/20">
                        <TableCell className="font-medium">
                          <div className="font-semibold">{r.date}</div>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {r.day}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span
                            className={
                              r.deaths > 1
                                ? "text-amber-500 font-bold"
                                : "text-muted-foreground"
                            }
                          >
                            {r.deaths}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {r.population}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {r.feed.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {r.water}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {r.notes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: PESÉES D'ÉCHANTILLON ── */}
        <TabsContent value="pesees" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Contrôles de poids périodiques
              </CardTitle>
              <CardDescription className="text-xs">
                Protocole de pesée sur échantillon de 30 à 40 sujets par bâtiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30">
                      <TableHead>Âge</TableHead>
                      <TableHead>Date du contrôle</TableHead>
                      <TableHead className="text-right">Échantillon</TableHead>
                      <TableHead className="text-right">Poids moyen</TableHead>
                      <TableHead className="text-right">Cible Cobb 500</TableHead>
                      <TableHead className="text-right">Écart</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weighings.map((w, i) => (
                      <TableRow key={i} className="hover:bg-secondary/20">
                        <TableCell className="font-mono font-bold">
                          {w.day}
                        </TableCell>
                        <TableCell className="text-xs">{w.date}</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {w.sample} sujets
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {w.meanWeight}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {w.standardTarget}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-500 font-semibold">
                          {w.delta}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-[10px]">
                            Conforme
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: SORTIES & LOTS ── */}
        <TabsContent value="sorties" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Lots issus de cette bande
              </CardTitle>
              <CardDescription className="text-xs">
                Cessions d&apos;animaux vifs, transferts vers abattoir et attestations de traçabilité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border p-4 bg-secondary/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PoufaTraceabilityIcon size={18} />
                    <span className="font-mono font-bold text-foreground">
                      LP-2026-000142
                    </span>
                    <Badge variant="brand">Cession certifiée</Badge>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/tracabilite">
                      Détails de traçabilité
                      <ChevronRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Quantité cédée</span>
                    <span className="font-mono font-semibold text-foreground">300 sujets vifs</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Destinataire</span>
                    <span className="font-semibold text-foreground">Abattoir Municipal Libreville</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Date d&apos;expédition</span>
                    <span className="text-foreground">06 Nov 2026</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Transporteur</span>
                    <span className="text-foreground">TransAgri-Gabon (Camion n° 4)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: CLÔTURE SANITAIRE ── */}
        <TabsContent value="cloture" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Protocole de fin d&apos;élevage & Vide sanitaire
              </CardTitle>
              <CardDescription className="text-xs">
                Checklist réglementaire avant l&apos;accueil de la prochaine bande
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {[
                  {
                    title: "Sortie finale du cheptel (648 sujets restants)",
                    desc: "Programmée à J45 (11 Nov 2026) vers abattoir KIMBA",
                    done: false,
                  },
                  {
                    title: "Curage complet des litières",
                    desc: "Évacuation des déjections et compostage sécurisé",
                    done: false,
                  },
                  {
                    title: "Lavage haute pression & détergence",
                    desc: "Nettoyage sols, parois, mangeoires et abreuvoirs",
                    done: false,
                  },
                  {
                    title: "Désinfection homologuée DGE",
                    desc: "Pulvérisation virucide et bactéricide agréée",
                    done: false,
                  },
                  {
                    title: "Vide sanitaire réglementaire de 14 jours",
                    desc: "Période d'inoccupation stricte pour rupture des cycles pathogènes",
                    done: false,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-border p-3 bg-card"
                  >
                    <div className="size-5 rounded border border-muted-foreground/30 flex items-center justify-center shrink-0 mt-0.5">
                      {item.done ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

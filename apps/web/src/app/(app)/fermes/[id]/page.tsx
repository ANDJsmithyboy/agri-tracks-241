import Link from "next/link";
import {
  ArrowLeft,
  Building,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Coins,
  FileCheck,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import {
  PoufaFarmIcon,
  PoufaFlockIcon,
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
import { getFarmsData } from "@/lib/poufa-queries";

export default async function FermeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const farms = await getFarmsData();
  const farm =
    farms.find((f) => f.id === id || f.official_code === id) || farms[0] || {
      id: "11111111-2222-3333-4444-555555555501",
      official_code: "GA-EST-2026-001",
      name: "Ferme Pilote KIMBA — Akanda",
      province: "Estuaire",
      locality: "Akanda",
      farming_type: "Chair",
      building_count_declared: 3,
      status: "active",
      active_band_code: "B-2026-014",
      current_population: 648,
    };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Breadcrumb & Open Canvas Header ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/fermes"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Exploitations avicoles</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-mono font-medium">
            {farm.official_code}
          </span>
        </div>

        <PageHeader
          title={farm.name}
          description={`Identifiant national ${farm.official_code} · ${farm.locality}, Province de ${farm.province} · Type : Poulet de ${farm.farming_type.toLowerCase()}`}
          badge={<Badge variant="brand">Exploitation active</Badge>}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/bandes/${farm.active_band_code || "B-2026-014"}`}>
                  <PoufaFlockIcon size={14} className="mr-1.5" />
                  Bande active ({farm.active_band_code || "B-2026-014"})
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

      {/* ── Key Metrics Bar ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Cheptel en cours
            </span>
            <PoufaPopulationIcon size={16} />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {farm.current_population || 648}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Bande {farm.active_band_code || "B-2026-014"} · J42
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Capacité autorisée
            </span>
            <Building className="size-4 text-primary" />
          </div>
          <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
            5 000
          </p>
          <p className="text-[10px] text-muted-foreground">
            {farm.building_count_declared || 2} bâtiments opérationnels
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Statut sanitaire
            </span>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <p className="text-base font-bold text-emerald-500">
            Conforme DGE
          </p>
          <p className="text-[10px] text-muted-foreground">
            Dernière visite : 03 Nov 2026
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Financement BCEG
            </span>
            <Coins className="size-4 text-amber-500" />
          </div>
          <p className="text-base font-bold text-foreground">
            Tranche 1 décaissée
          </p>
          <p className="text-[10px] text-muted-foreground">
            Dossier BCEG-2026-042
          </p>
        </div>
      </section>

      {/* ── Tabs Content ── */}
      <Tabs defaultValue="apercu" className="space-y-6">
        <TabsList className="bg-secondary/40 border border-border p-1">
          <TabsTrigger value="apercu">Fiche d&apos;identité</TabsTrigger>
          <TabsTrigger value="infrastructure">Bâtiments & Capacité</TabsTrigger>
          <TabsTrigger value="bandes">Bandes d&apos;élevage</TabsTrigger>
          <TabsTrigger value="financement">Financement & Agréments</TabsTrigger>
          <TabsTrigger value="equipe">Équipe & Contacts</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: IDENTITÉ ── */}
        <TabsContent value="apercu" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Caractéristiques officielles
                </CardTitle>
                <CardDescription className="text-xs">
                  Données certifiées dans le registre national POUFA
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 border-b border-border pb-2.5">
                  <span className="text-xs text-muted-foreground">Raison sociale / Nom</span>
                  <p className="text-sm font-semibold">{farm.name}</p>
                </div>
                <div className="space-y-1 border-b border-border pb-2.5">
                  <span className="text-xs text-muted-foreground">Code officiel POUFA</span>
                  <p className="text-sm font-mono font-bold text-primary">{farm.official_code}</p>
                </div>
                <div className="space-y-1 border-b border-border pb-2.5">
                  <span className="text-xs text-muted-foreground">Province & Localité</span>
                  <p className="text-sm font-semibold">{farm.province} · {farm.locality}</p>
                </div>
                <div className="space-y-1 border-b border-border pb-2.5">
                  <span className="text-xs text-muted-foreground">Coordonnées géographiques</span>
                  <p className="text-sm font-mono text-muted-foreground">0.3842° N, 9.4538° E</p>
                </div>
                <div className="space-y-1 border-b border-border pb-2.5">
                  <span className="text-xs text-muted-foreground">Type de production</span>
                  <p className="text-sm font-semibold">Poulet de chair (Cycle standard 45 jours)</p>
                </div>
                <div className="space-y-1 border-b border-border pb-2.5">
                  <span className="text-xs text-muted-foreground">Capacité totale déclarée</span>
                  <p className="text-sm font-mono font-semibold">5 000 sujets simultanés</p>
                </div>
                <div className="space-y-1 border-b border-border pb-2.5">
                  <span className="text-xs text-muted-foreground">Date d&apos;enregistrement</span>
                  <p className="text-sm">12 Janvier 2026</p>
                </div>
                <div className="space-y-1 border-b border-border pb-2.5">
                  <span className="text-xs text-muted-foreground">Cohorte de rattachement</span>
                  <p className="text-sm font-semibold">Cohorte 1 — Estuaire / Grand Libreville</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Activité récente
                </CardTitle>
                <CardDescription className="text-xs">
                  Derniers événements enregistrés
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {[
                  {
                    title: "Saisie quotidienne J42",
                    desc: "1 mortalité, 112.5 kg aliment",
                    time: "Aujourd'hui à 07:45",
                    icon: ClipboardList,
                  },
                  {
                    title: "Cession Lot LP-2026-000142",
                    desc: "300 sujets vifs vers abattoir",
                    time: "06 Nov 2026",
                    icon: PoufaTraceabilityIcon,
                  },
                  {
                    title: "Livraison provende SMAG",
                    desc: "1 200 kg Aliment Croissance",
                    time: "02 Nov 2026",
                    icon: FileCheck,
                  },
                  {
                    title: "Pesée officielle J35",
                    desc: "35 sujets pesés — Moyenne 1 680 g",
                    time: "30 Oct 2026",
                    icon: PoufaWeighingIcon,
                  },
                ].map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div key={idx} className="flex gap-3 items-start text-xs">
                      <div className="size-6 rounded-md bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={13} className="text-primary" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {act.title}
                        </p>
                        <p className="text-muted-foreground">{act.desc}</p>
                        <span className="text-[10px] text-muted-foreground/70 font-mono block">
                          {act.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 2: INFRASTRUCTURE ── */}
        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Bâtiments d&apos;élevage & Équipements
              </CardTitle>
              <CardDescription className="text-xs">
                Infrastructures inspectées et homologuées par les services techniques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4 space-y-3 bg-secondary/10">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Bâtiment A — Chair</span>
                    <Badge variant="brand">En cours d&apos;élevage</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Capacité utile</span>
                      <span className="font-mono font-semibold">2 500 places</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Surface utile</span>
                      <span className="font-mono font-semibold">250 m²</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Ventilation</span>
                      <span>Dynamique tunnel</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Bande logée</span>
                      <span className="font-mono text-primary font-semibold">B-2026-014</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4 space-y-3 bg-secondary/10">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Bâtiment B — Chair</span>
                    <Badge variant="secondary">En vide sanitaire</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Capacité utile</span>
                      <span className="font-mono font-semibold">2 500 places</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Surface utile</span>
                      <span className="font-mono font-semibold">250 m²</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Ventilation</span>
                      <span>Statique avec brasseurs</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Prochaine mise en place</span>
                      <span className="text-foreground">20 Nov 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: BANDES ── */}
        <TabsContent value="bandes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Historique des bandes d&apos;élevage
                </CardTitle>
                <CardDescription className="text-xs">
                  Bandes actives et cycles clôturés avec bilans zootechniques
                </CardDescription>
              </div>
              <Button size="sm" variant="brand" asChild>
                <Link href="/saisie">
                  <Plus className="size-3.5 mr-1" />
                  Mettre en place une bande
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30">
                      <TableHead>Code officiel</TableHead>
                      <TableHead>Bâtiment</TableHead>
                      <TableHead>Mise en place</TableHead>
                      <TableHead className="text-right">Placés</TableHead>
                      <TableHead className="text-right">Présents</TableHead>
                      <TableHead className="text-right">Viabilité</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-secondary/20">
                      <TableCell className="font-mono font-bold text-primary">
                        B-2026-014
                      </TableCell>
                      <TableCell className="text-xs">Bâtiment A</TableCell>
                      <TableCell className="text-xs">15 Oct 2026 (J42)</TableCell>
                      <TableCell className="text-right font-mono">1 000</TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        648
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-500 font-semibold">
                        94.8%
                      </TableCell>
                      <TableCell>
                        <Badge variant="brand">En cours</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/bandes/B-2026-014">
                            Consulter
                            <ChevronRight className="size-3.5 ml-1" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>

                    <TableRow className="hover:bg-secondary/20 text-muted-foreground">
                      <TableCell className="font-mono font-medium">
                        B-2025-088
                      </TableCell>
                      <TableCell className="text-xs">Bâtiment A</TableCell>
                      <TableCell className="text-xs">01 Août 2026 (45j)</TableCell>
                      <TableCell className="text-right font-mono">1 000</TableCell>
                      <TableCell className="text-right font-mono">0</TableCell>
                      <TableCell className="text-right font-mono text-emerald-500">
                        95.6%
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Clôturée</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/bandes/B-2025-088">
                            Bilan final
                            <ChevronRight className="size-3.5 ml-1" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: FINANCEMENT ── */}
        <TabsContent value="financement" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Financement BCEG & Dossier de conventionnement
              </CardTitle>
              <CardDescription className="text-xs">
                Suivi du prêt d&apos;amorçage, garanties et décaissements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-3 space-y-1">
                  <span className="text-xs text-muted-foreground">Montant accordé</span>
                  <p className="font-mono text-lg font-bold text-foreground">
                    15 000 000 XAF
                  </p>
                  <p className="text-[10px] text-muted-foreground">Taux bonifié 4.5%</p>
                </div>
                <div className="rounded-lg border border-border p-3 space-y-1">
                  <span className="text-xs text-muted-foreground">Tranche décaissée</span>
                  <p className="font-mono text-lg font-bold text-emerald-500">
                    10 000 000 XAF (66%)
                  </p>
                  <p className="text-[10px] text-muted-foreground">Tranche 1 (Installation + 1er cycle)</p>
                </div>
                <div className="rounded-lg border border-border p-3 space-y-1">
                  <span className="text-xs text-muted-foreground">Tranche restante</span>
                  <p className="font-mono text-lg font-bold text-muted-foreground">
                    5 000 000 XAF
                  </p>
                  <p className="text-[10px] text-muted-foreground">Conditionnée au bilan du cycle 1</p>
                </div>
              </div>

              <div className="rounded-lg bg-secondary/15 p-3 text-xs space-y-1 border border-border">
                <span className="font-semibold text-foreground">Attestation d&apos;agrément ministériel</span>
                <p className="text-muted-foreground">
                  Ferme enregistrée au répertoire national avicole sous l&apos;agrément officiel DGE/2026/0142.
                  Audit de conformité technique validé le 12 Janvier 2026.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: ÉQUIPE ── */}
        <TabsContent value="equipe" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Membres & Encadrement technique
              </CardTitle>
              <CardDescription className="text-xs">
                Acteurs autorisés à intervenir et saisir des données sur cette exploitation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Marc Ndong Mengue</p>
                      <span className="text-[11px] text-muted-foreground">Responsable d&apos;exploitation</span>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">+241 07 45 12 89</p>
                </div>

                <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold">Dr. Jean-Pierre Ekomi</p>
                      <span className="text-[11px] text-muted-foreground">Docteur Vétérinaire mandaté</span>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">+241 06 22 84 90</p>
                </div>

                <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold">Patrick Ondo</p>
                      <span className="text-[11px] text-muted-foreground">Technicien DGE / POUFA</span>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">+241 07 88 33 11</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

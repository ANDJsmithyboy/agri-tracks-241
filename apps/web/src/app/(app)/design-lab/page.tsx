"use client";

import { useState } from "react";
import {
  ArrowUp,
  Check,
  ChevronRight,
  Download,
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  PoufaAiSymbol,
  PoufaAnalyticsIcon,
  PoufaFarmIcon,
  PoufaFeedIcon,
  PoufaFlockIcon,
  PoufaInventoryIcon,
  PoufaPlacementIcon,
  PoufaPopulationIcon,
  PoufaQrVerifyIcon,
  PoufaSanitaryIcon,
  PoufaSyncOfflineIcon,
  PoufaTeamIcon,
  PoufaTraceabilityIcon,
  PoufaTransferIcon,
  PoufaTreatmentIcon,
  PoufaWeighingIcon,
} from "@/components/brand-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ICONS_SPECIMENS = [
  { name: "PoufaFarmIcon", icon: PoufaFarmIcon, domain: "Exploitation avicole", desc: "Façade d'élevage avec lanterneau de ventilation haute et porte de biosécurité" },
  { name: "PoufaFlockIcon", icon: PoufaFlockIcon, domain: "Bande avicole", desc: "Sujets groupés en perspective zootechnique, silhouette d'arche ovoïde" },
  { name: "PoufaPopulationIcon", icon: PoufaPopulationIcon, domain: "Effectif présent", desc: "Cadre de décompte certifié avec graduations de registre numérique" },
  { name: "PoufaPlacementIcon", icon: PoufaPlacementIcon, domain: "Mise en place", desc: "Éleveuse thermique radiante et poussin en phase de démarrage" },
  { name: "PoufaWeighingIcon", icon: PoufaWeighingIcon, domain: "Pesée en direct", desc: "Peson dynamométrique suspendu avec plateau de pesée avicole" },
  { name: "PoufaFeedIcon", icon: PoufaFeedIcon, domain: "Aliment & rations", desc: "Silo conique d'élevage avec goulotte de distribution et grain calibré" },
  { name: "PoufaInventoryIcon", icon: PoufaInventoryIcon, domain: "Intrants & stocks", desc: "Palette d'aliments et registre d'approvisionnement sécurisé" },
  { name: "PoufaSanitaryIcon", icon: PoufaSanitaryIcon, domain: "Observation sanitaire", desc: "Bouclier de biosécurité et croix de contrôle vétérinaire" },
  { name: "PoufaTreatmentIcon", icon: PoufaTreatmentIcon, domain: "Traitement & vaccin", desc: "Seringue automatique calibrée avec graduations de prophylaxie" },
  { name: "PoufaTransferIcon", icon: PoufaTransferIcon, domain: "Cession & transferts", desc: "Liaison logistique nœud-à-nœud avec flux directionnel certifié" },
  { name: "PoufaTraceabilityIcon", icon: PoufaTraceabilityIcon, domain: "Traçabilité des lots", desc: "Maillage géométrique Motif B avec point de certification central" },
  { name: "PoufaQrVerifyIcon", icon: PoufaQrVerifyIcon, domain: "Vérification QR", desc: "Coins optiques avec matrice certifiée et sceau de conformité" },
  { name: "PoufaSyncOfflineIcon", icon: PoufaSyncOfflineIcon, domain: "Synchronisation Room", desc: "Double boucle asynchrone avec nœud local SQLite/Neon persistant" },
  { name: "PoufaAnalyticsIcon", icon: PoufaAnalyticsIcon, domain: "Analytique & GMQ", desc: "Courbe de croissance pondérale avec points de pesée zootechnique" },
  { name: "PoufaTeamIcon", icon: PoufaTeamIcon, domain: "Équipe & éleveurs", desc: "Éleveur principal et technicien de zone avec insigne d'exploitation" },
  { name: "PoufaAiSymbol", icon: PoufaAiSymbol, domain: "POUFA AI DeepSeek", desc: "Contour ovoïde Motif A avec matrice neurale et connecteurs d'inférence" },
];

export default function DesignLabPage() {
  const [selectedSize, setSelectedSize] = useState<16 | 20 | 24 | 36>(24);
  const [composerInput, setComposerInput] = useState("");

  return (
    <div className="space-y-12 pb-16">
      {/* 01 — Executive Header (Open Canvas) */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Revue Produit · Sprint Novembre 2026
              </span>
              <Badge variant="brand">Interne · Non public</Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              POUFA Design Lab
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Registre officiel de direction artistique, typographie Geist, matériaux Royal Cream × Obsidian Neon et famille SVG propriétaire <strong>POUFA Field Symbols</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/tableau-de-bord">← Retour au Tableau de bord</a>
            </Button>
          </div>
        </div>
      </section>

      {/* 02 — Les Deux Matériaux Officiels */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          <span>01. Matériaux & Tokens Chromatiques</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Royal Cream Specimen */}
          <div className="rounded-xl border border-border bg-[#F5F0E7] p-5 text-[#28251F] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DCCE]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#A18152]">Thème Clair</p>
                <h3 className="text-base font-semibold text-[#28251F]">Royal Cream — Luxe Éditorial</h3>
              </div>
              <span className="rounded-md border border-[#E4DCCE] bg-[#FFFCF7] px-2 py-1 text-[11px] font-mono">#F5F0E7</span>
            </div>
            <p className="mt-3 text-xs text-[#777168] leading-relaxed">
              Crème royal chaleureux, ivoire noble, typographie encre bistre et accents vert forêt mesurés. Zéro fond vert pâle uniforme.
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="rounded border border-[#E4DCCE] bg-[#FFFCF7] p-2 text-center text-[#28251F]">#FFFCF7<br/><span className="text-[9px] text-[#777168]">Card</span></div>
              <div className="rounded border border-[#E4DCCE] bg-[#EEE7DC] p-2 text-center text-[#28251F]">#EEE7DC<br/><span className="text-[9px] text-[#777168]">Sidebar</span></div>
              <div className="rounded border border-[#E4DCCE] bg-[#245747] p-2 text-center text-white">#245747<br/><span className="text-[9px] text-[#A18152]">Forest</span></div>
              <div className="rounded border border-[#E4DCCE] bg-[#A18152] p-2 text-center text-white">#A18152<br/><span className="text-[9px]">Gold</span></div>
            </div>
          </div>

          {/* Obsidian Neon Specimen */}
          <div className="rounded-xl border border-[#30343A] bg-[#0B0D10] p-5 text-[#F3F0E9] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#30343A]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#B9F27C]">Thème Sombre</p>
                <h3 className="text-base font-semibold text-[#F3F0E9]">Obsidian Neon — Instrument de Précision</h3>
              </div>
              <span className="rounded-md border border-[#30343A] bg-[#17191D] px-2 py-1 text-[11px] font-mono text-[#F3F0E9]">#0B0D10</span>
            </div>
            <p className="mt-3 text-xs text-[#A3A5AA] leading-relaxed">
              Noir obsidienne profond, surfaces graphite ivoire, typographie calibrée et vert néon chirurgical pour les signaux d&apos;exception.
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="rounded border border-[#30343A] bg-[#17191D] p-2 text-center text-[#F3F0E9]">#17191D<br/><span className="text-[9px] text-[#A3A5AA]">Card</span></div>
              <div className="rounded border border-[#30343A] bg-[#101216] p-2 text-center text-[#F3F0E9]">#101216<br/><span className="text-[9px] text-[#A3A5AA]">Sidebar</span></div>
              <div className="rounded border border-[#30343A] bg-[#B9F27C] p-2 text-center text-[#101216]">#B9F27C<br/><span className="text-[9px] font-bold">Neon</span></div>
              <div className="rounded border border-[#30343A] bg-[#8BC49B] p-2 text-center text-[#101216]">#8BC49B<br/><span className="text-[9px]">Accent</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — POUFA Field Symbols (16 Pictogrammes Propriétaires) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              02. POUFA Field Symbols — Système d&apos;Iconographie Propriétaire
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              16 symboles vectoriels originaux sur grille 24×24 px, épaisseur optique 1,75 px. Conçus pour remplacer l&apos;iconographie SaaS générique.
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border p-1 bg-card text-xs">
            <span className="px-2 text-muted-foreground text-[11px]">Taille optique :</span>
            {([16, 20, 24, 36] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSize(s)}
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  selectedSize === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}px
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ICONS_SPECIMENS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-[var(--brand-green)] dark:hover:border-[var(--brand-neon)] hover:shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center size-12 rounded-lg border border-border/80 bg-secondary/40 text-foreground transition-colors group-hover:text-[var(--brand-green)] dark:group-hover:text-[var(--brand-neon)]">
                    <Icon size={selectedSize} strokeWidth={1.75} />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{selectedSize}px</span>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold text-foreground tracking-tight">{item.domain}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground/90 leading-tight pt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 04 — Typographie & Chiffres Zootechniques */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          03. Typographie & Précision Numérique
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Executive Figure */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Effectif Actuel Certifié
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight tabular-nums text-foreground">
                648
              </span>
              <span className="text-xs font-medium text-muted-foreground">sujets vivants</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
              Arithmétique : 700 placés − 36 mortalités − 16 retraits
            </p>
          </div>

          {/* Biomass Figure */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Biomasse Zootechnique
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight tabular-nums text-foreground">
                2,15
              </span>
              <span className="text-xs font-medium text-muted-foreground">kg / sujet (GMQ 47,8 g/j)</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
              Conformité Ross 308 : +1,8 % par rapport au standard
            </p>
          </div>

          {/* Traceability Reference */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Identifiant Traçabilité
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                LP-2026-000142
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
              Ferme Kango · Bande B-2026-014 · 300 sujets certifiés
            </p>
          </div>
        </div>
      </section>

      {/* 05 — Primitives & Spécimens de Contrôles */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          04. Primitives & Contrôles
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Boutons & États */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Hiérarchie des Actions</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="brand" size="sm">
                Action Principale
              </Button>
              <Button variant="default" size="sm">
                Default
              </Button>
              <Button variant="secondary" size="sm">
                Secondary
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="size-3.5 mr-1" />
                Filtrer
              </Button>
              <Button variant="ghost" size="sm">
                Annuler
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
              <Badge variant="brand">Certifié serveur</Badge>
              <Badge variant="secondary">Provisoire hors-ligne</Badge>
              <Badge variant="outline">En cours (J+34)</Badge>
              <Badge variant="destructive">Alerte sanitaire</Badge>
            </div>
          </div>

          {/* POUFA AI Composer Specimen */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <PoufaAiSymbol size={16} className="text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
                POUFA AI Composer
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">Flèche Up · Entrée pour envoyer</span>
            </div>
            <div className="relative flex items-center rounded-xl border border-border bg-secondary/30 p-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
              <input
                type="text"
                value={composerInput}
                onChange={(e) => setComposerInput(e.target.value)}
                placeholder="Posez une question sur vos bandes, mortalités ou consommations…"
                className="w-full bg-transparent px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
              />
              <button
                type="button"
                disabled={!composerInput.trim()}
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Bouton circulaire d&apos;envoi centré optiquement avec flèche vers le haut, retour visuel immédiat.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


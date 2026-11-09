import React from "react";

export interface PoufaIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
  title?: string;
}

/**
 * POUFA Field Symbols — Système d'iconographie propriétaire 2026
 * Grille : 24x24 px nominal | Trait optique : ~1.75 px
 * Conçu pour l'ingénierie avicole gabonaise (SmartANDJ · POUFA)
 */

/** 01 — Exploitation / Bâtiment d'élevage avicole avec lanterneau */
export function PoufaFarmIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Exploitation avicole",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Façade bâtiment principal */}
      <path d="M3 20V9.5L12 3l9 6.5V20H3Z" />
      {/* Lanterneau de ventilation d'élevage */}
      <path d="M8.5 5.5h7v2.5h-7z" />
      {/* Porte double de stabulation / accès biosécurité */}
      <path d="M9.5 20v-6h5v6" />
      {/* Ligne de sol stabilisée */}
      <path d="M2 20h20" />
    </svg>
  );
}

/** 02 — Bande avicole / Lot d'oiseaux groupés */
export function PoufaFlockIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Bande avicole",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Sujet principal au premier plan */}
      <path d="M8 18c-2.5 0-4.5-2-4.5-4.5 0-1.8 1.1-3.4 2.7-4.1C6.8 7.3 8.3 6 10.2 6c1.7 0 3.2 1.1 3.7 2.6 1.4.3 2.6 1.4 2.9 2.9.2.7.2 1.4 0 2" />
      <path d="M10 18v3m-3 0h6" />
      <circle cx="10" cy="9.5" r=".75" fill="currentColor" stroke="none" />
      {/* Sujet secondaire d'arrière-plan formant le lot */}
      <path d="M14.5 8c.7-.6 1.6-1 2.5-1 1.9 0 3.5 1.6 3.5 3.5 0 .8-.3 1.6-.8 2.2 1.1.7 1.8 1.9 1.8 3.3 0 1.1-.5 2.1-1.3 2.8" />
    </svg>
  );
}

/** 03 — Effectif d'oiseaux / Décompte certifié */
export function PoufaPopulationIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Effectif présent",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Cadre de comptage zootechnique */}
      <rect x="3" y="4" width="18" height="16" rx="3" />
      {/* Silhouette avicole géométrisée */}
      <path d="M7 15c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <circle cx="11" cy="8.5" r="2" />
      {/* Indicateur de registre numérique */}
      <path d="M17 8h1m-1 3.5h1m-1 3.5h1" />
    </svg>
  );
}

/** 04 — Mise en place poussins / Démarrage & éleveuse */
export function PoufaPlacementIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Mise en place poussins",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Radiant thermique / éleveuse de démarrage */}
      <path d="M5 6c2-2 12-2 14 0" />
      <path d="M12 2v4" />
      {/* Coquille / nid de démarrage */}
      <path d="M4 14c0 4.4 3.6 8 8 8s8-3.6 8-8" />
      {/* Poussin naissant au centre */}
      <path d="M10 14a2 2 0 1 1 4 0v2H10v-2Z" />
      <path d="M14 13l2-1-2 2" />
      {/* Rayonnement thermique */}
      <path d="M8.5 9l-1 2m9-2l1 2" strokeDasharray="1 2" />
    </svg>
  );
}

/** 05 — Pesée en direct / Poids vif et peson de précision */
export function PoufaWeighingIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Pesée du troupeau",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Anneau de suspension peson */}
      <circle cx="12" cy="4" r="2" />
      {/* Cadran dynamométrique */}
      <circle cx="12" cy="11" r="4.5" />
      <path d="M12 9.5v2l1.5 1" />
      {/* Crochet inférieur */}
      <path d="M12 15.5v3a1.5 1.5 0 0 0 3 0" />
      {/* Plateau de pesée avicole suspendu */}
      <path d="M6 21.5h12" />
    </svg>
  );
}

/** 06 — Alimentation & rations / Silo et grains calibrés */
export function PoufaFeedIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Aliment & rations",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Silo conique d'élevage */}
      <path d="M6 3h12v10l-6 6-6-6V3Z" />
      {/* Pieds du silo */}
      <path d="M6 13v8m12-8v8" />
      {/* Goulotte de distribution */}
      <path d="M12 19v3" />
      {/* Ligne de niveau d'aliment */}
      <path d="M6 8h12" />
      {/* Grain / ration calibrée */}
      <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 07 — Intrants & stocks / Registre d'approvisionnement */
export function PoufaInventoryIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Intrants & stocks",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Palette d'intrants en stock */}
      <path d="M3 19h18M5 19v2m14-2v2" />
      {/* Sacs d'aliments et intrants empilés */}
      <rect x="5" y="11" width="14" height="8" rx="2" />
      <path d="M8 11V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" />
      <path d="M9 15h6" />
    </svg>
  );
}

/** 08 — Observation sanitaire / Contrôle vétérinaire */
export function PoufaSanitaryIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Contrôle sanitaire",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Bouclier de biosécurité */}
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      {/* Croix de santé vétérinaire stylisée */}
      <path d="M12 8v8m-4-4h8" />
    </svg>
  );
}

/** 09 — Traitement & vaccination / Prophylaxie avicole */
export function PoufaTreatmentIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Traitement & vaccination",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Seringue automatique orientée à 45° */}
      <path d="m18 2 4 4" />
      <path d="m15 5 4 4" />
      <path d="m19 9-8.5 8.5a2.12 2.12 0 0 1-3 0l-1-1a2.12 2.12 0 0 1 0-3L15 5" />
      <path d="m9 15-4 4H2v-3l4-4" />
      {/* Graduations de dose zootechnique */}
      <path d="m11 9 2 2m-4 0 2 2" />
    </svg>
  );
}

/** 10 — Cession & transfert de sujets / Mouvement vivant */
export function PoufaTransferIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Cession & transferts",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Nœud ferme émettrice */}
      <circle cx="5" cy="12" r="3" />
      {/* Nœud destinataire / abattoir */}
      <circle cx="19" cy="12" r="3" />
      {/* Flux de transfert avec flèche centrale */}
      <path d="M8 12h8m-3-3 3 3-3 3" />
      {/* Arc de liaison logistique */}
      <path d="M5 9a7 7 0 0 1 14 0" strokeDasharray="2 2" />
    </svg>
  );
}

/** 11 — Traçabilité des lots / Maillage nœud-trajet géométrique */
export function PoufaTraceabilityIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Traçabilité des lots",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Motif B : Connecteurs géométriques et nœuds certifiés */}
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      {/* Trajet continu de traçabilité */}
      <path d="M8.5 6h7M7.5 8.5l3.5 7m5.5-7-3.5 7" />
      {/* Point de certification central */}
      <circle cx="12" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 12 — Vérification QR / Sceau d'authenticité */
export function PoufaQrVerifyIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Vérification QR",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* 4 coins du QR code optique */}
      <path d="M3 8V5a2 2 0 0 1 2-2h3m8 0h3a2 2 0 0 1 2 2v3m0 8v3a2 2 0 0 1-2 2h-3m-8 0H5a2 2 0 0 1-2-2v-3" />
      {/* Matrice interne certifiée */}
      <rect x="7" y="7" width="3" height="3" fill="currentColor" />
      <rect x="14" y="7" width="3" height="3" fill="currentColor" />
      <rect x="7" y="14" width="3" height="3" fill="currentColor" />
      {/* Sceau de conformité */}
      <path d="m13 14 1.5 1.5 2.5-2.5" />
    </svg>
  );
}

/** 13 — Synchronisation hors ligne / Idempotence Room <-> Serveur */
export function PoufaSyncOfflineIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Synchronisation offline-first",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Boucle de synchronisation asynchrone */}
      <path d="M20 11A8 8 0 0 0 6.34 6.34L3 9" />
      <path d="M3 4v5h5" />
      <path d="M4 13a8 8 0 0 0 13.66 4.66L21 15" />
      <path d="M21 20v-5h-5" />
      {/* Nœud central persistant (Room SQLite / Neon) */}
      <circle cx="12" cy="12" r="1.75" fill="currentColor" />
    </svg>
  );
}

/** 14 — Performance zootechnique & analytique */
export function PoufaAnalyticsIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Performances & analyses",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Axes zootechniques */}
      <path d="M3 21h18M3 3v18" />
      {/* Courbe de croissance Ross / Cobb */}
      <path d="m6 16 5-5 4 2 6-8" />
      {/* Points de contrôle de pesée */}
      <circle cx="11" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
      <circle cx="21" cy="5" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** 15 — Équipe d'exploitation & éleveurs */
export function PoufaTeamIcon({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "Équipe d'exploitation",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Éleveur principal */}
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      {/* Technicien associé */}
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/** 16 — POUFA AI — Matrice neurale avicole & intelligence souveraine */
export function PoufaAiSymbol({
  size = 20,
  className = "",
  strokeWidth = 1.75,
  title = "POUFA AI",
  ...props
}: PoufaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* Contour ovoïde organique (Motif A) */}
      <path d="M12 2C7.5 2 4 6.5 4 12.5c0 4.5 3.5 8.5 8 8.5s8-4 8-8.5C20 6.5 16.5 2 12 2Z" />
      {/* Nœuds synaptiques d'analyse zootechnique */}
      <circle cx="12" cy="7" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="13" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="13" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17" r="1.25" fill="currentColor" stroke="none" />
      {/* Connecteurs d'inférence DeepSeek */}
      <path d="m12 7-3.5 6h7L12 7Zm0 10-3.5-4h7L12 17Z" strokeWidth={1.25} />
    </svg>
  );
}


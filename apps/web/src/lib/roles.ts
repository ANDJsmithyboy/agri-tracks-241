/**
 * Rôles utilisateurs POUFA — alignés sur le cahier des charges.
 * Le mapping rôle → permissions réelles sera appliqué côté API (Clerk + backend).
 * Ici, il s'agit uniquement de la visibilité de navigation côté UI.
 */
export const ROLES = [
  "agriculteur",
  "technicien",
  "coordinateur",
  "veterinaire",
  "bceg",
  "aninf",
  "administrateur",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  agriculteur: "Éleveur",
  technicien: "Technicien de terrain",
  coordinateur: "Coordinateur DGE / POUFA",
  veterinaire: "Vétérinaire",
  bceg: "BCEG",
  aninf: "Auditeur ANINF",
  administrateur: "Administrateur",
};

export const DEFAULT_ROLE: Role = "coordinateur";

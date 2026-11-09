import type React from "react";
import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
  ScrollText,
  Settings,
  ShieldCheck,
  Table2,
  Upload,
} from "lucide-react";
import {
  PoufaAiSymbol,
  PoufaAnalyticsIcon,
  PoufaFarmIcon,
  PoufaFlockIcon,
  PoufaInventoryIcon,
  PoufaPlacementIcon,
  PoufaSanitaryIcon,
  PoufaTeamIcon,
  PoufaTraceabilityIcon,
} from "@/components/brand-icons";
import type { Role } from "./roles";

export type NavItemIcon =
  | LucideIcon
  | React.ComponentType<{
      className?: string;
      size?: number | string;
      strokeWidth?: number;
      "aria-hidden"?: boolean | "true" | "false";
    }>;

export type NavItem = {
  label: string;
  href: string;
  icon: NavItemIcon;
  /** Rôles autorisés. "all" = tous les rôles connectés. */
  roles: Role[] | "all";
  /** Phase de livraison : MVP obligatoire ou ultérieur. */
  phase: "mvp" | "ultérieur";
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Vue d'ensemble",
    items: [
      {
        label: "Tableau de bord",
        href: "/tableau-de-bord",
        icon: LayoutDashboard,
        roles: "all",
        phase: "mvp",
      },
    ],
  },
  {
    label: "Opérations",
    items: [
      {
        label: "Fermes",
        href: "/fermes",
        icon: PoufaFarmIcon,
        roles: [
          "agriculteur",
          "technicien",
          "coordinateur",
          "veterinaire",
          "bceg",
          "administrateur",
        ],
        phase: "mvp",
      },
      {
        label: "Bandes d'élevage",
        href: "/bandes",
        icon: PoufaFlockIcon,
        roles: "all",
        phase: "mvp",
      },
      {
        label: "Saisie quotidienne",
        href: "/saisie",
        icon: PoufaPlacementIcon,
        roles: ["agriculteur", "technicien", "coordinateur", "administrateur"],
        phase: "mvp",
      },
      {
        label: "Intrants & stocks",
        href: "/intrants",
        icon: PoufaInventoryIcon,
        roles: ["agriculteur", "technicien", "coordinateur", "administrateur"],
        phase: "mvp",
      },
    ],
  },
  {
    label: "Vétérinaire",
    items: [
      {
        label: "Santé & déclarations",
        href: "/sante",
        icon: PoufaSanitaryIcon,
        roles: [
          "agriculteur",
          "technicien",
          "coordinateur",
          "veterinaire",
          "administrateur",
        ],
        phase: "mvp",
      },
      {
        label: "Alertes sanitaires",
        href: "/alertes",
        icon: BellRing,
        roles: [
          "technicien",
          "coordinateur",
          "veterinaire",
          "administrateur",
        ],
        phase: "mvp",
      },
    ],
  },
  {
    label: "Traçabilité",
    items: [
      {
        label: "Lots",
        href: "/tracabilite",
        icon: PoufaTraceabilityIcon,
        roles: [
          "agriculteur",
          "technicien",
          "coordinateur",
          "veterinaire",
          "bceg",
          "aninf",
          "administrateur",
        ],
        phase: "mvp",
      },
      {
        label: "Opérateurs",
        href: "/operateurs",
        icon: PoufaTeamIcon,
        roles: ["coordinateur", "administrateur"],
        phase: "mvp",
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        label: "Cartographie",
        href: "/cartographie",
        icon: Map,
        roles: [
          "technicien",
          "coordinateur",
          "veterinaire",
          "bceg",
          "administrateur",
        ],
        phase: "mvp",
      },
      {
        label: "Rapports",
        href: "/rapports",
        icon: PoufaAnalyticsIcon,
        roles: [
          "agriculteur",
          "technicien",
          "coordinateur",
          "veterinaire",
          "bceg",
          "administrateur",
        ],
        phase: "mvp",
      },
      {
        label: "POUFA AI",
        href: "/ia",
        icon: PoufaAiSymbol,
        roles: "all",
        phase: "mvp",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Utilisateurs & accès",
        href: "/administration/utilisateurs",
        icon: PoufaTeamIcon,
        roles: ["administrateur"],
        phase: "mvp",
      },
      {
        label: "Référentiels",
        href: "/administration/referentiels",
        icon: Table2,
        roles: ["administrateur"],
        phase: "mvp",
      },
      {
        label: "Règles métier",
        href: "/administration/regles",
        icon: ShieldCheck,
        roles: ["administrateur"],
        phase: "mvp",
      },
      {
        label: "Journaux & audit",
        href: "/administration/journaux",
        icon: ScrollText,
        roles: ["administrateur", "aninf"],
        phase: "mvp",
      },
      {
        label: "Imports de données",
        href: "/administration/imports",
        icon: Upload,
        roles: ["administrateur"],
        phase: "mvp",
      },
      {
        label: "Paramètres",
        href: "/administration/parametres",
        icon: Settings,
        roles: ["administrateur"],
        phase: "mvp",
      },
    ],
  },
];

export function navForRole(role: Role): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => item.roles === "all" || item.roles.includes(role),
    ),
  })).filter((group) => group.items.length > 0);
}

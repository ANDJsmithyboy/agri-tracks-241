import type React from "react";
import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  ClipboardList,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Map,
  Palette,
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
        roles: "all",
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
        roles: "all",
        phase: "mvp",
      },
      {
        label: "Intrants & stocks",
        href: "/intrants",
        icon: PoufaInventoryIcon,
        roles: "all",
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
        roles: "all",
        phase: "mvp",
      },
      {
        label: "Alertes sanitaires",
        href: "/alertes",
        icon: BellRing,
        roles: "all",
        phase: "mvp",
      },
    ],
  },
  {
    label: "Traçabilité",
    items: [
      {
        label: "Registre des lots",
        href: "/tracabilite",
        icon: PoufaTraceabilityIcon,
        roles: "all",
        phase: "mvp",
      },
      {
        label: "Opérateurs",
        href: "/operateurs",
        icon: PoufaTeamIcon,
        roles: "all",
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
        roles: "all",
        phase: "mvp",
      },
      {
        label: "Rapports",
        href: "/rapports",
        icon: PoufaAnalyticsIcon,
        roles: "all",
        phase: "mvp",
      },
      {
        label: "POUFA AI",
        href: "/ia",
        icon: PoufaAiSymbol,
        roles: "all",
        phase: "mvp",
      },
      {
        label: "Design Lab",
        href: "/design-lab",
        icon: Palette,
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
        roles: "all",
        phase: "mvp",
      },
      {
        label: "Référentiels",
        href: "/administration/referentiels",
        icon: Table2,
        roles: "all",
        phase: "mvp",
      },
      {
        label: "Règles métier",
        href: "/administration/regles",
        icon: ShieldCheck,
        roles: "all",
        phase: "mvp",
      },
      {
        label: "Journaux d'audit",
        href: "/administration/journaux",
        icon: ScrollText,
        roles: "all",
        phase: "mvp",
      },
      {
        label: "Imports de données",
        href: "/administration/imports",
        icon: Upload,
        roles: "all",
        phase: "mvp",
      },
      {
        label: "Paramètres",
        href: "/administration/parametres",
        icon: Settings,
        roles: "all",
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

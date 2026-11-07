import Link from "next/link";
import {
  ArrowRight,
  ScrollText,
  Settings,
  ShieldCheck,
  Table2,
  Upload,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MODULES = [
  {
    href: "/administration/utilisateurs",
    icon: Users,
    title: "Utilisateurs & accès",
    description: "Comptes, profils et permissions par rôle.",
  },
  {
    href: "/administration/referentiels",
    icon: Table2,
    title: "Référentiels",
    description: "Produits, pathologies, races et valeurs de référence.",
  },
  {
    href: "/administration/regles",
    icon: ShieldCheck,
    title: "Règles métier",
    description: "Seuils, cycles et formules paramétrables — jamais codés en dur.",
  },
  {
    href: "/administration/journaux",
    icon: ScrollText,
    title: "Journaux & audit",
    description: "Historique des modifications et piste d'audit.",
  },
  {
    href: "/administration/imports",
    icon: Upload,
    title: "Imports de données",
    description: "Migration des données existantes avec validation.",
  },
  {
    href: "/administration/parametres",
    icon: Settings,
    title: "Paramètres",
    description: "Configuration générale du système.",
  },
];

export default function AdministrationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Gouvernance du système : accès, référentiels, règles métier, audit et imports."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MODULES.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4 text-primary" aria-hidden />
                  {title}
                  <ArrowRight className="ml-auto size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

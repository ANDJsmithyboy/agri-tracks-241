"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Key,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  roleCategory: "eleveur" | "veterinaire" | "technicien" | "admin";
  farmAssignment: string;
  twoFactor: boolean;
  status: "active" | "invited";
  lastLogin: string;
}

const USERS_LIST: UserItem[] = [
  {
    id: "usr-1",
    name: "Marc Ndong Mengue",
    email: "m.ndong@agri-estuaire.ga",
    role: "Éleveur Responsable",
    roleCategory: "eleveur",
    farmAssignment: "Ferme Pilote KIMBA — Akanda",
    twoFactor: true,
    status: "active",
    lastLogin: "Aujourd'hui à 07:42",
  },
  {
    id: "usr-2",
    name: "Dr. Jean-Pierre Ekomi",
    email: "jp.ekomi@dge.gouv.ga",
    role: "Docteur Vétérinaire DGE",
    roleCategory: "veterinaire",
    farmAssignment: "Estuaire (Toutes exploitations)",
    twoFactor: true,
    status: "active",
    lastLogin: "Hier à 16:30",
  },
  {
    id: "usr-3",
    name: "Patrick Ondo",
    email: "p.ondo@poufa.ga",
    role: "Technicien d'encadrement",
    roleCategory: "technicien",
    farmAssignment: "Grand Libreville & Ntoum",
    twoFactor: true,
    status: "active",
    lastLogin: "Aujourd'hui à 08:15",
  },
  {
    id: "usr-4",
    name: "Awa Nguema",
    email: "a.nguema@bceg.ga",
    role: "Analyste Crédit BCEG",
    roleCategory: "admin",
    farmAssignment: "Cohorte 1 (Audit financier)",
    twoFactor: true,
    status: "active",
    lastLogin: "07 Nov 2026",
  },
  {
    id: "usr-5",
    name: "Sylvain Mba",
    email: "s.mba@nzoliba-elevage.ga",
    role: "Éleveur",
    roleCategory: "eleveur",
    farmAssignment: "Ferme de Nzoliba",
    twoFactor: false,
    status: "active",
    lastLogin: "05 Nov 2026",
  },
  {
    id: "usr-6",
    name: "Dr. Marie-Claire Biyogo",
    email: "mc.biyogo@sante-animale.ga",
    role: "Vétérinaire sanitaire agréé",
    roleCategory: "veterinaire",
    farmAssignment: "Moyen-Ogooué & Ngounié",
    twoFactor: true,
    status: "active",
    lastLogin: "06 Nov 2026",
  },
  {
    id: "usr-7",
    name: "Arnaud Smith (Admin)",
    email: "arnaud@smartandjai.com",
    role: "Super Administrateur",
    roleCategory: "admin",
    farmAssignment: "Système national complet",
    twoFactor: true,
    status: "active",
    lastLogin: "En session",
  },
  {
    id: "usr-8",
    name: "Célestin Kombila",
    email: "c.kombila@agri-gabon.ga",
    role: "Éleveur",
    roleCategory: "eleveur",
    farmAssignment: "Élevage du Sud — Tchibanga",
    twoFactor: false,
    status: "invited",
    lastLogin: "En attente d'activation",
  },
];

export default function UtilisateursPage() {
  const [filterRole, setFilterRole] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("eleveur");
  const [inviteDone, setInviteDone] = useState(false);

  const filtered = USERS_LIST.filter((u) => {
    if (filterRole !== "all" && u.roleCategory !== filterRole) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.farmAssignment.toLowerCase().includes(q)
    );
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteDone(true);
    setTimeout(() => {
      setInviteDone(false);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteName("");
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/administration"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Administration</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Utilisateurs & Accès</span>
      </div>

      <PageHeader
        title="Utilisateurs & Gestion des rôles"
        description="Gestion des accès sécurisés — éleveurs, techniciens d'encadrement, inspecteurs vétérinaires DGE, analystes BCEG et administrateurs."
        badge={<Badge variant="brand">Authentification Clerk 2FA</Badge>}
        actions={
          <Button
            variant="brand"
            size="sm"
            onClick={() => setShowInviteModal(true)}
          >
            <Plus className="size-3.5 mr-1.5" />
            Inviter un collaborateur
          </Button>
        }
      />

      {/* ── Invite Drawer / Modal ── */}
      {showInviteModal && (
        <Card className="border-primary/40 bg-card p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h3 className="font-semibold text-sm">
                Invitation d&apos;un nouvel utilisateur
              </h3>
              <p className="text-xs text-muted-foreground">
                Un lien d&apos;inscription sécurisé lui sera envoyé par e-mail.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInviteModal(false)}
            >
              Fermer
            </Button>
          </div>

          {inviteDone ? (
            <div className="flex items-center gap-2 text-emerald-500 text-sm py-2">
              <CheckCircle2 className="size-5" />
              <span>Invitation envoyée avec succès à {inviteEmail}</span>
            </div>
          ) : (
            <form onSubmit={handleSendInvite} className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="inv-name" className="text-xs">
                  Nom et prénom
                </Label>
                <Input
                  id="inv-name"
                  placeholder="Ex. : Patrick Mbourou"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="inv-mail" className="text-xs">
                  Adresse e-mail
                </Label>
                <Input
                  id="inv-mail"
                  type="email"
                  placeholder="collaborateur@domaine.ga"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="inv-role" className="text-xs">
                  Rôle attribué
                </Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="inv-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eleveur">Éleveur d&apos;exploitation</SelectItem>
                    <SelectItem value="technicien">Technicien de terrain</SelectItem>
                    <SelectItem value="veterinaire">Inspecteur Vétérinaire</SelectItem>
                    <SelectItem value="admin">Analyste institutionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInviteModal(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="brand" size="sm">
                  Envoyer l&apos;invitation
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {/* ── Table Card ── */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "Tous les rôles", count: USERS_LIST.length },
              { id: "eleveur", label: "Éleveurs", count: 3 },
              { id: "veterinaire", label: "Vétérinaires", count: 2 },
              { id: "technicien", label: "Techniciens", count: 1 },
              { id: "admin", label: "Administration & BCEG", count: 2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterRole(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterRole === tab.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un utilisateur…"
              className="pl-8 h-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead>Collaborateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Périmètre affecté</TableHead>
                  <TableHead>Sécurité 2FA</TableHead>
                  <TableHead>Dernière activité</TableHead>
                  <TableHead className="text-right">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-secondary/20">
                    <TableCell>
                      <div className="font-semibold text-foreground text-xs sm:text-sm">
                        {u.name}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        {u.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.roleCategory === "veterinaire"
                            ? "brand"
                            : u.roleCategory === "admin"
                            ? "default"
                            : "outline"
                        }
                        className="text-[11px]"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.farmAssignment}
                    </TableCell>
                    <TableCell>
                      {u.twoFactor ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                          <ShieldCheck className="size-3.5" />
                          2FA actif
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Optionnel
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {u.lastLogin}
                    </TableCell>
                    <TableCell className="text-right">
                      {u.status === "active" ? (
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Invitation envoyée
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

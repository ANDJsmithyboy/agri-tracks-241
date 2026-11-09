"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Moon,
  Save,
  Shield,
  Sun,
  Monitor,
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

export default function ParametresPage() {
  const [nom, setNom] = useState("Arnaud Smith");
  const [email, setEmail] = useState("arnaud@smartandjai.com");
  const [langue, setLangue] = useState("fr");
  const [theme, setTheme] = useState("system");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [units, setUnits] = useState("metric");
  const [wifiOnly, setWifiOnly] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/administration"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Administration</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Paramètres</span>
      </div>

      <PageHeader
        title="Paramètres du système"
        description="Configuration personnelle et préférences d'affichage de l'application POUFA."
      />

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Profil utilisateur
          </CardTitle>
          <CardDescription className="text-xs">
            Informations liées à votre compte Clerk
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom affiché</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Préférences d&apos;affichage
          </CardTitle>
          <CardDescription className="text-xs">
            Langue, thème visuel et format de date
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="langue">
              <Globe className="inline size-3.5 mr-1" />
              Langue
            </Label>
            <Select value={langue} onValueChange={setLangue}>
              <SelectTrigger id="langue">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en" disabled>
                  English (bientôt)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Thème visuel</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">
                  <div className="flex items-center gap-1.5">
                    <Monitor className="size-3.5" />
                    Automatique (Système)
                  </div>
                </SelectItem>
                <SelectItem value="light">
                  <div className="flex items-center gap-1.5">
                    <Sun className="size-3.5" />
                    Royal Cream (Clair)
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-1.5">
                    <Moon className="size-3.5" />
                    Obsidian Neon (Sombre)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFormat">Format de date</Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger id="dateFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">
                  DD/MM/YYYY (09/11/2026)
                </SelectItem>
                <SelectItem value="YYYY-MM-DD">
                  YYYY-MM-DD (2026-11-09)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="units">Système d&apos;unités</Label>
            <Select value={units} onValueChange={setUnits}>
              <SelectTrigger id="units">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">
                  Métrique (kg, °C, km)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sync Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Synchronisation & Sécurité
          </CardTitle>
          <CardDescription className="text-xs">
            Paramètres de connexion réseau et de protection des données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-secondary/10">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-foreground">
                Synchronisation Wi-Fi uniquement
              </span>
              <p className="text-xs text-muted-foreground">
                Désactiver la synchronisation automatique sur réseau cellulaire
              </p>
            </div>
            <button
              onClick={() => setWifiOnly(!wifiOnly)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                wifiOnly ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform shadow ${
                  wifiOnly ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-secondary/10">
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Shield className="size-3.5 text-emerald-500" />
                Authentification 2FA Clerk
              </span>
              <p className="text-xs text-muted-foreground">
                Double facteur activé sur votre compte
              </p>
            </div>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[11px]">
              Actif
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-xs text-emerald-500 font-medium animate-in fade-in">
            ✓ Préférences enregistrées
          </span>
        )}
        <Button variant="brand" onClick={handleSave}>
          <Save className="size-4 mr-1.5" />
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

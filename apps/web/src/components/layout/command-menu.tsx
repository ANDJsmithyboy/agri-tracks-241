"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Activity,
  ArrowRight,
  Bird,
  Compass,
  Download,
  FileCheck,
  FileText,
  Home,
  Layers,
  MapPin,
  Moon,
  Package,
  Plus,
  QrCode,
  RotateCcw,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Sun,
  Truck,
} from "lucide-react";
import { startGuidedTour } from "@/components/onboarding/guided-tour";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Rechercher une action, une bande, une page… (⌘K)" />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé pour votre recherche.</CommandEmpty>

        <CommandGroup heading="Navigation rapide">
          <CommandItem onSelect={() => runCommand(() => router.push("/tableau-de-bord"))}>
            <Home className="size-4 mr-2" />
            <span>Tableau de bord</span>
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/bandes"))}>
            <Layers className="size-4 mr-2" />
            <span>Bandes d'élevage</span>
            <CommandShortcut>G B</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/fermes"))}>
            <MapPin className="size-4 mr-2" />
            <span>Exploitations avicoles</span>
            <CommandShortcut>G F</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/ia"))}>
            <Sparkles className="size-4 mr-2 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
            <span className="font-semibold text-foreground">POUFA AI (Assistant)</span>
            <CommandShortcut>G A</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/intrants"))}>
            <Package className="size-4 mr-2" />
            <span>Intrants & stocks</span>
            <CommandShortcut>G I</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/sante"))}>
            <ShieldAlert className="size-4 mr-2" />
            <span>Santé & déclarations</span>
            <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/tracabilite"))}>
            <QrCode className="size-4 mr-2" />
            <span>Traçabilité des lots</span>
            <CommandShortcut>G T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/rapports"))}>
            <FileText className="size-4 mr-2" />
            <span>Rapports institutionnels</span>
            <CommandShortcut>G R</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions opérationnelles">
          <CommandItem onSelect={() => runCommand(() => router.push("/saisie"))}>
            <Plus className="size-4 mr-2 text-primary" />
            <span>Nouvelle saisie quotidienne</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/sante/declarer"))}>
            <Plus className="size-4 mr-2 text-primary" />
            <span>Déclarer un événement sanitaire</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/intrants/reception"))}>
            <Plus className="size-4 mr-2 text-primary" />
            <span>Réceptionner une livraison d'aliment</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/fermes/nouvelle"))}>
            <Plus className="size-4 mr-2 text-primary" />
            <span>Enregistrer une nouvelle exploitation</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Démonstration & Expérience KIMBA 2026">
          <CommandItem onSelect={() => runCommand(() => startGuidedTour())}>
            <Compass className="size-4 mr-2 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
            <span className="font-semibold text-foreground">Lancer la visite interactive</span>
            <CommandShortcut>G V</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/telecharger"))}>
            <Smartphone className="size-4 mr-2" />
            <span>Télécharger l&apos;APK Android (Terrain & Offline)</span>
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                window.dispatchEvent(new Event("open-poufa-android-install"))
              )
            }
          >
            <Smartphone className="size-4 mr-2 text-[var(--brand-green)] dark:text-[var(--brand-neon)]" />
            <span>Ouvrir la fenêtre d&apos;installation POUFA Android</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                window.dispatchEvent(new Event("open-poufa-welcome"))
              )
            }
          >
            <RotateCcw className="size-4 mr-2 text-muted-foreground" />
            <span>Réafficher le panneau de bienvenue POUFA</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Thème visuel (Design 2026)">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="size-4 mr-2" />
            <span>Basculer sur Royal Cream (Clair)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="size-4 mr-2" />
            <span>Basculer sur Obsidian Neon (Sombre)</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}


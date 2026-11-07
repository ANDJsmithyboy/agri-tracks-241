"use client";

import { Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Actions de la saisie quotidienne — branchement API à venir (Clerk/Neon/FastAPI). */
export function SaisieActions() {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
      <Button
        variant="outline"
        onClick={() =>
          toast.info("Enregistrement local — API en cours d'intégration.")
        }
      >
        <Save className="size-4" aria-hidden />
        Enregistrer sur l&apos;appareil
      </Button>
      <Button
        onClick={() =>
          toast.info("Synchronisation — API en cours d'intégration.")
        }
      >
        <Send className="size-4" aria-hidden />
        Enregistrer et synchroniser
      </Button>
    </div>
  );
}

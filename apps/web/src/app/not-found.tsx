import Link from "next/link";
import { PoufaLogo } from "@/components/poufa-logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <PoufaLogo />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="text-sm text-muted-foreground">
          La page demandée n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Button asChild>
        <Link href="/tableau-de-bord">Retour au tableau de bord</Link>
      </Button>
    </div>
  );
}

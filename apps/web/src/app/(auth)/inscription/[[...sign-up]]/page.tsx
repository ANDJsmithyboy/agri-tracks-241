import { SignUp } from "@clerk/nextjs";
import { PoufaLogo } from "@/components/poufa-logo";
import { Badge } from "@/components/ui/badge";

export default function InscriptionPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <PoufaLogo />
          <Badge variant="secondary">Système national — Gabon</Badge>
        </div>

        <div className="flex justify-center rounded-xl border border-border bg-card p-6 shadow-sm">
          <SignUp
            path="/inscription"
            routing="path"
            signInUrl="/connexion"
            fallbackRedirectUrl="/tableau-de-bord"
            signInFallbackRedirectUrl="/tableau-de-bord"
          />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Création de compte opérateur ou agent POUFA — Gabon.
        </p>
      </div>
    </div>
  );
}


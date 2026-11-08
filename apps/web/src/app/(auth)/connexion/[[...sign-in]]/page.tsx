import { SignIn } from "@clerk/nextjs";
import { PoufaLogo } from "@/components/poufa-logo";
import { Badge } from "@/components/ui/badge";

export default function ConnexionPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <PoufaLogo />
          <Badge variant="secondary">Système national — Gabon</Badge>
        </div>

        <div className="flex justify-center rounded-xl border border-border bg-card p-6 shadow-sm">
          <SignIn
            path="/connexion"
            routing="path"
            signUpUrl="/inscription"
            fallbackRedirectUrl="/tableau-de-bord"
            signUpFallbackRedirectUrl="/tableau-de-bord"
          />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Accès réservé aux comptes autorisés. Mot de passe oublié : contactez
          votre administrateur POUFA.
        </p>
      </div>
    </div>
  );
}


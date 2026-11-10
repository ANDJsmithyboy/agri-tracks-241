import { SignIn } from "@clerk/nextjs";
import {
  PoufaAuthShell,
  poufaClerkAppearance,
} from "@/components/auth/poufa-auth-shell";

export default function ConnexionPage() {
  return (
    <PoufaAuthShell
      title="Bienvenue sur POUFA"
      subtitle="Connectez-vous pour accéder à votre espace de suivi."
    >
      <SignIn
        path="/connexion"
        routing="path"
        signUpUrl="/inscription"
        fallbackRedirectUrl="/tableau-de-bord"
        signUpFallbackRedirectUrl="/tableau-de-bord"
        appearance={poufaClerkAppearance}
      />
    </PoufaAuthShell>
  );
}

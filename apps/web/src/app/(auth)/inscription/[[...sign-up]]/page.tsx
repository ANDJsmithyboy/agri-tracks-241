import { SignUp } from "@clerk/nextjs";
import {
  PoufaAuthShell,
  poufaClerkAppearance,
} from "@/components/auth/poufa-auth-shell";

export default function InscriptionPage() {
  return (
    <PoufaAuthShell
      title="Créer un compte POUFA"
      subtitle="Rejoignez votre espace de suivi avicole et traçabilité."
    >
      <SignUp
        path="/inscription"
        routing="path"
        signInUrl="/connexion"
        fallbackRedirectUrl="/tableau-de-bord"
        signInFallbackRedirectUrl="/tableau-de-bord"
        appearance={poufaClerkAppearance}
      />
    </PoufaAuthShell>
  );
}

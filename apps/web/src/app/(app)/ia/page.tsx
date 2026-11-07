import { PageHeader } from "@/components/page-header";
import { DesignPending } from "@/components/design-pending";
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
import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Explique le taux de mortalité de ma bande.",
  "Résume les performances de cette exploitation.",
  "Quels indicateurs dois-je vérifier ?",
  "Pourquoi le stock d'aliment a-t-il diminué ?",
  "Prépare une synthèse de ce rapport.",
];

export default function IaPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-6">
      <PageHeader
        title="POUFA AI"
        description="Assistant d'aide à la lecture des données autorisées — il n'établit ni diagnostic ni décision officielle."
        badge={<Badge variant="secondary">DeepSeek</Badge>}
      />

      <Card className="flex min-h-[28rem] flex-col">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-6 text-primary" aria-hidden />
          </div>
          <CardTitle className="text-lg">Bonjour, comment puis-je aider ?</CardTitle>
          <CardDescription>
            Posez une question sur vos bandes, vos stocks ou vos rapports.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-end gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <Button key={s} variant="outline" size="sm" disabled>
                {s}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 border-t border-border pt-4">
            <Input
              placeholder="Écrivez votre question…"
              aria-label="Question à POUFA AI"
              disabled
            />
            <Button disabled>Envoyer</Button>
          </div>
          <DesignPending
            label="Conversation"
            hint="Streaming, sources de données et contrôle d'arrêt — intégration DeepSeek à venir."
            className="min-h-24"
          />
        </CardContent>
      </Card>
    </div>
  );
}

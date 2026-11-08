"use client";

/**
 * Erreur globale (last resort) — doit rendre <html>/<body> car elle
 * remplace le layout racine en cas d'erreur fatale.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          background: "#f7f9f7",
          color: "#14241e",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          Une erreur est survenue
        </h1>
        <p style={{ color: "#52675d", fontSize: "0.875rem" }}>
          POUFA n&apos;a pas pu afficher cette page. Vos données sont conservées.
        </p>
        {error?.digest ? (
          <p style={{ color: "#6b7f75", fontSize: "0.75rem", margin: 0 }}>
            Référence : {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid #dfe8e2",
            background: "#176b45",
            color: "#fff",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}

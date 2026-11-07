"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Statut réseau temps réel. `null` côté serveur (rendu initial neutre).
 * Ne pas confondre avec la synchronisation : "en ligne" ≠ "synchronisé".
 */
export function useOnlineStatus(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => null,
  );
}

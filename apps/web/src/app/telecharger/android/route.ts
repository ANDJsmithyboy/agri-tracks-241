import { NextResponse } from "next/server";

/**
 * Endpoint officiel de redirection directe vers le binaire APK hébergé sur Cloudflare R2.
 *
 * Évite tout proxying lourd par le runtime Next.js et déclenche immédiatement
 * le téléchargement du fichier `POUFA-Android.apk` par le navigateur mobile.
 */

// Domaines de confiance autorisés pour le téléchargement direct
const TRUSTED_DOMAINS = [
  "downloads.smartandjai.com",
  "poufa-releases.r2.dev",
  "pub-poufa-releases.r2.dev",
  "r2.cloudflarestorage.com",
  "github.com",
  "githubusercontent.com",
];

function isTrustedUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    return TRUSTED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const configuredUrl =
    process.env.POUFA_ANDROID_APK_URL ||
    "https://downloads.smartandjai.com/android/poufa-kimba-demo-v0.1.apk";

  if (!configuredUrl || !isTrustedUrl(configuredUrl)) {
    // Si l'URL n'est pas encore configurée ou pointe sur un hôte non fiable
    const fallbackUrl = new URL("/telecharger?indisponible=true", request.url);
    return NextResponse.redirect(fallbackUrl, { status: 307 });
  }

  // Redirection HTTP 307 vers l'URL R2 sécurisée
  // Le navigateur Android lance immédiatement le téléchargement natif
  const response = NextResponse.redirect(configuredUrl, { status: 307 });

  // En-têtes pour garantir que les navigateurs ne mettent pas en cache une ancienne release
  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  response.headers.set("X-Poufa-Release-Channel", "kimba-2026-demo");
  response.headers.set("X-Poufa-Distribution", "Cloudflare-R2");

  return response;
}

import { NextResponse } from "next/server";

/**
 * Téléchargement direct de l'APK POUFA Android.
 * Priorité : variable d'environnement POUFA_ANDROID_APK_URL,
 * sinon fallback vers GitHub Releases du repo public.
 */
export async function GET(request: Request) {
  const configuredUrl =
    process.env.POUFA_ANDROID_APK_URL ||
    "https://github.com/smartandjai/Agri-track-241/releases/latest/download/POUFA-Android.apk";

  // Redirection HTTP 307 — le navigateur Android lance le téléchargement
  const response = NextResponse.redirect(configuredUrl, { status: 307 });
  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  response.headers.set("X-Poufa-Release-Channel", "kimba-2026-demo");

  return response;
}

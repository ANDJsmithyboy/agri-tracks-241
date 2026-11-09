import { NextResponse } from "next/server";
import { POUFA_ANDROID_RELEASE } from "@/lib/android-release";

/**
 * Route HTTP de téléchargement direct de l'APK POUFA Android.
 * Redirige instantanément vers le binaire officiel hébergé sur GitHub Releases v0.3.0.
 */
export async function GET(request: Request) {
  // Toujours utiliser l'URL officielle GitHub Release v0.3.0 (ignore les anciennes URL obsolètes Cloudflare/R2)
  const envUrl = process.env.POUFA_ANDROID_APK_URL;
  const targetUrl =
    envUrl && !envUrl.includes("downloads.smartandjai.com") && !envUrl.includes("v0.1")
      ? envUrl
      : POUFA_ANDROID_RELEASE.url;

  const response = NextResponse.redirect(targetUrl, { status: 307 });
  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  response.headers.set("X-Poufa-Release-Version", POUFA_ANDROID_RELEASE.version);
  response.headers.set("X-Poufa-Release-Channel", POUFA_ANDROID_RELEASE.channel);

  return response;
}

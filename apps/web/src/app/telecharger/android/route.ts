import { NextResponse } from "next/server";
import { POUFA_ANDROID_RELEASE } from "@/lib/android-release";

/**
 * Route HTTP de téléchargement direct de l'APK POUFA Android.
 * Redirige instantanément vers le binaire officiel hébergé sur GitHub Releases.
 */
export async function GET(request: Request) {
  const targetUrl = process.env.POUFA_ANDROID_APK_URL || POUFA_ANDROID_RELEASE.url;

  const response = NextResponse.redirect(targetUrl, { status: 307 });
  response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  response.headers.set("X-Poufa-Release-Version", POUFA_ANDROID_RELEASE.version);
  response.headers.set("X-Poufa-Release-Channel", POUFA_ANDROID_RELEASE.channel);

  return response;
}

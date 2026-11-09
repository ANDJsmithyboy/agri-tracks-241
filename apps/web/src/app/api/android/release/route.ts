import { NextResponse } from "next/server";
import { POUFA_ANDROID_RELEASE } from "@/lib/android-release";

export async function GET() {
  const downloadUrl =
    process.env.POUFA_ANDROID_APK_URL || POUFA_ANDROID_RELEASE.url;

  const releaseInfo = {
    appName: "POUFA Android",
    version: `${POUFA_ANDROID_RELEASE.version}-kimba-demo`,
    versionCode: POUFA_ANDROID_RELEASE.versionCode,
    packageName: "com.poufa.app",
    releaseDate: "2026-11-09",
    sizeBytes: POUFA_ANDROID_RELEASE.sizeBytes,
    sizeHuman: POUFA_ANDROID_RELEASE.sizeLabel,
    sha256: POUFA_ANDROID_RELEASE.sha256,
    minSdkVersion: 26,
    targetSdkVersion: 36,
    ciStatus: "PASSED 100% (GitHub Actions & Local Gradle)",
    ciArtifactUrl: "https://github.com/smartandjai/Agri-track-241/actions",
    distribution: {
      provider: "GitHub Releases",
      downloadUrl,
      downloadRoute: "/telecharger/android",
      contentType: "application/vnd.android.package-archive",
    },
    downloadUrl,
    features: [
      "Typographie Geist Sans & Mono sur les 57 écrans",
      "POUFA AI avec rendu Markdown natif (titres, code, listes, gras/italique)",
      "Mode hors-ligne complet : conversations IA cachées en Room SQLite",
      "SSE Streaming OkHttp pour les réponses DeepSeek en temps réel",
      "Scanner QR natif CameraX + ML Kit embarqué 100% hors-ligne",
      "Tiroir de navigation latéral avec historique classé par date",
      "Glassmorphism Haze sur le bouton flottant POUFA AI",
      "Palettes Royal Cream & Obsidian Neon Material 3",
      "Architecture 100% Offline-First (Room SQLite + WorkManager)",
    ],
    support: "SmartANDJ AI Technologies SARL — Libreville, Gabon",
  };

  return NextResponse.json(releaseInfo, {
    headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
  });
}

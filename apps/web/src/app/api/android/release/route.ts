import { NextResponse } from "next/server";

export async function GET() {
  const downloadUrl =
    process.env.POUFA_ANDROID_APK_URL ||
    "https://github.com/smartandjai/Agri-track-241/releases/latest/download/POUFA-Android.apk";

  const releaseInfo = {
    appName: "POUFA Android",
    version: "0.3.0-kimba-demo",
    versionCode: 3,
    packageName: "com.poufa.app",
    releaseDate: "2026-11-09",
    sizeBytes: 53924742,
    sizeHuman: "51.4 Mo",
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
    downloadUrl: "/telecharger/android",
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

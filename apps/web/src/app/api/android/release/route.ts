import { NextResponse } from "next/server";

export async function GET() {
  const r2Url =
    process.env.POUFA_ANDROID_APK_URL ||
    "https://downloads.smartandjai.com/android/poufa-kimba-demo-v0.2.apk";

  const releaseInfo = {
    appName: "POUFA Android",
    version: "0.2.0-kimba-demo",
    versionCode: 2,
    packageName: "com.poufa.app",
    releaseDate: "2026-11-09",
    sizeBytes: 52584395,
    sizeHuman: "50.15 Mo",
    sha256: "a96e298215d0576eb925dcb5300f56d31eb64c00b8f220cabfdafc9b1dad759f",
    minSdkVersion: 26,
    targetSdkVersion: 36,
    ciStatus: "PASSED 100% (GitHub Actions & Local Gradle)",
    ciArtifactUrl: "https://github.com/smartandjai/Agri-track-241/actions",
    distribution: {
      provider: "Cloudflare R2",
      bucket: "poufa-releases",
      objectKey: "android/poufa-kimba-demo-v0.2.apk",
      r2PublicUrl: r2Url,
      downloadRoute: "/telecharger/android",
      contentType: "application/vnd.android.package-archive",
      contentDisposition: 'attachment; filename="POUFA-Android.apk"',
    },
    downloadUrl: "/telecharger/android",
    features: [
      "Scanner QR natif CameraX + ML Kit embarqué 100% hors-ligne",
      "POUFA AI : tiroir de navigation latérale avec historique Neon classé par date",
      "Clavier adaptatif avec insets automatiques et bouton d'envoi flèche vers le haut [↑]",
      "Bouton flottant compact POUFA AI sur l'écran d'accueil avec emblème officiel",
      "Palettes officielles Royal Cream & Obsidian Neon haute lisibilité",
      "Architecture 100% Offline-First (Room SQLite + WorkManager)"
    ],
    support: "SmartANDJ AI Technologies SARL — Libreville, Gabon"
  };

  return NextResponse.json(releaseInfo, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}


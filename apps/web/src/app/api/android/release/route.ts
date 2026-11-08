import { NextResponse } from "next/server";

export async function GET() {
  const r2Url =
    process.env.POUFA_ANDROID_APK_URL ||
    "https://downloads.smartandjai.com/android/poufa-kimba-demo-v0.1.apk";

  const releaseInfo = {
    appName: "POUFA Android",
    version: "0.1.0-kimba-demo",
    versionCode: 1,
    packageName: "com.poufa.app",
    releaseDate: "2026-11-08",
    sizeBytes: 27836513,
    sizeHuman: "26.55 Mo",
    sha256: "4b68e8e7a685121b6d92a95c52c6e64c39de558a7b973c75ecf23bc2e48e02d0",
    minSdkVersion: 26,
    targetSdkVersion: 34,
    ciStatus: "PASSED 100% (GitHub Actions #42518891662)",
    ciArtifactUrl: "https://github.com/smartandjai/Agri-track-241/actions/runs/42518891662",
    distribution: {
      provider: "Cloudflare R2",
      bucket: "poufa-releases",
      objectKey: "android/poufa-kimba-demo-v0.1.apk",
      r2PublicUrl: r2Url,
      downloadRoute: "/telecharger/android",
      contentType: "application/vnd.android.package-archive",
      contentDisposition: 'attachment; filename="POUFA-Android.apk"',
    },
    downloadUrl: "/telecharger/android",
    features: [
      "Architecture 100% Offline-First (Room SQLite + WorkManager)",
      "Reconnexion hors-ligne avec session locale Clerk préservée",
      "57 écrans Jetpack Compose Material 3 adaptés au terrain",
      "Synchronisation automatique bidirectionnelle au retour du réseau",
      "Enregistrement des mortalités, pesées et consommations d'aliment sans Internet"
    ],
    support: "SmartANDJ AI Technologies SARL — Libreville, Gabon"
  };

  return NextResponse.json(releaseInfo, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}


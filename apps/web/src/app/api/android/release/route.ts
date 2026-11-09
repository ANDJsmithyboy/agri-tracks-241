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
    sizeBytes: 29341346,
    sizeHuman: "27.98 Mo",
    sha256: "6cc5d6d6ed150e986c142ecbd164beb7de033e4895aade4d36e6f6c1547429ba",
    minSdkVersion: 26,
    targetSdkVersion: 36,
    ciStatus: "PASSED 100% (GitHub Actions #42608465639)",
    ciArtifactUrl: "https://github.com/smartandjai/Agri-track-241/actions/runs/42608465639",
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


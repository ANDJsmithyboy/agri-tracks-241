/**
 * Configuration centralisée de la version et distribution POUFA Android.
 * Source unique de vérité pour tous les boutons et liens de téléchargement.
 */
export const POUFA_ANDROID_RELEASE = {
  version: "v0.3.0",
  versionCode: 3,
  filename: "POUFA-Android.apk",
  url: "https://github.com/smartandjai/Agri-track-241/releases/download/v0.3.0/POUFA-Android.apk",
  sizeLabel: "51,4 Mo",
  sizeBytes: 53924742,
  sha256: "2a34ea7f26f9a3a295626f3f1d1198291e02c8885d9efa813ca95338d89bd03a",
  channel: "demo",
  minAndroid: "Android 8.0+ (Oreo, API 26)",
  targetAndroid: "Android 15+ (API 36)",
} as const;

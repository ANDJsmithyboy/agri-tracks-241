import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "POUFA — Suivi avicole & Traçabilité 241",
    short_name: "POUFA",
    description:
      "Système national de suivi de la production avicole et de traçabilité de la filière — Gabon (KIMBA 2026).",
    start_url: "/tableau-de-bord",
    display: "standalone",
    background_color: "#F5F0E7",
    theme_color: "#F5F0E7",
    lang: "fr",
    icons: [
      {
        src: "/branding/poufa-symbol.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/branding/poufa-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

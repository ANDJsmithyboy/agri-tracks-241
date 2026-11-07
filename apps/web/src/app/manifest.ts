import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "POUFA — Suivi technico-économique et traçabilité avicole",
    short_name: "POUFA",
    description:
      "Système national de suivi de la production avicole et de traçabilité de la filière — Gabon.",
    start_url: "/tableau-de-bord",
    display: "standalone",
    background_color: "#f7f9f7",
    theme_color: "#176b45",
    lang: "fr",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

import { defineConfig, devices } from "@playwright/test";

/**
 * POUFA Web 2026 — Configuration Playwright QA Visuel & Précision Subpixel
 * Contrôle des rendus Royal Cream (Clair) & Obsidian Neon (Sombre)
 * Émulation multi-DPR (1x et 2x Retina) et responsive breakpoints
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    locale: "fr-FR",
    timezoneId: "Africa/Libreville",
  },
  projects: [
    // Desktop HD (1440x900) - DPR 2 (Retina)
    {
      name: "desktop-retina-light",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
        colorScheme: "light",
      },
    },
    {
      name: "desktop-retina-dark",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
        colorScheme: "dark",
      },
    },
    // Tablet (768x1024)
    {
      name: "tablet-light",
      use: {
        ...devices["iPad (gen 7)"],
        colorScheme: "light",
      },
    },
    // Mobile (390x844 - iPhone 14 standard)
    {
      name: "mobile-light",
      use: {
        ...devices["iPhone 14"],
        colorScheme: "light",
      },
    },
    {
      name: "mobile-dark",
      use: {
        ...devices["iPhone 14"],
        colorScheme: "dark",
      },
    },
  ],
});

import { test, expect } from "@playwright/test";

/**
 * Suite de tests de régression visuelle déterministe — POUFA Web 2026
 * Vérifie l'absence de régression visuelle, l'alignement optique et le rendu thématique
 */

test.describe("Tableau de bord — Contrat visuel & géométrie", () => {
  test("Vérification du tableau de bord (Royal Cream & Obsidian Neon)", async ({ page }) => {
    await page.goto("/tableau-de-bord");
    await page.evaluate(() => document.fonts.ready);

    // Vérifier la présence des éléments clés
    await expect(page.locator("h1")).toContainText("Tableau de bord");
    await expect(page.getByText("Dynamique zootechnique — Bande B-2026-014")).toBeVisible();
    await expect(page.getByText("POUFA AI")).toBeVisible();

    // Snapshot pleine page avec gel des animations pour déterminisme strict
    await expect(page).toHaveScreenshot("dashboard-full.png", {
      animations: "disabled",
      caret: "hide",
      scale: "device",
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("Contrôle du sélecteur d'onglets Recharts", async ({ page }) => {
    await page.goto("/tableau-de-bord");
    await page.evaluate(() => document.fonts.ready);

    const tabsList = page.getByRole("tablist");
    await expect(tabsList).toBeVisible();

    // Cliquer sur l'onglet Poids
    await page.getByRole("tab", { name: "Poids" }).click();
    await expect(page.getByText("Poids moyen vif")).toBeVisible();
  });
});

test.describe("Command Palette (⌘K) — Accessibilité & rendu", () => {
  test("Ouverture au clavier et focus", async ({ page }) => {
    await page.goto("/tableau-de-bord");
    await page.keyboard.press("Meta+k");

    const commandDialog = page.getByRole("dialog");
    await expect(commandDialog).toBeVisible();
    await expect(page.getByPlaceholder("Rechercher une action")).toBeFocused();

    // Fermeture avec Échap
    await page.keyboard.press("Escape");
    await expect(commandDialog).toBeHidden();
  });
});

test.describe("Tables de données interactives", () => {
  test("Filtrage en direct des bandes", async ({ page }) => {
    await page.goto("/bandes");
    await page.evaluate(() => document.fonts.ready);

    const searchInput = page.getByPlaceholder("Rechercher par code");
    await searchInput.fill("B-2026-014");

    // Doit trouver la bande spécifique
    await expect(page.getByText("Ferme Avicole de Kango")).toBeVisible();
  });

  test("Filtrage des exploitations par province", async ({ page }) => {
    await page.goto("/fermes");
    await page.evaluate(() => document.fonts.ready);

    const searchInput = page.getByPlaceholder("Rechercher par nom");
    await searchInput.fill("Kango");
    await expect(page.getByText("Ferme Avicole de Kango")).toBeVisible();
  });
});

test.describe("POUFA AI — Interface conversationnelle", () => {
  test("Rendu du composer et des suggestions", async ({ page }) => {
    await page.goto("/ia");
    await page.evaluate(() => document.fonts.ready);

    await expect(page.getByPlaceholder("Posez une question sur votre élevage")).toBeVisible();
    await expect(page.getByText("Analyser ma bande")).toBeVisible();
  });
});

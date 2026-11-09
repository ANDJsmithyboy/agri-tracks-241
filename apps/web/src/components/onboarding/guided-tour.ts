import { driver, type Driver, type DriveStep } from "driver.js";

let driverInstance: Driver | null = null;

export const TOUR_STORAGE_KEY = "poufa-tour-completed-v1";

export function getGuidedTourSteps(): DriveStep[] {
  return [
    {
      element: '[data-tour="dashboard-header"]',
      popover: {
        title: "Tableau de bord POUFA",
        description:
          "Bienvenue sur POUFA, le système national de suivi avicole et de traçabilité des filières gabonaises (KIMBA 2026). Visualisez en temps réel l'ensemble de vos fermes et indicateurs.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: '[data-tour="kpi-cards"]',
      popover: {
        title: "Arithmétique zootechnique certifiée",
        description:
          "Indicateurs exacts et audités : 1 000 poussins placés − 52 mortalités − 300 sorties abattage = 648 poulets vivants actuellement en bâtiment.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="production-chart"]',
      popover: {
        title: "Courbes de dynamique zootechnique",
        description:
          "Graphique interactif multi-onglets : suivez la courbe d'effectif, l'évolution du poids vif moyen (g) et la consommation cumulée d'aliment (kg).",
        side: "top",
        align: "center",
      },
    },
    {
      element: '[data-tour="nav-bandes"]',
      popover: {
        title: "Gestion des bandes d'élevage",
        description:
          "Chaque lot est suivi de l'éclosoir jusqu'à l'abattage : souche Cobb 500, densité au m², indice de consommation (FCR) et taux de viabilité.",
        side: "right",
        align: "center",
      },
    },
    {
      element: '[data-tour="nav-intrants"]',
      popover: {
        title: "Intrants & stocks d'aliment",
        description:
          "Surveillez les réceptions d'aliments Démarrage / Croissance / Finition, les vaccins et l'autonomie restante en jours.",
        side: "right",
        align: "center",
      },
    },
    {
      element: '[data-tour="nav-sante"]',
      popover: {
        title: "Santé, prophylaxie & alertes",
        description:
          "Registre sanitaire national : déclarations de mortalités anormales, plans de vaccination Gumboro/Newcastle et interventions vétérinaires.",
        side: "right",
        align: "center",
      },
    },
    {
      element: '[data-tour="nav-tracabilite"]',
      popover: {
        title: "Traçabilité des lots & QR Code",
        description:
          "Chaque lot commercialisé dispose d'un passeport sanitaire et d'un QR code vérifiable par les services de l'État (DGEL) et les consommateurs.",
        side: "right",
        align: "center",
      },
    },
    {
      element: '[data-tour="nav-rapports"]',
      popover: {
        title: "Rapports officiels MAEDR",
        description:
          "Générez les fiches de synthèse réglementaires conformes aux exigences du Ministère de l'Agriculture et de l'Élevage.",
        side: "right",
        align: "center",
      },
    },
    {
      element: '[data-tour="nav-poufa-ai"]',
      popover: {
        title: "POUFA AI — Assistant zootechnique",
        description:
          "Conseil zootechnique assisté par DeepSeek en streaming : posez vos questions en français sur la conduite d'élevage, les rations et le diagnostic sanitaire.",
        side: "right",
        align: "center",
      },
    },
    {
      element: '[data-tour="theme-toggle"]',
      popover: {
        title: "Design System 2026 : Deux thèmes officiels",
        description:
          "Basculez en un clic entre Royal Cream (ivoire noble & crème royal) et Obsidian Neon (graphite sombre & vert néon de précision).",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: '[data-tour="search-bar"]',
      popover: {
        title: "Palette de commandes ⌘K",
        description:
          "Accédez à n'importe quel écran, déclenchez une saisie ou téléchargez l'APK Android en tapant Ctrl+K ou Cmd+K à tout moment.",
        side: "bottom",
        align: "center",
      },
    },
  ];
}

export function startGuidedTour(onComplete?: () => void) {
  if (typeof window === "undefined") return;

  const steps = getGuidedTourSteps();

  driverInstance = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: "rgba(10, 13, 16, 0.75)",
    stagePadding: 6,
    stageRadius: 10,
    nextBtnText: "Suivant →",
    prevBtnText: "← Précédent",
    doneBtnText: "Terminer la visite",
    progressText: "{{current}} sur {{total}}",
    steps,
    onDestroyStarted: () => {
      try {
        window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
      } catch {
        // localStorage non disponible
      }
      if (onComplete) onComplete();
      driverInstance?.destroy();
      driverInstance = null;
    },
  });

  driverInstance.drive();
}


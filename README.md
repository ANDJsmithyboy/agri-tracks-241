# 🐔 POUFA
### Plateforme intelligente de suivi avicole et de traçabilité au Gabon

**POUFA** est une plateforme numérique conçue pour accompagner la modernisation de la filière avicole gabonaise grâce au suivi des élevages, à la collecte de données sur le terrain, à la gestion sanitaire et à la traçabilité des productions.

Le projet vise à offrir aux éleveurs, techniciens, vétérinaires et organismes d'encadrement des outils fiables, accessibles et adaptés aux réalités opérationnelles du Gabon.

**Notre ambition : rendre le suivi avicole plus simple, les données plus fiables et la traçabilité plus accessible.**

---

## 🌍 Notre vision

La transformation numérique de l'agriculture doit tenir compte des conditions réelles du terrain : accès parfois limité à Internet, diversité des utilisateurs, contraintes matérielles et nécessité de disposer de données exploitables.

POUFA repose sur quatre principes :

- **Accessibilité :** une interface intuitive, utilisable sur smartphone et adaptée aux éleveurs.
- **Continuité :** enregistrer les opérations sur le terrain, y compris hors connexion.
- **Fiabilité :** centraliser des données cohérentes, historisées et vérifiables.
- **Traçabilité :** relier les bandes, les mouvements d'animaux et les lots de production.

Le projet s'inscrit dans une démarche de modernisation et de valorisation de l'écosystème agricole gabonais.

## 🚀 Fonctionnalités principales

### Gestion des exploitations

- Enregistrement et gestion des fermes.
- Gestion des bâtiments et de leurs capacités.
- Création et suivi des bandes avicoles.
- Gestion des utilisateurs et des permissions.
- Historique des cycles de production.

### Suivi zootechnique

- Saisie quotidienne de la mortalité.
- Enregistrement des consommations d'aliments.
- Suivi des pesées et de la croissance.
- Calcul des indicateurs techniques.
- Gestion des sorties et des cessions.
- Bilans de production et clôture des bandes.

### Suivi sanitaire

- Déclaration des problèmes sanitaires.
- Ajout de photographies et d'observations.
- Suivi des déclarations.
- Historique des vaccinations et traitements.
- Gestion des stocks de produits sanitaires.
- Suivi des interventions et statuts vétérinaires autorisés.

### Gestion des intrants

- Enregistrement des réceptions.
- Confirmation des quantités reçues.
- Suivi des stocks.
- Historique des consommations.
- Alertes sur les niveaux de stock.
- Suivi des dates de péremption.

### Traçabilité

- Identification des bandes et des lots.
- Création de lots liés aux cessions.
- Génération de QR codes.
- Recherche et consultation des lots.
- Historique des événements de production.
- Génération d'étiquettes au format PDF.

### Fonctionnement hors connexion

L'application Android adopte une architecture **offline-first**.

Les données peuvent être enregistrées localement avec Room/SQLite, puis transmises au serveur lorsque la connexion le permet.

L'architecture prévoit :

- Une persistance locale durable.
- Une file d'opérations en attente.
- Une synchronisation différée avec WorkManager.
- Une gestion des accusés de réception.
- Une protection contre les traitements en double.
- Une détection des conflits de données.

L'implémentation et la validation de bout en bout de ces mécanismes sont en cours.

---

## 🏗️ Architecture technique

POUFA s'appuie sur une architecture composée de trois applications interconnectées.

| Composant | Technologies | Responsabilité |
|---|---|---|
| Application web | Next.js 16, React, TypeScript, Tailwind CSS | Interfaces web et tableaux de bord |
| Application Android | Kotlin, Jetpack Compose, Material 3 | Collecte terrain et utilisation hors connexion |
| API métier | Python, FastAPI | Validation, règles métier et synchronisation |
| Base centrale | Neon PostgreSQL | Stockage relationnel et historique |
| Base Android | Room / SQLite | Persistance locale |
| Authentification | Clerk | Identités et sessions utilisateurs |
| Synchronisation Android | WorkManager | Traitement différé des opérations |

### Flux général

```text
                  POUFA
                    |
          +---------+---------+
          |                   |
     Application         Application
        Android               Web
          |                   |
     Room / SQLite         Next.js
          |                   |
     WorkManager              |
          |                   |
          +---------+---------+
                    |
                 FastAPI
                    |
             Neon PostgreSQL
```

L'API applique les règles métier et les autorisations. L'application Android conserve localement les informations nécessaires au travail sur le terrain.

## 📁 Organisation du dépôt

```text
Agri-track-241/
│
├── apps/
│   ├── web/          # Application Next.js
│   ├── android/      # Application Kotlin Android
│   └── api/          # Backend FastAPI
│
├── .github/
│   └── workflows/    # Automatisation CI/CD
│
└── README.md
```

Ce monorepo permet de développer les différentes interfaces autour de contrats métier communs.

---

## 🌐 Langues et accessibilité

Le français constitue la langue principale de l'application.

L'architecture de localisation prévoit progressivement la prise en charge de plusieurs langues gabonaises :

- Fang
- Punu
- Nzébi
- Myènè

Les traductions devront être vérifiées avant leur mise à disposition.

POUFA privilégie également des interfaces lisibles, des parcours guidés et une utilisation adaptée aux smartphones Android.

---

## 🔐 Sécurité et gouvernance des données

La plateforme est conçue pour intégrer :

- L'authentification avec Clerk.
- Des rôles et permissions adaptés aux différents utilisateurs.
- Des contrôles d'accès par exploitation.
- La validation des opérations côté serveur.
- Une historisation des modifications importantes.
- La protection des données sanitaires et personnelles.
- Des mécanismes de synchronisation idempotents.

Les QR codes de traçabilité ne constituent pas des certificats sanitaires et ne doivent pas exposer de données confidentielles.

**Aucune clé privée, aucun mot de passe de base de données et aucune donnée sensible réelle ne doivent être publiés dans ce dépôt.**

---

## 🧪 État du développement

POUFA est actuellement en phase de développement et de validation technique.

| Module | État |
|---|---|
| Application web Next.js | Structure développée, build de production précédemment validé |
| Backend FastAPI | Socle API et synchronisation développés ; contrats métier à compléter |
| Application Android | 57 écrans de référence codés |
| Navigation Android | Routes principales raccordées |
| Stockage Room | Infrastructure et opérations métier implémentées en partie |
| QR codes et PDF | Génération intégrée, validation sur appareil à réaliser |
| Authentification native | Configuration et tests Clerk Android à finaliser |
| Build Android GitHub Actions | Validation initiale en attente |
| Tests de bout en bout | En attente de validation |

**Important :** le dépôt contient du code en cours de stabilisation. La couverture des interfaces ne signifie pas que toutes les fonctionnalités ont été testées ou mises en production.

## 🗺️ Feuille de route

- [x] Architecture initiale du monorepo.
- [x] Design system POUFA.
- [x] Fondation Next.js et FastAPI.
- [x] Implémentation initiale des 57 écrans Android.
- [x] Infrastructure locale Room/SQLite.
- [x] Génération initiale des QR codes et documents PDF.
- [ ] Compilation et validation Android sur GitHub Actions.
- [ ] Validation complète de l'authentification Clerk Android.
- [ ] Finalisation des contrats métier FastAPI.
- [ ] Migrations et vérifications de la base PostgreSQL.
- [ ] Tests de synchronisation Android ↔ API ↔ Neon.
- [ ] Tests sur smartphones Android réels.
- [ ] Validation des traductions et de l'accessibilité.
- [ ] Préparation des phases pilotes.

---

## 💻 Développement

Le dépôt regroupe les trois composants du système.

**Web :** le projet Next.js se trouve dans `apps/web`.

**Android :** le projet Kotlin/Gradle se trouve dans `apps/android`. La compilation automatisée est destinée à GitHub Actions.

**Backend :** les services FastAPI se trouvent dans `apps/api`.

Les configurations spécifiques à chaque environnement doivent être fournies séparément. Les fichiers contenant des identifiants secrets ne doivent jamais être intégrés au dépôt.

La documentation d'installation et les procédures de validation seront complétées au fil de la stabilisation des modules.

---

## 🤝 Collaboration

POUFA est développé dans une démarche collaborative associant ingénierie logicielle, connaissance du secteur avicole et exigences opérationnelles du terrain.

Le projet est ouvert aux échanges techniques visant à améliorer la qualité des interfaces, la fiabilité des données, la sécurité et l'adaptation des outils numériques aux exploitations agricoles.

Les modalités de contribution et la politique de licence seront précisées ultérieurement.

## 📄 Licence

Aucune licence open source n'est déclarée à ce stade.

La visibilité publique du dépôt ne constitue pas une autorisation générale de réutilisation, modification ou redistribution du code.

---

**POUFA — Pour un élevage mieux suivi, des données mieux exploitées et une production plus traçable.**

*Conçu pour les réalités du terrain. Développé avec une ambition de transformation numérique de la filière avicole gabonaise.*

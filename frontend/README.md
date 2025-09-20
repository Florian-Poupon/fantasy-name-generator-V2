# Forge de noms fantastiques

Application monopage moderne (Vue 3 + TypeScript) permettant de générer des noms héroïques à partir d’un corpus
structuré. L’interface propose la sélection de la race, du genre, du style et d’une tonalité phonétique, conserve
l’historique/favoris en localStorage, fournit des exports JSON/PNG et intègre une ambiance sonore persistante.

## Aperçu des fonctionnalités

- **Moteur de génération paramétrable** : préfixes/suffixes pondérés par race, genre et style avec filtres de tonalité.
- **Interface réactive** : suggestions multiples, actions “Copier/Partager”, favoris, toasts de feedback et export.
- **Persistance locale** : historique et préférences audio mémorisés dans le navigateur.
- **Ambiance audio avancée** : pistes procédurales générées via Web Audio avec volume/mute persistés.
- **PWA prête au déploiement** : manifeste, service worker Workbox et configuration GitHub Pages (`base`).

## Prise en main

```bash
npm install
npm run dev        # démarrage avec Vite et hot reload
npm run lint       # analyse ESLint (Vue + TypeScript)
npm run test:unit  # tests Vitest (logique de génération)
npm run build      # build de production + vérification TypeScript
```

Le script `npm run check` exécute lint + tests + build d’un seul tenant.

## Structure des données

Le jeu de données réside dans `src/data/names.json` et suit la hiérarchie suivante :

```json
{
  "race": {
    "genre": {
      "style": {
        "prefixes": ["Pré", { "value": "Fi", "weight": 2 }],
        "suffixes": ["x"],
        "forbiddenSequences": ["préx"]
      }
    }
  }
}
```

- Les entrées peuvent être des chaînes simples ou des objets `{ value, weight }` pour pondérer la sélection.
- `forbiddenSequences` (optionnel) filtre les combinaisons indésirables avant validation.
- Utilisez `extendDataset` (voir `src/lib/nameGenerator.ts`) pour fusionner dynamiquement de nouveaux corpus sans
  modifier le fichier de base.

## Ajout d’un nouveau corpus

1. Ajoutez les préfixes/suffixes dans `src/data/names.json` ou chargez un module externe via `extendDataset`.
2. Fournissez au moins un style par couple race/genre pour qu’il apparaisse dans l’UI.
3. Ajustez les dégradés définis dans `useBackground.ts` pour représenter visuellement la nouvelle race si besoin.
4. Facultatif : complétez les traductions/descriptions dans l’UI si le style implique une nouvelle tonalité.

## Accessibilité & partage

- Les éléments interactifs utilisent des rôles ARIA explicites et des états visuels focus/favoris.
- Les actions “Partager” s’appuient sur l’API `navigator.share` avec repli vers le presse-papiers.
- L’image Open Graph (`/og-image.svg`) est fournie dans `public/` pour les aperçus sociaux.

## Déploiement

La configuration Vite (`vite.config.ts`) définit `base: "/fantasy-name-generator-V2/"` et active `vite-plugin-pwa`.
Pour un déploiement GitHub Pages :

1. Construire le projet : `npm run build`
2. Publier le contenu de `dist/` sur la branche gh-pages ou via un workflow.

Le service worker précache les assets critiques (polices, icônes SVG) et gère une stratégie `CacheFirst` pour les médias
dynamiques.

# Fantasy Name Generator — React Edition

Cette application est une refonte complète du générateur de noms fantastiques en React + Vite avec des animations Framer Motion et les corpus JSON historiques.

## Lancer le projet

```bash
npm install
npm run dev
```

Le serveur de développement démarre sur [http://localhost:5173](http://localhost:5173).

Pour produire une version optimisée :

```bash
npm run build
```

## Fonctionnalités

- Sélection du peuple, du genre (masculin, féminin, non-binaire) et du style de génération.
- Génération de lots de noms aléatoires directement depuis les données JSON partagées avec la version legacy.
- Animations fluides grâce à Framer Motion pour les listes, panneaux et messages d’état.
- Historique des propositions récentes et gestion des favoris avec persistance localStorage.
- Copie rapide des noms dans le presse-papiers avec fallback automatique.
- Interface responsive adaptée aux mobiles (pile verticale) comme aux grands écrans (grille à trois colonnes).

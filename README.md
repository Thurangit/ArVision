# ArVision

Application React.js avec Réalité Augmentée (AR) utilisant AR.js et A-Frame pour l'Image Tracking.

## Installation

```bash
npm install
```

## Démarrage

```bash
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Routes disponibles

- `/` - Page d'accueil avec informations sur les descripteurs d'image
- `/ar` - Page de Réalité Augmentée avec Image Tracking
- `/test1` - Première page de test
- `/test2` - Deuxième page de test

## Fonctionnalités

### 🎯 Réalité Augmentée (Image Tracking)
- Utilise les fichiers de descripteurs (.fset, .fset3, .iset)
- Tracking d'image en temps réel avec AR.js
- Affichage de contenu 3D interactif
- Stabilisation avancée avec smoothing

### 📸 Reconnaissance d'images
- Comparaison d'images avec les descripteurs
- Calcul de similarité
- Support de multiples formats de descripteurs

## Fichiers de descripteurs

Les fichiers de descripteurs d'image sont situés dans :
```
public/composant/image-a-reconnaitre/
```

- `logoGifty144x144.fset` - Descripteur principal
- `logoGifty144x144.fset3` - Descripteur version 3
- `logoGifty144x144.iset` - Descripteur alternatif

## Technologies utilisées

- **React** 18.3.1
- **React Router DOM** 7.5.1
- **AR.js** - Réalité Augmentée
- **A-Frame** - Framework WebVR/AR
- **Material-UI** - Composants UI
- **Bootstrap & React-Bootstrap** - Framework CSS
- **Tailwind CSS** - Utility-first CSS
- **Axios** - Client HTTP
- **Framer Motion** - Animations
- Et toutes les autres dépendances de QapitalFront_N

## Documentation AR

Consultez [AR_README.md](./AR_README.md) pour le guide complet d'utilisation de la fonctionnalité de Réalité Augmentée.

## Notes importantes

- L'application nécessite une webcam pour fonctionner
- Les fichiers de descripteurs doivent être accessibles depuis le dossier `public`
- Pour de meilleurs résultats, utilisez une image de haute qualité (300 DPI)


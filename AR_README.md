# Guide d'utilisation de la Réalité Augmentée - ArVision

## Vue d'ensemble

ArVision utilise **AR.js** avec **A-Frame** pour implémenter l'Image Tracking (NFT - Natural Feature Tracking). Cette technologie permet de scanner une image et d'afficher du contenu 3D en réalité augmentée par-dessus.

## Fichiers de descripteurs

Les fichiers de descripteurs d'image sont situés dans :
```
public/composant/image-a-reconnaitre/
```

Fichiers disponibles :
- `logoGifty144x144.fset` - Descripteur principal
- `logoGifty144x144.fset3` - Descripteur version 3
- `logoGifty144x144.iset` - Descripteur alternatif

## Comment utiliser

### 1. Accéder à la page AR

Depuis la page d'accueil, cliquez sur le bouton **"Lancer la Réalité Augmentée"** ou accédez directement à `/ar`.

### 2. Autoriser l'accès à la caméra

Lors du premier chargement, votre navigateur vous demandera l'autorisation d'accéder à votre caméra. Acceptez pour continuer.

### 3. Chargement des descripteurs

Un écran de chargement apparaîtra pendant que les descripteurs d'image sont chargés. Cela peut prendre quelques instants selon la puissance de votre appareil.

### 4. Scanner l'image

Une fois chargé :
- Pointez votre caméra vers l'image **logoGifty144x144**
- L'image doit être bien éclairée et visible
- Maintenez une distance appropriée (ni trop près, ni trop loin)
- Le contenu 3D apparaîtra au-dessus de l'image détectée

## Contenu 3D affiché

Actuellement, la page AR affiche :
- **Une boîte bleue animée** qui tourne
- **Un texte "ArVision"** en 3D
- **Une sphère verte animée** qui se déplace

## Personnalisation

### Modifier le contenu 3D

Éditez le fichier `src/pages/ARPage.js` et modifiez la section `<a-nft>` :

```jsx
<a-nft
  type="nft"
  url="/composant/image-a-reconnaitre/logoGifty144x144"
  smooth="true"
  smoothCount="10"
  smoothTolerance=".01"
  smoothThreshold="5"
>
  {/* Ajoutez votre contenu 3D ici */}
  <a-box position="0 0.5 0" color="#FF0000"></a-box>
</a-nft>
```

### Ajouter un modèle GLTF

Pour charger un modèle 3D personnalisé :

```jsx
<a-entity
  gltf-model="/path-to-your-model.gltf"
  scale="0.5 0.5 0.5"
  position="0 0.5 0"
></a-entity>
```

### Paramètres de tracking

Les paramètres de l'élément `<a-nft>` :

- `smooth="true"` - Active le lissage pour une meilleure stabilité
- `smoothCount="10"` - Nombre de matrices pour le lissage (plus = plus fluide mais plus lent)
- `smoothTolerance=".01"` - Tolérance de distance pour le lissage
- `smoothThreshold="5"` - Seuil pour maintenir la position stable
- `size="1"` - Taille du marqueur en mètres

## Compatibilité

### Navigateurs supportés
- Chrome/Edge (recommandé)
- Firefox
- Safari (iOS 11+)

### Appareils
- **Desktop** : Nécessite une webcam
- **Mobile** : Fonctionne sur iOS et Android avec caméra

## Conseils pour de meilleurs résultats

1. **Éclairage** : Assurez-vous que l'image est bien éclairée
2. **Stabilité** : Maintenez votre appareil stable
3. **Distance** : Gardez une distance appropriée (environ 30-50 cm)
4. **Angle** : Évitez les angles trop prononcés
5. **Qualité de l'image** : Utilisez une image de haute qualité (300 DPI recommandé)

## Dépannage

### La caméra ne démarre pas
- Vérifiez les permissions de votre navigateur
- Assurez-vous qu'aucune autre application n'utilise la caméra

### L'image n'est pas détectée
- Vérifiez que vous pointez vers la bonne image (logoGifty144x144)
- Améliorez l'éclairage
- Rapprochez-vous ou éloignez-vous légèrement

### Le contenu 3D ne s'affiche pas
- Attendez que les descripteurs soient complètement chargés
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous que l'image est bien détectée (indicateur vert)

## Documentation technique

- [AR.js Documentation](https://ar-js-org.github.io/AR.js-Docs/)
- [A-Frame Documentation](https://aframe.io/docs/)
- [NFT Marker Creator](https://github.com/Carnaux/NFT-Marker-Creator)


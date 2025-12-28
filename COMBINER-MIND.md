# Guide pour combiner plusieurs fichiers .mind

Pour supporter plusieurs images cibles (personne, montre, télé) dans MindAR, vous devez créer un fichier .mind combiné qui contient tous les targets.

## Option 1: Utiliser l'outil MindAR en ligne

1. Allez sur https://hiukim.github.io/mind-ar-js/tools/compile/
2. Téléchargez vos images cibles (personne.jpg, montre.jpg, télé.jpg)
3. Compilez-les ensemble pour créer un fichier .mind combiné
4. Remplacez le fichier dans `/composant/image-a-reconnaitre/` par le fichier combiné

## Option 2: Utiliser la ligne de commande MindAR

Si vous avez installé MindAR CLI:

```bash
mind-ar-image-compiler -i personne.jpg montre.jpg télé.jpg -o combined.mind
```

## Option 3: Utiliser plusieurs fichiers .mind séparés

Si vous préférez garder les fichiers séparés, vous devrez modifier le code pour utiliser plusieurs scènes MindAR (une par target), mais cela peut affecter les performances.

## Configuration actuelle

Le code est configuré pour utiliser un seul fichier .mind avec plusieurs targets:
- Target 0: personne
- Target 1: montre  
- Target 2: télé

Une fois le fichier .mind combiné créé, mettez-le dans `/composant/image-a-reconnaitre/` et mettez à jour l'URL dans `MindARImagePage.js`.


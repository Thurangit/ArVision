# Instructions d'installation pour ArVision

## Problème de compatibilité Node.js/npm

Si vous rencontrez des erreurs de compatibilité entre Node.js v18.8.0 et npm v11.1.0, voici les solutions :

## Solution 1 : Réinstallation complète (Recommandée)

Exécutez le script batch :
```bash
clean-install.bat
```

Ou manuellement :
```bash
# Supprimer node_modules et package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Nettoyer le cache npm
npm cache clean --force

# Réinstaller avec legacy-peer-deps
npm install --legacy-peer-deps
```

## Solution 2 : Mettre à jour Node.js (Meilleure solution)

Téléchargez et installez Node.js LTS (version >=20.17.0) depuis :
https://nodejs.org/

Puis réinstallez les dépendances :
```bash
npm install
```

## Solution 3 : Utiliser une version compatible de npm

```bash
npm install -g npm@9
npm install
```

## Après l'installation

Démarrez l'application :
```bash
npm start
```

L'application sera accessible sur http://localhost:3000


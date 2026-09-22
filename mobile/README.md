# Caisse Familiale — application Android

Version mobile (installable en APK) de l'application de gestion de caisse
familiale. Toutes les données (dépenses, recettes, prêts) sont stockées
**uniquement sur le téléphone**, dans une base SQLite locale — aucune
connexion internet n'est nécessaire pour l'utiliser au quotidien.

## Stack technique

- React + Vite (interface)
- [sql.js](https://sql.js.org/) : base SQLite qui tourne entièrement dans
  l'appli (WebAssembly)
- [Capacitor](https://capacitorjs.com/) : encapsule l'appli web dans une
  vraie appli Android
- `@capacitor/filesystem` : sauvegarde le fichier de base de données sur le
  stockage privé de l'appli à chaque modification

## Récupérer l'APK

Un fichier `.apk` est généré automatiquement par GitHub Actions à chaque
mise à jour de ce dossier, et publié dans les
[Releases](../../releases) du dépôt (tag `apk-latest`). Il suffit de le
télécharger sur le téléphone et de l'ouvrir pour l'installer (autoriser
"sources inconnues" si Android le demande).

## Développer

```bash
npm install
npm run dev       # aperçu dans le navigateur
npm run build     # build de production dans dist/
npx cap sync android
```

Pour compiler l'APK vous-même (nécessite le SDK Android + Java) :

```bash
cd android
./gradlew assembleDebug
# APK généré dans android/app/build/outputs/apk/debug/app-debug.apk
```

# Caisse Familiale

Application simple pour suivre les dépenses, les recettes (ventes) et les
prêts/emprunts d'un foyer ou d'une petite activité (cuisine, vente de
boissons, etc.).

## Fonctionnalités (V1)

- **Tableau de bord** : solde actuel de la caisse, totaux du mois, dernières
  opérations, prêts en cours.
- **Dépenses / Recettes** : ajout rapide avec catégorie, montant, date,
  description ; historique modifiable et supprimable.
- **Prêts et emprunts** : qui doit quoi, remboursements partiels suivis
  automatiquement, montant restant calculé pour chaque personne.
- **Catégories** : personnalisables (loyer, électricité, ingrédients,
  ventes...).
- **Réglages** : nom de la caisse, devise (FCFA par défaut).

Les données sont stockées localement dans un fichier SQLite
(`data/app.db`, ignoré par git) — aucune connexion internet requise pour
l'utiliser au quotidien.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Pour un usage en continu (ex. sur un ordinateur ou une petite box à la
maison) :

```bash
npm run build
npm run start
```

## Prochaine étape

La V1 est conçue pour une seule personne / un seul foyer. Le schéma de
données est pensé pour qu'on puisse ajouter, plus tard, un compte par
utilisateur et le partage entre plusieurs foyers sans tout reconstruire.

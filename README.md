# NRJ Ingénierie — Calculateur de forfait de pose PV

Application web statique, mobile-first, sans compte ni serveur, conçue pour calculer le forfait de pose photovoltaïque directement sur chantier.

## Fonctionnement

- Calcul en direct du score et du forfait F1 à F5.
- Application des planchers/plafonds liés à la puissance.
- Devis manuel sous 1 kWc ou au-dessus de 12 kWc.
- Détail complet du calcul.
- Avertissement fibrociment.
- Alerte si Backup = Oui avec Batterie = Non.
- Pose au sol / carport / pergola : remise automatique à 0 point et désactivation des critères toiture non pertinents.
- Aucun stockage ni envoi de données.
- Aucun framework et aucune dépendance JavaScript.

## Charte graphique

L'interface utilise uniquement les couleurs prévues :

- Vert NRJ : `#A5C83F`
- Gris NRJ : `#5A5A5A`
- Blanc : `#FFFFFF`
- Vert foncé : `#0F3831`
- Jaune : `#FFD618` (accent, jamais utilisé comme couleur de texte)
- Police : Montserrat via Google Fonts

Le logo n'est volontairement pas redessiné ou extrait du PDF de charte. Pour afficher un logo, ajoutez un fichier officiel fourni par NRJ Ingénierie et remplacez le texte de marque dans `index.html`.

## Ouvrir dans VS Code

1. Dézipper le dossier.
2. Ouvrir le dossier `nrj-calculateur-pose-pv` dans VS Code.
3. Pour un aperçu local, utiliser l'extension **Live Server** puis ouvrir `index.html` avec Live Server.

Le site utilise des modules JavaScript, donc il vaut mieux passer par un petit serveur local plutôt que d'ouvrir directement `index.html` avec `file://`.

## Tests du barème

Si Node.js est installé :

```bash
npm test
```

Résultat attendu :

```text
✓ 14/14 cas de référence validés
```

## GitHub

Dans le terminal VS Code :

```bash
git init
git add .
git commit -m "Initialisation calculateur NRJ pose PV"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/VOTRE-REPO.git
git push -u origin main
```

## Déploiement Netlify

### Méthode recommandée : GitHub

1. Netlify → **Add new project** / **Import an existing project**.
2. Choisir GitHub et sélectionner le dépôt.
3. Build command : laisser vide.
4. Publish directory : `.`
5. Déployer.

`netlify.toml` contient déjà le dossier de publication et des en-têtes de sécurité.

### Déploiement manuel

Il est aussi possible de déposer le dossier dézippé dans Netlify Drop. Le site est entièrement statique.

## Modifier le barème

Tout le barème métier est centralisé dans :

`assets/js/config.js`

Les prix, seuils, tranches de puissance et points par critère peuvent donc être modifiés à un seul endroit.

## Fichiers principaux

- `index.html` : structure de l'application.
- `assets/css/styles.css` : interface responsive.
- `assets/js/config.js` : barème.
- `assets/js/calculator.js` : moteur de calcul.
- `assets/js/app.js` : interactions et affichage.
- `tests/run-tests.js` : 14 cas de référence.
- `netlify.toml` : configuration Netlify et sécurité.

## Confidentialité

Le calcul est effectué uniquement dans le navigateur. Aucun formulaire n'est envoyé, aucune base de données n'est utilisée et aucune donnée chantier n'est conservée.

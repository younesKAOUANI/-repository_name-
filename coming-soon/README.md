# Pharmapedia - Page "Bientôt disponible"

Cette page autonome affiche un message "Coming Soon" avec le même style et les mêmes couleurs que le projet principal Pharmapedia.

## 🎨 Caractéristiques

- Design moderne avec animations fluides
- Gradient violet/indigo cohérent avec la marque
- Compte à rebours dynamique jusqu'au lancement
- Formulaire de notification par email
- Particules animées en arrière-plan
- 100% responsive (mobile, tablette, desktop)
- Aucune dépendance externe (HTML/CSS/JS pur)

## 🚀 Utilisation

### Option 1: Ouvrir directement
Ouvrez simplement `index.html` dans votre navigateur.

### Option 2: Serveur local
```bash
# Avec Python
python -m http.server 8000

# Avec Node.js (http-server)
npx http-server

# Avec PHP
php -S localhost:8000
```

Puis visitez: `http://localhost:8000`

## ⚙️ Configuration

### Changer la date de lancement
Modifiez la ligne 286 dans `index.html`:

```javascript
const launchDate = new Date('2025-12-31T00:00:00').getTime();
```

### Personnaliser les couleurs
Les couleurs principales sont définies dans les gradients CSS:
- `#667eea` (bleu-violet)
- `#764ba2` (violet)

### Ajouter le logo
1. Placez votre logo `pharmapedia-logo.png` dans le dossier `coming-soon/`
2. Ou mettez à jour le chemin dans la ligne 269

### Intégrer la notification email
Remplacez l'alerte JavaScript (ligne 302) par un appel API:

```javascript
fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email })
})
.then(res => res.json())
.then(data => {
    alert('Merci ! Vous serez notifié(e) au lancement ! 🚀');
});
```

## 📱 Réseaux sociaux

Mettez à jour les liens sociaux (lignes 284-286):
```html
<a href="https://facebook.com/votre-page">📘</a>
<a href="https://instagram.com/votre-page">📷</a>
<a href="https://linkedin.com/company/votre-page">💼</a>
```

## 🌐 Déploiement

### GitHub Pages
1. Placez le contenu dans un dossier `gh-pages` ou à la racine
2. Activez GitHub Pages dans les paramètres du repo

### Netlify
1. Glissez-déposez le dossier `coming-soon` sur Netlify
2. Ou connectez votre repo GitHub

### Serveur VPS
```bash
# Copiez le dossier sur votre serveur
scp -r coming-soon/ user@server:/var/www/html/

# Ou avec Nginx, pointez vers ce dossier:
# /etc/nginx/sites-available/default
root /var/www/html/coming-soon;
```

## 📄 Structure

```
coming-soon/
├── index.html          # Page principale (tout-en-un)
├── README.md          # Ce fichier
└── pharmapedia-logo.png  # Logo (à ajouter)
```

## 🎯 Personnalisation avancée

- **Animations**: Modifiez les keyframes CSS (lignes 30-46)
- **Particules**: Changez le nombre à la ligne 240
- **Fonctionnalités**: Personnalisez la section features (lignes 124-153)

## 📞 Support

Pour toute question, contactez: contact@pharmapedia-dz.com

---

**Made with 💜 by Pharmapedia Team**

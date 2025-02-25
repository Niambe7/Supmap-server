# SUPMAP-API - Backend

Ce projet est l'API backend de SUPMAP, construite avec Express.js et PostgreSQL.

## 📌 Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- **Node.js** (version 16 ou supérieure)
- **npm** (inclus avec Node.js)
- **PostgreSQL** (dernière version stable)

---

## 🚀 Installation

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/TON_REPO/supmap-api.git
cd supmap-api
```

### 2️⃣ Installer les dépendances
```bash
npm install
```

### 3️⃣ Configurer la base de données PostgreSQL

Assurez-vous d'avoir PostgreSQL installé et en cours d'exécution. Créez une base de données pour le projet :

```sql
CREATE DATABASE supmap;
```

Modifiez le fichier `.env` à la racine du projet pour inclure :
```ini
PORT=3000
DATABASE_URL=postgresql://Supmap:niambe@localhost:5432/supmap
SECRET_KEY=MaSuperSecretKey
GOOGLE_CLIENT_ID="TON_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="TON_GOOGLE_CLIENT_SECRET"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/users/auth/google/callback"
```

---

## 🏃 Démarrer le serveur

### En mode développement (avec rechargement automatique)
```bash
npm run dev
```

### En mode production
```bash
npm start
```

L'API tournera sur `http://localhost:3000/`.

---

## 📁 Structure du projet

```
SUPMAP-API
│── config
│   ├── passports.js
│── controllers
│   ├── incidentController.js
│   ├── itineraryController.js
│   ├── userController.js
│── routes
│   ├── auth.js
│   ├── incidentRoutes.js
│   ├── itineraryRoutes.js
│   ├── userRoutes.js
│── .env
│── .gitignore
│── db.js
│── package.json
│── server.js
```

---

## 🔥 Routes principales

### Authentification
- `POST /api/users/login` → Connexion avec email/mot de passe
- `GET /api/users/auth/google` → Connexion avec Google
- `GET /api/users/auth/google/callback` → Callback Google

### Utilisateurs
- `GET /api/users` → Récupérer tous les utilisateurs
- `GET /api/users/:id` → Récupérer un utilisateur

### Incidents
- `POST /api/incidents` → Créer un incident
- `GET /api/incidents` → Récupérer tous les incidents

### Itinéraires
- `POST /api/itineraries` → Créer un itinéraire
- `GET /api/itineraries` → Récupérer tous les itinéraires

---

## 🔄 Contribuer

1. **Créer une branche pour votre travail**
```bash
git checkout -b feature/nom-de-la-feature
```
2. **Pousser la branche sur GitHub**
```bash
git push origin feature/nom-de-la-feature
```
3. **Faire une Pull Request**

---

## 👨‍💻 Auteur

**Ndiambe Gueye**


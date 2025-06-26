# 🧠 SMP – Services Management Platform

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.10-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)

SMP est une plateforme intelligente qui simplifie l'accès, la contractualisation et le paiement des prestations de service pour les entreprises (EI, TPE, PME).

## 🚀 Mission

Simplifier la gestion des prestations de services professionnels en offrant une expérience fluide, rapide et sécurisée pour connecter les clients avec les prestataires de services.

## ✨ Fonctionnalités

### ✅ Fonctionnalités Implémentées (V1)

- **🏠 Landing Page** : Interface d'accueil moderne avec présentation de la plateforme
- **📋 Catalogue d'offres** : Affichage et filtrage des services disponibles
- **🔐 Authentification complète** : 
  - Connexion par email/mot de passe
  - Support GitHub OAuth (configurable)
  - Gestion des sessions sécurisée
- **💬 Système de messagerie** : 
  - Chat en temps réel avec Socket.IO
  - Conversations liées aux offres
  - Notifications sonores
- **👤 Gestion des utilisateurs** : Profils, rôles (Client/Admin)
- **🎨 Interface moderne** : Design responsive avec mode sombre/clair
- **🤖 IA Générative** : Amélioration automatique des annonces avec Google Gemini

### 🚧 Fonctionnalités En Développement

- **📝 Système de contrats** : Génération et gestion automatisée
- **💰 Paiements sécurisés** : Intégration Escrow pour transactions sécurisées
- **🎯 Matching IA** : Recommandations intelligentes client/prestataire
- **📊 Tableau de bord** : Analytics et suivi des performances

## 🛠️ Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Frontend** | Next.js (App Router) | 15.3.4 |
| **Language** | TypeScript | 5.0 |
| **Authentification** | NextAuth.js | 5.0 |
| **Base de données** | SQLite + Prisma ORM | 6.10.1 |
| **Styling** | Tailwind CSS | 4.0 |
| **UI Components** | Radix UI | - |
| **Temps réel** | Socket.IO | 4.8.1 |
| **IA** | Google Generative AI | 0.24.1 |
| **Sécurité** | bcrypt | 6.0.0 |

## 🚀 Installation et Configuration

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Git

### Installation

1. **Cloner le repository**
```bash
git clone [URL_DU_REPO]
cd services
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env.local
```

Configurez les variables d'environnement :
```env
# Base de données
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="votre-secret-super-securise"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (optionnel)
GITHUB_ID="votre-github-client-id"
GITHUB_SECRET="votre-github-client-secret"

# Google AI (pour l'amélioration des annonces)
GOOGLE_API_KEY="votre-cle-google-ai"
```

4. **Initialiser la base de données**
```bash
npx prisma generate
npx prisma db push
```

5. **Peupler la base de données**
```bash
npm run seed
```

6. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📊 Structure du Projet

```
src/
├── app/                          # App Router (Next.js 13+)
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentification
│   │   ├── conversations/        # Gestion des conversations
│   │   ├── offers/               # CRUD des offres
│   │   └── contracts/            # Gestion des contrats
│   ├── auth/                     # Pages d'authentification
│   ├── conversations/            # Interface de messagerie
│   ├── offres/                   # Catalogue et gestion des offres
│   └── components/               # Composants spécifiques
├── components/                   # Composants réutilisables
│   └── ui/                       # Composants UI de base
├── lib/                         # Utilitaires et configurations
├── hooks/                       # React Hooks personnalisés
├── pages/api/                   # API Routes (format pages)
└── scripts/                     # Scripts utilitaires
    └── seed.ts                  # Script de peuplement
```

## 🗄️ Modèle de Données

### Entités Principales

- **User** : Utilisateurs (clients et prestataires)
- **Offer** : Offres de services
- **Conversation** : Discussions entre utilisateurs
- **Message** : Messages dans les conversations
- **Contract** : Contrats générés (en développement)
- **ContractStep** : Étapes des contrats (en développement)

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement avec Turbopack

# Production
npm run build            # Build de production
npm run start            # Serveur de production

# Base de données
npm run seed             # Peupler la base de données
npx prisma studio        # Interface graphique de la DB
npx prisma generate      # Générer le client Prisma

# Qualité de code
npm run lint             # Linter ESLint
```

## 🎯 Utilisation

### Pour les Clients
1. Créer un compte ou se connecter
2. Parcourir le catalogue d'offres
3. Contacter les prestataires via chat
4. Négocier et finaliser les contrats

### Pour les Prestataires
1. Créer un compte professionnel
2. Publier des offres de services
3. Gérer les conversations clients
4. Suivre les contrats et paiements

### Pour les Administrateurs
- Gestion complète des utilisateurs
- Modération des offres
- Supervision des transactions

## 🔐 Sécurité

- **Hachage des mots de passe** avec bcrypt
- **Sessions sécurisées** avec NextAuth.js
- **Validation des données** côté serveur
- **Protection CSRF** intégrée
- **Authentification JWT** pour les API

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalité`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalité`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation technique
- Contacter l'équipe de développement

## 🔮 Roadmap

### Version 1.1 (Q2 2025)
- [ ] Système de contrats automatisés
- [ ] Paiements Escrow
- [ ] Notifications push

### Version 1.2 (Q3 2025)
- [ ] IA de matching avancée
- [ ] Analytics avancées
- [ ] API mobile

### Version 2.0 (Q4 2025)
- [ ] Application mobile native
- [ ] Intégrations tierces
- [ ] Marketplace étendu

---

Développé avec ❤️ pour simplifier la gestion des services professionnels.

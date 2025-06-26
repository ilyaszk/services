# 🔔 Système de Gestion des Contrats pour Prestataires

## 📋 Vue d'ensemble

Le système de gestion des contrats permet aux prestataires de recevoir des notifications lorsque des clients demandent leurs services via l'IA, et de gérer efficacement leurs projets en cours.

## 🚀 Fonctionnalités Implémentées

### 1. **Dashboard Prestataire** (`/provider/dashboard`)
- Vue d'ensemble des statistiques :
  - Nombre de nouvelles notifications
  - Projets actifs
  - Échéances urgentes  
  - Revenus totaux
- Aperçu des notifications récentes
- Projets avec échéances proches
- Actions rapides

### 2. **Page des Notifications** (`/provider/notifications`)
- Liste de tous les contrats en attente de validation
- Informations détaillées sur chaque demande :
  - Description du projet
  - Prix et durée estimée
  - Informations du client
  - Date de la demande
- Actions disponibles :
  - **Accepter** : avec sélection d'une date limite
  - **Refuser** : avec raison optionnelle

### 3. **Page des Projets** (`/provider/projects`)
- Liste des projets acceptés en cours
- Statistiques rapides (projets actifs, en retard, revenus)
- Pour chaque projet :
  - Statut de l'échéance (en cours, urgent, en retard)
  - Informations client
  - Timeline du projet (accepté, commencé, date limite)
  - Actions (voir contrat, contacter client)

## 🔄 Processus de Gestion des Contrats

### Étape 1: Génération de Contrat par l'IA
1. Un client utilise l'IA pour analyser ses besoins
2. L'IA génère des chemins de services avec des offres réelles
3. Le client crée un contrat basé sur ces suggestions
4. Les étapes du contrat sont assignées aux prestataires concernés

### Étape 2: Notification au Prestataire
1. Le prestataire reçoit une notification (statut `PENDING`)
2. Il peut voir les détails dans `/provider/notifications`
3. Il a accès aux informations du client et du projet

### Étape 3: Décision du Prestataire
**Si accepté :**
- Statut passe à `ACCEPTED`
- Date d'acceptation et de début enregistrées
- Date limite définie par le prestataire
- Projet apparaît dans `/provider/projects`

**Si refusé :**
- Statut passe à `REJECTED`
- Date de refus et raison enregistrées
- Le client est notifié du refus

### Étape 4: Gestion du Projet
- Suivi de l'échéance dans la liste des projets
- Alertes visuelles pour les projets urgents
- Communication possible avec le client
- Accès au contrat complet

## 🗄️ Structure de la Base de Données

### Nouveaux Champs `ContractStep`
```prisma
model ContractStep {
  // ... champs existants
  acceptedAt      DateTime?    // Date d'acceptation
  rejectedAt      DateTime?    // Date de refus
  startDate       DateTime?    // Date de début du projet
  deadline        DateTime?    // Date limite définie par le prestataire
  rejectionReason String?      // Raison du refus (optionnel)
}
```

## 🛠️ APIs Créées

### 1. **GET `/api/provider/notifications`**
Récupère toutes les notifications en attente pour le prestataire connecté.

### 2. **POST `/api/provider/contracts/[id]/accept`**
Accepte un contrat avec une date limite.
```json
{
  "deadline": "2024-01-15T10:00:00.000Z"
}
```

### 3. **POST `/api/provider/contracts/[id]/reject`**
Refuse un contrat avec une raison optionnelle.
```json
{
  "reason": "Pas disponible actuellement"
}
```

### 4. **GET `/api/provider/projects`**
Récupère tous les projets acceptés du prestataire.

## 🎨 Interface Utilisateur

### Navigation
- **Dashboard** : vue d'ensemble
- **Notifications** : gestion des demandes
- **Mes Projets** : suivi des projets en cours

### Indicateurs Visuels
- **Badges colorés** pour les statuts d'urgence
- **Cartes statistiques** avec icônes
- **Timeline** des projets
- **Alertes** pour les échéances

## 👥 Comptes de Test

### Prestataires
- **Jean Dupont** : `jean.dupont@techexperts.com` / `tech789`
- **Laura Blanc** : `laura.blanc@designstudio.fr` / `design123`

### Clients  
- **Sophie Martin** : `sophie.martin@example.com` / `user456`
- **Utilisateur Test** : `user1@example.com` / `user123`

## 🚦 Comment Tester

1. **Connectez-vous** en tant que prestataire
2. **Allez sur le Dashboard** pour voir les statistiques
3. **Vérifiez les Notifications** pour les contrats en attente
4. **Acceptez un contrat** en définissant une date limite
5. **Consultez Mes Projets** pour voir le projet accepté
6. **Testez le refus** d'un autre contrat

Le système est maintenant opérationnel et permet une gestion complète du cycle de vie des contrats du point de vue du prestataire ! 🎉

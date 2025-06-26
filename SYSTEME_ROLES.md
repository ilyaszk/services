# Système de Rôles Unifié

## Vue d'ensemble

Le nouveau système de rôles permet aux utilisateurs d'avoir un seul compte qui peut fonctionner à la fois comme client et prestataire, éliminant le besoin de créer plusieurs comptes.

## Fonctionnalités principales

### 1. Rôle unifié
- Tous les utilisateurs commencent avec le rôle "Client"
- Ils gardent ce rôle unique tout au long de leur utilisation
- Le mode d'affichage change selon leurs besoins

### 2. Commutateur de rôle
- Un toggle dans la navbar permet de basculer entre "Client" et "Prestataire"
- L'interface s'adapte automatiquement selon le mode sélectionné
- Les menus et fonctionnalités changent en conséquence

### 3. Activation automatique du mode prestataire
- Dès qu'un utilisateur poste sa première offre, il peut accéder au mode prestataire
- Les fonctionnalités prestataire deviennent disponibles (dashboard, notifications, projets)

## Pages et fonctionnalités

### Mode Client
- **Dashboard Client** (`/client/dashboard`) : Suivi des projets en cours, temps restant, avancements
- **Mes Offres** (`/offres/mes-offres`) : Gestion des offres postées
- **Contrats** (`/contrats`) : Vue des contrats depuis la perspective client

### Mode Prestataire  
- **Dashboard Prestataire** (`/provider/dashboard`) : Vue d'ensemble des projets et revenus
- **Notifications** (`/provider/notifications`) : Nouvelles opportunités et demandes
- **Mes Projets** (`/provider/projects`) : Gestion des projets acceptés

## Composants techniques

### RoleProvider
Le contexte React qui gère l'état du rôle actuel :
```tsx
import { RoleProvider } from "@/components/role-toggle";

// Déjà intégré dans Providers
```

### RoleToggle
Le composant de commutation entre les rôles :
```tsx
import { RoleToggle } from "@/components/role-toggle";

// Déjà intégré dans Navbar
```

### useRole Hook
Pour accéder au rôle actuel dans les composants :
```tsx
import { useRole } from "@/components/role-toggle";

function MyComponent() {
  const { currentRole, setCurrentRole, canBeProvider } = useRole();
  
  return (
    <div>
      {currentRole === "client" ? (
        <ClientView />
      ) : (
        <ProviderView />
      )}
    </div>
  );
}
```

## APIs

### `/api/users/can-be-provider`
- **GET** : Vérifie si l'utilisateur peut être prestataire (a posté des offres)
- Retourne : `{ canBeProvider: boolean }`

### `/api/client/dashboard/stats`
- **GET** : Statistiques du dashboard client
- Retourne : `{ totalContracts, activeContracts, completedContracts, totalSpent }`

### `/api/client/dashboard/active-contracts`
- **GET** : Contrats actifs du client avec leurs étapes
- Retourne : Array de contrats avec contractSteps

## Base de données

### Modifications du schéma
```prisma
model User {
  // ... autres champs
  role                   String   @default("Client")
  hasOffersPosted        Boolean  @default(false)
  // ... 
}
```

## Avantages

1. **Simplicité pour l'utilisateur** : Un seul compte à gérer
2. **Flexibilité** : Possibilité d'être à la fois client et prestataire
3. **Activation progressive** : Les fonctionnalités prestataire se débloquent naturellement
4. **Interface intuitive** : Commutateur clair pour changer de perspective
5. **Suivi centralisé** : Dashboard spécialisé pour chaque rôle

## Utilisation

1. L'utilisateur s'inscrit normalement
2. Il commence en mode "Client" par défaut  
3. S'il poste une offre, le mode "Prestataire" devient disponible
4. Il peut basculer entre les deux modes avec le toggle
5. Chaque mode affiche les fonctionnalités appropriées

## Pages de démonstration

- `/demo-roles` : Page de démonstration du système de rôles

"use client";

import { useSession } from "next-auth/react";
import { useRole } from "@/components/role-toggle";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Users, UserCheck } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("client" | "provider")[];
  requiresProvider?: boolean; // Si true, l'utilisateur doit avoir posté des offres
  fallbackPath?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  requiresProvider = false,
  fallbackPath = "/" 
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  const { currentRole, canBeProvider } = useRole();
  const router = useRouter();

  // Si l'utilisateur n'est pas connecté
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Connexion requise
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vous devez être connecté pour accéder à cette page.
            </p>
            <Link 
              href="/auth/signin"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Se connecter
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vérifier si le rôle actuel est autorisé
  const isRoleAllowed = allowedRoles.includes(currentRole);

  // Vérifier si l'utilisateur peut être prestataire si requis
  const canAccessProviderFeatures = !requiresProvider || canBeProvider;

  if (!isRoleAllowed || (currentRole === "provider" && !canAccessProviderFeatures)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              {currentRole === "client" ? (
                <Users className="w-12 h-12 text-blue-500 mx-auto" />
              ) : (
                <UserCheck className="w-12 h-12 text-purple-500 mx-auto" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Accès restreint
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {!isRoleAllowed ? (
                `Cette page est réservée aux ${allowedRoles.join(" et ")}s. Vous êtes actuellement en mode ${currentRole}.`
              ) : (
                "Vous devez avoir posté au moins une offre pour accéder aux fonctionnalités prestataire."
              )}
            </p>
            
            {!isRoleAllowed && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Utilisez le commutateur de rôle dans la barre de navigation pour changer de mode.
              </p>
            )}

            {currentRole === "provider" && !canAccessProviderFeatures && (
              <Link 
                href="/offres/new"
                className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium mr-2"
              >
                Poster une offre
              </Link>
            )}
            
            <Link 
              href={fallbackPath}
              className="inline-block bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Retour
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook utilitaire pour vérifier les permissions
export function useRolePermissions() {
  const { currentRole, canBeProvider } = useRole();
  
  return {
    isClient: currentRole === "client",
    isProvider: currentRole === "provider",
    canAccessProviderFeatures: canBeProvider,
    hasRole: (role: "client" | "provider") => currentRole === role,
    canAccess: (allowedRoles: ("client" | "provider")[], requiresProvider = false) => {
      const isRoleAllowed = allowedRoles.includes(currentRole);
      const canAccessProvider = !requiresProvider || canBeProvider;
      return isRoleAllowed && (currentRole !== "provider" || canAccessProvider);
    }
  };
}

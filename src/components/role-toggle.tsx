"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Users, UserCheck } from "lucide-react";

interface RoleContextType {
  currentRole: "client" | "provider";
  setCurrentRole: (role: "client" | "provider") => void;
  canBeProvider: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [currentRole, setCurrentRole] = useState<"client" | "provider">("client");
  const [canBeProvider, setCanBeProvider] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      // Vérifier si l'utilisateur peut être prestataire (a posté des offres)
      checkIfCanBeProvider();
    }
  }, [session?.user?.id]);

  const checkIfCanBeProvider = async () => {
    try {
      const response = await fetch(`/api/users/can-be-provider`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCanBeProvider(data.canBeProvider);
      } else {
        // En cas d'erreur API, permettre à tous d'être prestataires
        setCanBeProvider(true);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut prestataire:", error);
      setCanBeProvider(true); // Valeur par défaut
    }
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, canBeProvider }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

export function RoleToggle() {
  const { currentRole, setCurrentRole, canBeProvider } = useRole();
  const { data: session } = useSession();

  // N'affiche le toggle que si l'utilisateur est connecté
  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <Button
        variant={currentRole === "client" ? "default" : "ghost"}
        size="sm"
        onClick={() => setCurrentRole("client")}
        className={`flex items-center space-x-1 ${
          currentRole === "client" 
            ? "bg-blue-500 text-white" 
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        <Users size={16} />
        <span>Client</span>
      </Button>
      <Button
        variant={currentRole === "provider" ? "default" : "ghost"}
        size="sm"
        onClick={() => setCurrentRole("provider")}
        className={`flex items-center space-x-1 ${
          currentRole === "provider" 
            ? "bg-purple-500 text-white" 
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        <UserCheck size={16} />
        <span>Prestataire</span>
      </Button>
    </div>
  );
}

export function RoleToggleCompact() {
  const { currentRole, setCurrentRole, canBeProvider } = useRole();
  const { data: session } = useSession();

  // N'affiche le toggle que si l'utilisateur est connecté
  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <Button
        variant={currentRole === "client" ? "default" : "ghost"}
        size="sm"
        onClick={() => setCurrentRole("client")}
        className={`flex items-center space-x-1 text-xs px-2 py-1 ${
          currentRole === "client" 
            ? "bg-blue-500 text-white" 
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        <Users size={14} />
        <span>Client</span>
      </Button>
      <Button
        variant={currentRole === "provider" ? "default" : "ghost"}
        size="sm"
        onClick={() => setCurrentRole("provider")}
        className={`flex items-center space-x-1 text-xs px-2 py-1 ${
          currentRole === "provider" 
            ? "bg-purple-500 text-white" 
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        <UserCheck size={14} />
        <span>Prestataire</span>
      </Button>
    </div>
  );
}

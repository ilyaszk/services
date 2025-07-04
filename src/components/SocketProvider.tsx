"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function useSocketContext() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      // Déconnecter si pas de session
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Vérifier si on est côté client et qu'on n'a pas déjà une connexion
    if (typeof window !== "undefined" && !socket) {
      // Initialiser le serveur socket d'abord
      fetch("/api/socket")
        .then(() => {
          const newSocket = io({
            path: "/api/socket",
            query: {
              userId: session.user.id,
            },
            transports: ["polling", "websocket"],
            upgrade: true,
            rememberUpgrade: true,
            timeout: 20000,
          });

          newSocket.on("connect", () => {
            console.log("Connecté au serveur Socket.io");
            setIsConnected(true);
          });

          newSocket.on("connect_error", (error) => {
            console.error("Erreur de connexion Socket.io:", error);
            setIsConnected(false);
          });

          newSocket.on("disconnect", (reason) => {
            console.log("Déconnecté du serveur Socket.io:", reason);
            setIsConnected(false);
          });

          setSocket(newSocket);
        })
        .catch((error) => {
          console.error("Erreur lors de l'initialisation du socket:", error);
        });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [session?.user?.id]);

  // Nettoyer la connexion quand le composant se démonte
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

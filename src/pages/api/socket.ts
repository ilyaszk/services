import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponse } from "next";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  console.log("Socket handler called", req.url);

  if (!res.socket.server.io) {
    console.log("Initializing Socket.io server");
    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    // Stocker l'instance globalement pour y accéder depuis les autres APIs
    (global as any).socketio = io;

    // Gestion des connexions de socket
    io.on("connection", (socket) => {
      console.log("Nouveau client connecté:", socket.id);

      const userId = socket.handshake.query.userId as string;
      const conversationId = socket.handshake.query.conversationId as string;

      // Pour les notifications de contrats, on n'a besoin que de l'userId
      if (userId) {
        // Rejoindre la salle des notifications pour cet utilisateur
        socket.join(`user_${userId}`);
        console.log(`Utilisateur ${userId} connecté pour les notifications`);
      }

      if (!userId || !conversationId) {
        // Si pas de conversationId, on reste connecté pour les notifications
        if (!userId) {
          console.log("Connexion refusée: ID utilisateur manquant");
          socket.disconnect();
          return;
        }
        return; // Continue sans rejoindre de conversation spécifique
      }

      // Rejoindre la salle de conversation
      socket.join(conversationId);

      console.log(
        `Utilisateur ${userId} a rejoint la conversation ${conversationId}`
      );
      // Écouter les nouveaux messages
      socket.on("send_message", (messageData) => {
        // Envoi du message à tous les clients dans cette salle sauf l'émetteur
        socket.to(conversationId).emit("new_message", messageData);
      });

      // Gérer l'état "en train d'écrire"
      socket.on("typing", (data) => {
        // Informer les autres participants que quelqu'un est en train d'écrire
        socket.to(conversationId).emit("user_typing", {
          userId: data.userId,
          username: data.username,
          isTyping: data.isTyping,
        });
      });

      // Gérer l'événement de rejoindre une conversation
      socket.on("join_conversation", (data) => {
        console.log(
          `Utilisateur ${data.userId} (${data.username}) a rejoint la conversation ${conversationId}`
        );
        socket.to(conversationId).emit("user_joined", {
          userId: data.userId,
          username: data.username,
        });
      });

      // Gérer l'événement de quitter une conversation
      socket.on("leave_conversation", (data) => {
        console.log(
          `Utilisateur ${data.userId} (${data.username}) a quitté la conversation ${conversationId}`
        );
        socket.to(conversationId).emit("user_left", {
          userId: data.userId,
          username: data.username,
        });
      });

      // Déconnexion
      socket.on("disconnect", () => {
        console.log(
          `Utilisateur ${userId} a quitté la conversation ${conversationId}`
        );
        socket.to(conversationId).emit("user_disconnected", {
          userId: userId,
        });
      });
    });
  } // Indiquer que le serveur Socket.io est actif
  console.log("Socket.io server ready");

  // Répondre avec un message de succès
  res.status(200).json({ ok: true, socketInitialized: !!res.socket.server.io });
}

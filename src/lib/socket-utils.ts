import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer } from "http";

interface NotificationData {
  contractId: string;
  contractTitle: string;
  clientName: string;
  clientEmail: string;
  pendingStepsCount: number;
  totalValue: number;
  createdAt: string;
}

export function emitContractNotification(
  io: SocketIOServer | undefined,
  providerId: string,
  notification: NotificationData
) {
  if (!io) {
    console.log("Socket.io server not available");
    return;
  }

  // Émettre la notification à la salle spécifique de l'utilisateur
  io.to(`user_${providerId}`).emit("new_contract_notification", notification);
  console.log(`Notification envoyée à l'utilisateur ${providerId}:`, notification.contractTitle);
}

export function getSocketServer(): SocketIOServer | undefined {
  try {
    // Essayer de récupérer le serveur Socket.io depuis le processus global
    return (global as any).socketio;
  } catch (error) {
    console.error("Erreur lors de la récupération du serveur Socket.io:", error);
    return undefined;
  }
}

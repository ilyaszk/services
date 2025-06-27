import { NextRequest, NextResponse } from "next/server";
import { getSocketServer, emitContractNotification } from "@/lib/socket-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId est requis" }, { status: 400 });
    }

    const io = getSocketServer();

    if (!io) {
      return NextResponse.json(
        { error: "Serveur Socket.IO non disponible" },
        { status: 503 }
      );
    }

    // Test d'émission d'un message de test
    io.to(`user_${userId}`).emit("test_notification", {
      message: message || "Test de notification Socket.IO",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Notification de test envoyée",
      userId,
      socketConnected: !!io,
    });
  } catch (error) {
    console.error("Erreur lors du test Socket.IO:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Vérifier si le serveur Socket.IO est initialisé
    const socketInitialized = !!(global as any).socketio;

    return NextResponse.json({
      status: socketInitialized ? "active" : "inactive",
      socketInitialized,
      socketServerUrl:
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      path: "/api/socket",
      timestamp: new Date().toISOString(),
      message: socketInitialized
        ? "Socket.IO server is running and ready for connections."
        : "Socket.IO server needs to be initialized. Make a request to /api/socket first.",
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du statut Socket.IO:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        socketInitialized: false,
        status: "error",
      },
      { status: 500 }
    );
  }
}

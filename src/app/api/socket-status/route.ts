import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "ok",
    socketServerUrl:
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
    path: "/api/socket",
    timestamp: new Date().toISOString(),
    message:
      "Pour vous connecter au WebSocket, utilisez cette URL avec le chemin spécifié.",
  });
}

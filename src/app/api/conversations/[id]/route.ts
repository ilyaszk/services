import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic to ensure route params are handled correctly
export const dynamic = "force-dynamic";

// GET /api/conversations/[id] - Obtenir une conversation spécifique
export async function GET(req: NextRequest) {
  try {
    // Extraire l'ID directement de l'URL
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "ID de conversation manquant" },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;
    const conversationId = id;

    // Vérifier si l'utilisateur est participant à cette conversation
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        userId: userId,
        conversationId: conversationId,
      },
    });

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès à cette conversation" },
        { status: 403 }
      );
    }

    // Récupérer les détails de la conversation avec les messages
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        offer: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Marquer tous les messages non lus comme lus (sauf ceux envoyés par l'utilisateur)
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Erreur lors de la récupération de la conversation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

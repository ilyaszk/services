import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic to ensure route params are handled correctly
export const dynamic = 'force-dynamic';

// POST /api/conversations/[id]/messages - Envoyer un message dans une conversation
export async function POST(req: NextRequest) {
  try {
    // Extraire l'ID directement de l'URL
    // La partie avant "/messages" est l'ID de conversation
    const pathParts = req.nextUrl.pathname.split('/');
    const id = pathParts[pathParts.length - 2];

    if (!id) {
      return NextResponse.json({ error: 'ID de conversation manquant' }, { status: 400 });
    }

    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const conversationId = id;

    // Vérifier si l'utilisateur est participant à cette conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée ou accès refusé' },
        { status: 404 }
      );
    }

    // Trouver l'autre participant pour définir le destinataire
    const otherParticipant = conversation.participants.find((p: any) => p.userId !== userId);

    if (!otherParticipant) {
      return NextResponse.json(
        { error: 'Aucun destinataire trouvé dans cette conversation' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Le contenu du message ne peut pas être vide' },
        { status: 400 }
      );
    }

    // Créer le nouveau message
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId: otherParticipant.userId,
        conversationId,
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
    });

    // Mettre à jour la date de la conversation
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/conversations - Récupère les conversations de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupère les conversations où l'utilisateur est participant
    const userParticipations = await prisma.conversationParticipant.findMany({
      where: {
        userId: userId,
      },
      include: {
        conversation: {
          include: {
            offer: {
              select: {
                id: true,
                title: true,
              },
            },
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              select: {
                id: true,
                content: true,
                createdAt: true,
                senderId: true,
              },
            },
            _count: {
              select: {
                messages: {
                  where: {
                    isRead: false,
                    NOT: {
                      senderId: userId,
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        conversation: {
          updatedAt: 'desc',
        },
      },
    }); // Formate les données pour le frontend
    const conversations = userParticipations.map((participation: any) => {
      return {
        id: participation.conversation.id,
        title: participation.conversation.title,
        updatedAt: participation.conversation.updatedAt,
        offer: participation.conversation.offer,
        participants: participation.conversation.participants,
        lastMessage: participation.conversation.messages[0] || null,
        unreadCount: participation.conversation._count.messages,
      };
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/conversations - Crée une nouvelle conversation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { offerId, receiverId, firstMessage } = body;

    if (!offerId || !receiverId || !firstMessage) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Vérifier si l'offre existe
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { author: true },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offre non trouvée' }, { status: 404 });
    }

    // Vérifier si l'utilisateur est l'auteur de l'offre
    if (offer.authorId === userId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas contacter votre propre offre' },
        { status: 400 }
      );
    }

    // Vérifier si une conversation existe déjà entre ces utilisateurs pour cette offre
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        offerId: offerId,
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (existingConversation) {
      // Ajouter un nouveau message à la conversation existante
      await prisma.message.create({
        data: {
          content: firstMessage,
          senderId: userId,
          receiverId: receiverId,
          conversationId: existingConversation.id,
        },
      });

      // Mettre à jour la date de mise à jour de la conversation
      await prisma.conversation.update({
        where: {
          id: existingConversation.id,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(existingConversation);
    }

    // Créer une nouvelle conversation avec les deux participants
    const newConversation = await prisma.conversation.create({
      data: {
        title: `Discussion: ${offer.title}`,
        offerId: offerId,
        participants: {
          create: [
            { userId: userId }, // L'utilisateur actuel
            { userId: receiverId }, // Le destinataire (auteur de l'offre)
          ],
        },
        messages: {
          create: {
            content: firstMessage,
            senderId: userId,
            receiverId: receiverId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: true,
      },
    });

    return NextResponse.json(newConversation, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

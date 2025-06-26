import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitContractNotification, getSocketServer } from "@/lib/socket-utils";

// Créer un nouveau contrat
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { servicePathData } = body;

    if (!servicePathData) {
      return NextResponse.json(
        { error: "Données du chemin de service manquantes" },
        { status: 400 }
      );
    }

    // Créer le contrat principal
    const contract = await prisma.contract.create({
      data: {
        title: servicePathData.name,
        description: servicePathData.description,
        totalPrice: servicePathData.totalPrice,
        estimatedDuration: servicePathData.estimatedDuration,
        clientId: session.user.id,
        servicePathId: servicePathData.id,
        steps: {
          create: servicePathData.steps.map((step: any) => ({
            name: step.name,
            description: step.description,
            price: step.price,
            duration: step.duration,
            isRealOffer: step.isRealOffer,
            offerId: step.offerId || null,
            providerId: step.isRealOffer && step.author?.id ? step.author.id : null,
          })),
        },
      },
      include: {
        steps: {
          include: {
            offer: {
              include: {
                author: true,
              },
            },
            provider: true,
          },
        },
        client: true,
      },
    });

    // Émettre des notifications Socket.io pour chaque prestataire concerné
    const io = getSocketServer();
    const uniqueProviders = new Set<string>();

    contract.steps.forEach((step) => {
      if (step.providerId && !uniqueProviders.has(step.providerId)) {
        uniqueProviders.add(step.providerId);

        // Calculer les informations de notification pour ce prestataire
        const providerSteps = contract.steps.filter(s => s.providerId === step.providerId);
        const notification = {
          contractId: contract.id,
          contractTitle: contract.title,
          clientName: contract.client.name || contract.client.email,
          clientEmail: contract.client.email,
          pendingStepsCount: providerSteps.length,
          totalValue: providerSteps.reduce((sum, s) => sum + s.price, 0),
          createdAt: contract.createdAt.toISOString(),
        };

        emitContractNotification(io, step.providerId, notification);
      }
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Erreur lors de la création du contrat:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Récupérer les contrats de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          {
            clientId: session.user.id,
          },
          {
            steps: {
              some: {
                providerId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        steps: {
          include: {
            offer: {
              include: {
                author: true,
              },
            },
            provider: true,
          },
        },
        client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filtrer les étapes selon le rôle de l'utilisateur
    const filteredContracts = contracts.map(contract => {
      const isClient = contract.clientId === session.user.id;
      const isProvider = contract.steps.some(step => step.providerId === session.user.id);

      // Si c'est un prestataire et pas le client, ne montrer que ses étapes
      if (isProvider && !isClient) {
        return {
          ...contract,
          steps: contract.steps.filter(step => step.providerId === session.user.id)
        };
      }

      // Si c'est le client, montrer toutes les étapes
      return contract;
    });

    return NextResponse.json(filteredContracts);
  } catch (error) {
    console.error("Erreur lors de la récupération des contrats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

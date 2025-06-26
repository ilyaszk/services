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
                contractSteps: {
                    create: servicePathData.steps.map((step: any) => ({
                        name: step.name,
                        description: step.description,
                        price: step.price,
                        duration: step.duration,
                        isRealOffer: step.isRealOffer,
                        offerId: step.offerId || null,
                        providerId: step.author?.id || null,
                    }))
                }
            },
            include: {
                contractSteps: {
                    include: {
                        offer: {
                            include: {
                                author: true
                            }
                        },
                        provider: true
                    }
                },
                client: true
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
                clientId: session.user.id
            },
            include: {
                contractSteps: {
                    include: {
                        offer: {
                            include: {
                                author: true
                            }
                        },
                        provider: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error("Erreur lors de la récupération des contrats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

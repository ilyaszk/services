import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/provider/contracts/[id]/accept - Accepter un contrat
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentification requise" },
                { status: 401 }
            );
        }

        // Extraire l'ID du contrat depuis l'URL
        const pathParts = request.nextUrl.pathname.split('/');
        const contractStepId = pathParts[pathParts.length - 2]; // L'ID est avant "accept"

        if (!contractStepId) {
            return NextResponse.json(
                { error: "ID de contrat manquant" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { deadline } = body; // Date limite fournie par le prestataire

        if (!deadline) {
            return NextResponse.json(
                { error: "Date limite requise" },
                { status: 400 }
            );
        }

        // Vérifier que le contrat appartient bien au prestataire
        const contractStep = await prisma.contractStep.findFirst({
            where: {
                id: contractStepId,
                providerId: session.user.id,
                status: "PENDING"
            }
        });

        if (!contractStep) {
            return NextResponse.json(
                { error: "Contrat non trouvé ou déjà traité" },
                { status: 404 }
            );
        }

        // Accepter le contrat
        const updatedContractStep = await prisma.contractStep.update({
            where: {
                id: contractStepId
            },
            data: {
                status: "ACCEPTED",
                acceptedAt: new Date(),
                startDate: new Date(),
                deadline: new Date(deadline)
            },
            include: {
                contract: {
                    include: {
                        client: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                offer: true
            }
        });

        return NextResponse.json({
            message: "Contrat accepté avec succès",
            contractStep: updatedContractStep
        });

    } catch (error) {
        console.error("Erreur lors de l'acceptation du contrat:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}

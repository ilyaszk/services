import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentification requise" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const contract = await prisma.contract.findUnique({
            where: {
                id: params.id,
                //id: id,
                //clientId: session.user.id // Voir seulement ses propres contrats
            },
            include: {
                steps: {
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

        if (!contract) {
            return NextResponse.json(
                { error: "Contrat non trouvé" },
                { status: 404 }
            );
        }

        // Vérifier que l'utilisateur a le droit de voir ce contrat
        const isClient = contract.clientId === session.user.id;
        const isProvider = contract.steps.some(step => step.providerId === session.user.id);

        if (!isClient && !isProvider) {
            return NextResponse.json(
                { error: "Accès non autorisé à ce contrat" },
                { status: 403 }
            );
        }

        // Si c'est un prestataire, filtrer pour ne montrer que ses étapes
        if (isProvider && !isClient) {
            const filteredContract = {
                ...contract,
                steps: contract.steps.filter(step => step.providerId === session.user.id)
            };
            return NextResponse.json(filteredContract);
        }

        // Si c'est le client, montrer toutes les étapes
        return NextResponse.json(contract);

    } catch (error) {
        console.error("Erreur lors de la récupération du contrat:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}

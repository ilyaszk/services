import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/provider/projects - Récupérer les projets en cours pour le prestataire
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentification requise" },
                { status: 401 }
            );
        }

        // Récupérer tous les contrats acceptés pour ce prestataire
        const acceptedContracts = await prisma.contractStep.findMany({
            where: {
                providerId: session.user.id,
                status: "ACCEPTED"
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
                offer: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                }
            },
            orderBy: {
                deadline: 'asc' // Trier par date limite croissante
            }
        });

        return NextResponse.json(acceptedContracts);

    } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}

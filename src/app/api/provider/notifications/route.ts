import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/provider/notifications - Récupérer les notifications pour le prestataire
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentification requise" },
                { status: 401 }
            );
        }

        // Récupérer tous les contrats en attente pour ce prestataire
        const pendingContracts = await prisma.contractStep.findMany({
            where: {
                providerId: session.user.id,
                status: "PENDING"
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
                createdAt: 'desc'
            }
        });

        return NextResponse.json(pendingContracts);

    } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}

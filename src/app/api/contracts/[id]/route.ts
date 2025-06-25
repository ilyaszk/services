import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentification requise" },
                { status: 401 }
            );
        }

        const contract = await prisma.contract.findUnique({
            where: {
                id: params.id,
                clientId: session.user.id // Voir seulement ses propres contrats
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

        return NextResponse.json(contract);

    } catch (error) {
        console.error("Erreur lors de la récupération du contrat:", error);
        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}

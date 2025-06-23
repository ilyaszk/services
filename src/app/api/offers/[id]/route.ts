import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Récupérer l'offre spécifique par son ID
        const offer = await prisma.offer.findUnique({
            where: {
                id: id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        });

        // Vérifier si l'offre existe
        if (!offer) {
            return NextResponse.json(
                { message: "Offre non trouvée" },
                { status: 404 }
            );
        }

        return NextResponse.json(offer);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'offre:", error);
        return NextResponse.json(
            { message: "Erreur lors de la récupération de l'offre" },
            { status: 500 }
        );
    }
}
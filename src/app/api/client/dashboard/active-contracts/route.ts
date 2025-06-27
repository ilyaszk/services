import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Récupérer les contrats actifs du client avec leurs étapes
    const activeContracts = await prisma.contract.findMany({
      where: { 
        clientId: session.user.id,
        status: { in: ["PENDING", "IN_PROGRESS"] }
      },
      include: {
        steps: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10, // Limiter aux 10 contrats les plus récents
    });

    return NextResponse.json(activeContracts);
  } catch (error) {
    console.error("Erreur lors de la récupération des contrats actifs:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

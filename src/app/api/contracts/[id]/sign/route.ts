import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Signer un contrat (par le client) - signe toutes les étapes du contrat
export async function POST(
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

    const body = await request.json();
    const { signAll = true } = body;

    // Vérifier que le contrat existe et que l'utilisateur est le client
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        steps: {
          include: {
            provider: true,
          },
        },
        client: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contrat non trouvé" },
        { status: 404 }
      );
    }

    if (contract.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul le client peut signer ce contrat" },
        { status: 403 }
      );
    }

    const now = new Date();

    if (signAll) {
      // Récupérer toutes les étapes non signées par le client
      const stepsToSign = await prisma.contractStep.findMany({
        where: {
          contractId: params.id,
        },
      });

      // Signer toutes les étapes du contrat par le client
      for (const step of stepsToSign) {
        await prisma.contractStep.update({
          where: { id: step.id },
          data: {
            clientSignedAt: now,
            updatedAt: now,
          },
        });
      }

      // Mettre à jour le contrat pour marquer la signature du client
      await prisma.contract.update({
        where: { id: params.id },
        data: {
          clientSignedAt: now,
          status: "CLIENT_SIGNED",
          updatedAt: now,
        },
      });
    }

    // Récupérer le contrat mis à jour
    const updatedContract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        steps: {
          include: {
            provider: true,
            offer: {
              include: {
                author: true,
              },
            },
          },
        },
        client: true,
      },
    });

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error("Erreur lors de la signature du contrat:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Signer une étape de contrat par le prestataire
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    // Vérifier que l'étape existe et que l'utilisateur est le prestataire
    const step = await prisma.contractStep.findUnique({
      where: { id: params.stepId },
      include: {
        contract: {
          include: {
            steps: true,
          },
        },
        provider: true,
      },
    });

    if (!step) {
      return NextResponse.json(
        { error: "Étape de contrat non trouvée" },
        { status: 404 }
      );
    }

    if (step.providerId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul le prestataire assigné peut signer cette étape" },
        { status: 403 }
      );
    }

    // Vérifier que le client a déjà signé cette étape
    if (!step.clientSignedAt) {
      return NextResponse.json(
        { error: "Le client doit d'abord signer cette étape" },
        { status: 400 }
      );
    }

    // Vérifier que l'étape n'est pas déjà signée par le prestataire
    if (step.providerSignedAt) {
      return NextResponse.json(
        { error: "Cette étape a déjà été signée par le prestataire" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Signer l'étape par le prestataire
    const updatedStep = await prisma.contractStep.update({
      where: { id: params.stepId },
      data: {
        providerSignedAt: now,
        status: "SIGNED",
        updatedAt: now,
      },
    });

    // Vérifier si toutes les étapes sont maintenant signées
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        steps: true,
      },
    });

    if (contract) {
      const allStepsSigned = contract.steps.every(
        s => s.clientSignedAt && s.providerSignedAt
      );

      if (allStepsSigned) {
        // Marquer le contrat comme entièrement signé
        await prisma.contract.update({
          where: { id: params.id },
          data: {
            allStepsSignedAt: now,
            status: "FULLY_SIGNED",
            updatedAt: now,
          },
        });
      }
    }

    // Récupérer l'étape mise à jour avec toutes les relations
    const finalStep = await prisma.contractStep.findUnique({
      where: { id: params.stepId },
      include: {
        contract: {
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
        },
        provider: true,
        offer: {
          include: {
            author: true,
          },
        },
      },
    });

    return NextResponse.json(finalStep);
  } catch (error) {
    console.error("Erreur lors de la signature de l'étape:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

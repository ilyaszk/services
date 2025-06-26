import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Signer une étape spécifique en tant que client
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

    // Vérifier que l'étape existe et que l'utilisateur est le client du contrat
    const step = await prisma.contractStep.findUnique({
      where: { id: params.stepId },
      include: {
        contract: true,
      },
    });

    if (!step) {
      return NextResponse.json(
        { error: "Étape de contrat non trouvée" },
        { status: 404 }
      );
    }

    if (step.contract.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "Seul le client du contrat peut signer cette étape" },
        { status: 403 }
      );
    }

    // Vérifier que l'étape n'est pas déjà signée par le client
    if (step.clientSignedAt) {
      return NextResponse.json(
        { error: "Cette étape a déjà été signée par le client" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Signer l'étape par le client
    const updatedStep = await prisma.contractStep.update({
      where: { id: params.stepId },
      data: {
        clientSignedAt: now,
        updatedAt: now,
      },
    });

    // Mettre à jour le statut du contrat si nécessaire
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        steps: true,
      },
    });

    if (contract) {
      let newStatus = contract.status;

      // Si au moins une étape est signée par le client, passer en CLIENT_SIGNED
      const clientSignedSteps = contract.steps.filter(s => s.clientSignedAt || s.id === params.stepId);
      if (clientSignedSteps.length > 0 && contract.status === 'PENDING') {
        newStatus = 'CLIENT_SIGNED';
      }

      // Si toutes les étapes sont signées par les deux parties
      const allStepsSigned = contract.steps.every(s =>
        (s.clientSignedAt || s.id === params.stepId) && s.providerSignedAt
      );
      if (allStepsSigned) {
        newStatus = 'FULLY_SIGNED';
      }

      if (newStatus !== contract.status) {
        await prisma.contract.update({
          where: { id: params.id },
          data: {
            status: newStatus,
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
    console.error("Erreur lors de la signature de l'étape par le client:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

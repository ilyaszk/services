import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Mettre à jour le statut d'une étape de contrat
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const { id, stepId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Statut requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est le prestataire de cette étape
    const step = await prisma.contractStep.findUnique({
      where: {
        id: stepId,
      },
      include: {
        contract: true,
      },
    });

    if (!step) {
      return NextResponse.json({ error: 'Étape de contrat non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est soit le prestataire de l'étape, soit le client du contrat
    const isProvider = step.providerId === session.user.id;
    const isClient = step.contract.clientId === session.user.id;

    if (!isProvider && !isClient) {
      return NextResponse.json({ error: 'Non autorisé à modifier cette étape' }, { status: 403 });
    }

    // Mettre à jour le statut de l'étape
    const updatedStep = await prisma.contractStep.update({
      where: {
        id: stepId,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        offer: {
          include: {
            author: true,
          },
        },
        provider: true,
        contract: {
          include: {
            client: true,
            steps: true,
          },
        },
      },
    });

    // Mettre à jour le statut global du contrat si nécessaire
    const contract = updatedStep.contract;
    const allSteps = contract.steps;

    let newContractStatus = contract.status;

    // Si toutes les étapes sont terminées, marquer le contrat comme terminé
    if (allSteps.every((step: any) => step.status === 'COMPLETED')) {
      newContractStatus = 'COMPLETED';
    }
    // Si au moins une étape est acceptée, marquer le contrat comme en cours
    else if (allSteps.some((c: any) => c.status === 'ACCEPTED' || c.status === 'COMPLETED')) {
      newContractStatus = 'IN_PROGRESS';
    }
    // Si toutes les étapes sont rejetées, marquer le contrat comme rejeté
    else if (allSteps.every((c: any) => c.status === 'REJECTED')) {
      newContractStatus = 'REJECTED';
    }

    // Mettre à jour le statut du contrat si nécessaire
    if (newContractStatus !== contract.status) {
      await prisma.contract.update({
        where: {
          id: contract.id,
        },
        data: {
          status: newContractStatus,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(updatedStep);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'étape:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

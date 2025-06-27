import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Récupérer les contrats en attente pour un prestataire
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    // Récupérer les étapes de contrat en attente où l'utilisateur est le prestataire
    const pendingSteps = await prisma.contractStep.findMany({
      where: {
        providerId: session.user.id,
        status: 'PENDING',
      },
      include: {
        contract: {
          include: {
            client: true,
          },
        },
        offer: {
          include: {
            author: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const contractsMap = new Map();

    pendingSteps.forEach((step: any) => {
      const contractId = step.contract.id;
      if (!contractsMap.has(contractId)) {
        contractsMap.set(contractId, {
          contract: step.contract,
          pendingSteps: [],
        });
      }
      contractsMap.get(contractId).pendingSteps.push(step);
    });

    const notifications = Array.from(contractsMap.values()).map((item) => ({
      contractId: item.contract.id,
      contractTitle: item.contract.title,
      clientName: item.contract.client.name || item.contract.client.email,
      clientEmail: item.contract.client.email,
      pendingStepsCount: item.pendingSteps.length,
      totalValue: item.pendingSteps.reduce((sum: number, step: any) => sum + step.price, 0),
      createdAt: item.contract.createdAt,
      steps: item.pendingSteps,
    }));

    return NextResponse.json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

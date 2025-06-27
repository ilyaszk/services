import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // Récupérer les statistiques des contrats du client
    const totalContracts = await prisma.contract.count({
      where: { clientId: session.user.id },
    });

    const activeContracts = await prisma.contract.count({
      where: {
        clientId: session.user.id,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });

    const completedContracts = await prisma.contract.count({
      where: {
        clientId: session.user.id,
        status: 'COMPLETED',
      },
    });

    // Calculer le total dépensé
    const contracts = await prisma.contract.findMany({
      where: {
        clientId: session.user.id,
        status: { in: ['COMPLETED', 'IN_PROGRESS'] },
      },
      select: { totalPrice: true },
    });

    const totalSpent = contracts.reduce(
      (sum: number, contract: { totalPrice: number }) => sum + contract.totalPrice,
      0
    );

    return NextResponse.json({
      totalContracts,
      activeContracts,
      completedContracts,
      totalSpent,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic to ensure route params are handled correctly
export const dynamic = 'force-dynamic';

// Use NextRequest only to avoid type issues
export async function GET(req: NextRequest) {
  try {
    // Extract id from the URL path
    const id = req.nextUrl.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: 'ID non spécifié' }, { status: 400 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (offer) {
      // Calculer les statistiques des avis
      const reviews = offer.reviews;
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / reviews.length
          : 0;

      // Ajouter les stats aux données de l'offre
      (offer as any).reviewStats = {
        totalReviews: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution: {
          5: reviews.filter((r: any) => r.rating === 5).length,
          4: reviews.filter((r: any) => r.rating === 4).length,
          3: reviews.filter((r: any) => r.rating === 3).length,
          2: reviews.filter((r: any) => r.rating === 2).length,
          1: reviews.filter((r: any) => r.rating === 1).length,
        },
      };
    }

    if (!offer) {
      return NextResponse.json({ message: 'Offre non trouvée' }, { status: 404 });
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

export async function PATCH(req: NextRequest) {
  try {
    const userSession = await auth();
    if (!userSession || !userSession.user) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }
    const { user } = userSession;
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ message: 'ID non spécifié' }, { status: 400 });
    }
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!offer) {
      return NextResponse.json({ message: 'Offre non trouvée' }, { status: 404 });
    }
    // Contrôle d'accès
    if (user.role !== 'Admin' && offer.authorId !== user.id) {
      return NextResponse.json({ message: 'Accès refusé' }, { status: 403 });
    }
    const body = await req.json();
    const { title, description, price, category, image } = body;

    // Prepare update data
    const updateData: any = { title, description, price, category };

    // Only include image if it exists in the request
    if (image !== undefined) {
      updateData.image = image;
    }

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error("Erreur lors de la modification de l'offre:", error);
    return NextResponse.json(
      { message: "Erreur lors de la modification de l'offre" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userSession = await auth();
    if (!userSession || !userSession.user) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }
    const { user } = userSession;
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ message: 'ID non spécifié' }, { status: 400 });
    }
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!offer) {
      return NextResponse.json({ message: 'Offre non trouvée' }, { status: 404 });
    }
    // Contrôle d'accès
    if (user.role !== 'Admin' && offer.authorId !== user.id) {
      return NextResponse.json({ message: 'Accès refusé' }, { status: 403 });
    }
    await prisma.offer.delete({ where: { id } });
    return NextResponse.json({ message: 'Offre supprimée' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'offre:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de l'offre" },
      { status: 500 }
    );
  }
}

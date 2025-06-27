import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Récupérer tous les avis d'une offre
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split('/')[3]; // /api/offers/[id]/reviews

    if (!id) {
      return NextResponse.json({ message: "ID de l'offre manquant" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { offerId: id },
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
    });

    // Calculer la moyenne des notes
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10, // Arrondi à 1 décimale
        ratingDistribution: {
          5: reviews.filter((r: any) => r.rating === 5).length,
          4: reviews.filter((r: any) => r.rating === 4).length,
          3: reviews.filter((r: any) => r.rating === 3).length,
          2: reviews.filter((r: any) => r.rating === 2).length,
          1: reviews.filter((r: any) => r.rating === 1).length,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des avis' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel avis
export async function POST(req: NextRequest) {
  try {
    const userSession = await auth();
    if (!userSession || !userSession.user) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const { user } = userSession;
    const id = req.nextUrl.pathname.split('/')[3]; // /api/offers/[id]/reviews

    if (!id) {
      return NextResponse.json({ message: "ID de l'offre manquant" }, { status: 400 });
    }

    // Vérifier que l'offre existe
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!offer) {
      return NextResponse.json({ message: 'Offre non trouvée' }, { status: 404 });
    }

    // Empêcher l'auteur de l'offre de laisser un avis sur sa propre offre
    if (offer.authorId === user.id) {
      return NextResponse.json(
        {
          message: 'Vous ne pouvez pas laisser un avis sur votre propre offre',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { rating, comment } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          message: 'La note doit être comprise entre 1 et 5',
        },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_offerId: {
          userId: user.id,
          offerId: id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          message: 'Vous avez déjà laissé un avis pour cette offre',
        },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating.toString()),
        comment: comment || null,
        userId: user.id,
        offerId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'avis:", error);
    return NextResponse.json({ message: "Erreur lors de la création de l'avis" }, { status: 500 });
  }
}

// PUT - Modifier un avis existant
export async function PUT(req: NextRequest) {
  try {
    const userSession = await auth();
    if (!userSession || !userSession.user) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const { user } = userSession;
    const id = req.nextUrl.pathname.split('/')[3]; // /api/offers/[id]/reviews

    if (!id) {
      return NextResponse.json({ message: "ID de l'offre manquant" }, { status: 400 });
    }

    const body = await req.json();
    const { rating, comment } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          message: 'La note doit être comprise entre 1 et 5',
        },
        { status: 400 }
      );
    }

    // Vérifier que l'avis existe et appartient à l'utilisateur
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_offerId: {
          userId: user.id,
          offerId: id,
        },
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        {
          message: 'Avis non trouvé',
        },
        { status: 404 }
      );
    }

    const updatedReview = await prisma.review.update({
      where: {
        userId_offerId: {
          userId: user.id,
          offerId: id,
        },
      },
      data: {
        rating: parseInt(rating),
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Erreur lors de la modification de l'avis:", error);
    return NextResponse.json(
      { message: "Erreur lors de la modification de l'avis" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un avis
export async function DELETE(req: NextRequest) {
  try {
    const userSession = await auth();
    if (!userSession || !userSession.user) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const { user } = userSession;
    const id = req.nextUrl.pathname.split('/')[3]; // /api/offers/[id]/reviews

    if (!id) {
      return NextResponse.json({ message: "ID de l'offre manquant" }, { status: 400 });
    }

    // Vérifier que l'avis existe et appartient à l'utilisateur (ou que l'utilisateur est admin)
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_offerId: {
          userId: user.id,
          offerId: id,
        },
      },
    });

    if (!existingReview && user.role !== 'Admin') {
      return NextResponse.json(
        {
          message: 'Avis non trouvé ou accès refusé',
        },
        { status: 404 }
      );
    }

    if (existingReview) {
      await prisma.review.delete({
        where: {
          userId_offerId: {
            userId: user.id,
            offerId: id,
          },
        },
      });
    }

    return NextResponse.json({ message: 'Avis supprimé avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'avis:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de l'avis" },
      { status: 500 }
    );
  }
}

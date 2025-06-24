import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Récupérer les paramètres de recherche et de filtrage (optionnel)
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Construire les filtres pour la requête Prisma
    let filters: any = {};

    if (category) {
      filters.category = category;
    }

    if (minPrice || maxPrice) {
      filters.price = {};

      if (minPrice) {
        filters.price.gte = parseFloat(minPrice);
      }

      if (maxPrice) {
        filters.price.lte = parseFloat(maxPrice);
      }
    }

    // Récupérer les offres avec les filtres
    const offers = await prisma.offer.findMany({
      where: filters,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error("Erreur lors de la récupération des offres:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des offres" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await auth();
    const body = await req.json();
    const { title, description, price, category } = body;

    // Vérification de l'authentification
    if (!user?.user?.email) {
      return NextResponse.json(
        { message: "Authentification requise" },
        { status: 401 }
      );
    }

    // Solution 1: Vérifier si l'utilisateur existe avant de créer l'offre
    const existingUser = await prisma.user.findUnique({
      where: { email: user.user.email }
    });

    if (!existingUser) {
      // Solution 1a: Créer l'utilisateur s'il n'existe pas
      const newUser = await prisma.user.create({
        data: {
          email: user.user.email,
          name: user.user.name || "Utilisateur",
          image: user.user.image || null,
        }
      });

      const newOffer = await prisma.offer.create({
        data: {
          title,
          description,
          price,
          category,
          author: { connect: { id: newUser.id } }
        },
      });

      return NextResponse.json(newOffer, { status: 201 });
    }

    // Si l'utilisateur existe, créer l'offre normalement
    const newOffer = await prisma.offer.create({
      data: {
        title,
        description,
        price,
        category,
        author: { connect: { id: existingUser.id } }
      },
    });

    return NextResponse.json(newOffer, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de la création de l'offre:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création de l'offre" },
      { status: 500 }
    );
  }
}
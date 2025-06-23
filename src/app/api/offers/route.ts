import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
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

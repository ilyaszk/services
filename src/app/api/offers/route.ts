import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import { promises as fs } from 'fs';  // For mkdir and writeFile (async)
import { existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
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
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const imageFile = formData.get("image") as File | null;

    if (!user?.user?.email) {
      return NextResponse.json(
        { message: "Authentification requise" },
        { status: 401 }
      );
    }

    let imageUrl = null;
    if (imageFile) {
      const uploadsDir = path.join(process.cwd(), "public/uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const imageName = `${Date.now()}-${imageFile.name}`;
      const imagePath = path.join(uploadsDir, imageName);
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await writeFile(imagePath, buffer);
      imageUrl = `/uploads/${imageName}`;
    }

    let userRecord = await prisma.user.findUnique({
      where: { email: user.user.email }
    });

    if (!userRecord) {
      userRecord = await prisma.user.create({
        data: {
          email: user.user.email,
          name: user.user.name || "Utilisateur",
          image: user.user.image || null,
        }
      });
    }    // Prepare the data object without the image first
    const offerData: any = {
      title,
      description,
      price,
      category,
      author: { connect: { id: userRecord.id } }
    };
    
    // Add image field only if imageUrl exists
    if (imageUrl) {
      offerData.image = imageUrl;
    }

    const newOffer = await prisma.offer.create({
      data: offerData
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
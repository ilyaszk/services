import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic to ensure route params are handled correctly
export const dynamic = "force-dynamic";

// Use NextRequest only to avoid type issues
export async function GET(req: NextRequest) {
  try {
    // Extract id from the URL path
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ message: "ID non spécifié" }, { status: 400 });
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
      },
    });

    if (!offer) {
      return NextResponse.json(
        { message: "Offre non trouvée" },
        { status: 404 }
      );
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

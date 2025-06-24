import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

export async function PATCH(req: NextRequest) {
  try {
    const userSession = await auth();
    if (!userSession || !userSession.user) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }
    const { user } = userSession;
    const id = req.nextUrl.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ message: "ID non spécifié" }, { status: 400 });
    }
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!offer) {
      return NextResponse.json({ message: "Offre non trouvée" }, { status: 404 });
    }
    // Contrôle d'accès
    if (user.role !== "Admin" && offer.authorId !== user.id) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }
    const body = await req.json();
    const { title, description, price, category } = body;
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: { title, description, price, category },
    });
    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error("Erreur lors de la modification de l'offre:", error);
    return NextResponse.json({ message: "Erreur lors de la modification de l'offre" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userSession = await auth();
    if (!userSession || !userSession.user) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }
    const { user } = userSession;
    const id = req.nextUrl.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ message: "ID non spécifié" }, { status: 400 });
    }
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!offer) {
      return NextResponse.json({ message: "Offre non trouvée" }, { status: 404 });
    }
    // Contrôle d'accès
    if (user.role !== "Admin" && offer.authorId !== user.id) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }
    await prisma.offer.delete({ where: { id } });
    return NextResponse.json({ message: "Offre supprimée" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'offre:", error);
    return NextResponse.json({ message: "Erreur lors de la suppression de l'offre" }, { status: 500 });
  }
}

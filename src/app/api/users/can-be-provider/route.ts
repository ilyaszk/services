import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Vérifier si l'utilisateur a posté des offres
    const userOffers = await prisma.offer.count({
      where: { authorId: session.user.id },
    });

    const canBeProvider = userOffers > 0;

    return NextResponse.json({ canBeProvider });
  } catch (error) {
    console.error("Erreur lors de la vérification du statut prestataire:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Début du seeding...");

    // Créer quelques utilisateurs
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@smp.com" },
      update: {},
      create: {
        email: "admin@smp.com",
        name: "Admin SMP",
        password: adminPassword,
        role: "Admin",
      },
    });

    const user1Password = await bcrypt.hash("user123", 10);
    const user1 = await prisma.user.upsert({
      where: { email: "user1@example.com" },
      update: {},
      create: {
        email: "user1@example.com",
        name: "Utilisateur Test",
        password: user1Password,
        role: "Client",
      },
    });

    console.log("Utilisateurs créés:", { admin, user1 });

    // Créer des offres
    const offers = [
      {
        title: "Développement Web",
        description:
          "Services de création et maintenance de sites web et d'applications",
        price: 1200,
        category: "Développement",
        authorId: admin.id,
      },
      {
        title: "Design Graphique",
        description:
          "Création d'identités visuelles, logos et supports marketing",
        price: 800,
        category: "Design",
        authorId: admin.id,
      },
      {
        title: "Marketing Digital",
        description:
          "Stratégies SEO, campagnes publicitaires et gestion des réseaux sociaux",
        price: 950,
        category: "Marketing",
        authorId: user1.id,
      },
      {
        title: "Consulting IT",
        description:
          "Conseils et recommandations pour l'infrastructure et la sécurité informatique",
        price: 1500,
        category: "Consulting",
        authorId: user1.id,
      },
      {
        title: "Support Technique",
        description:
          "Assistance et maintenance pour vos systèmes informatiques",
        price: 650,
        category: "Support",
        authorId: admin.id,
      },
      {
        title: "Formation",
        description:
          "Sessions de formation pour vos équipes sur différentes technologies",
        price: 850,
        category: "Formation",
        authorId: admin.id,
      },
    ];

    for (const offer of offers) {
      const createdOffer = await prisma.offer.create({
        data: offer,
      });
      console.log("Offre créée:", createdOffer);
    }

    const createdTranslate = await prisma.offer.create({
      data: {
        title: "Translate File",
        description: "Translate a file from French to English.",
        price: 10,
        category: "Translation",
        image: "/file.svg",
      },
    });
    console.log("Offre de traduction créée:", createdTranslate);

    console.log("Seeding terminé avec succès!");
  } catch (error) {
    console.error("Erreur pendant le seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

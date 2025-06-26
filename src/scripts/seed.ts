import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Début du seeding...");

    // Créer plusieurs utilisateurs avec des rôles variés
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@smp.com" },
      update: {},
      create: {
        email: "admin@smp.com",
        name: "Admin SMP",
        password: adminPassword,
        role: "Admin",
        company: "SMP Solutions",
        jobTitle: "Administrateur Système",
        bio: "Administrateur de la plateforme avec plus de 10 ans d'expérience en informatique.",
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
        company: "Test Inc.",
        jobTitle: "Designer UX/UI",
        bio: "Designer passionné par l'expérience utilisateur et l'esthétique des interfaces.",
      },
    });

    const user2Password = await bcrypt.hash("user456", 10);
    const user2 = await prisma.user.upsert({
      where: { email: "sophie.martin@example.com" },
      update: {},
      create: {
        email: "sophie.martin@example.com",
        name: "Sophie Martin",
        password: user2Password,
        role: "Client",
        company: "Martin Tech",
        jobTitle: "CTO",
        bio: "Experte en technologie avec un intérêt particulier pour l'intelligence artificielle et le cloud computing.",
      },
    });

    const user3Password = await bcrypt.hash("tech789", 10);
    const user3 = await prisma.user.upsert({
      where: { email: "jean.dupont@techexperts.com" },
      update: {},
      create: {
        email: "jean.dupont@techexperts.com",
        name: "Jean Dupont",
        password: user3Password,
        role: "Provider",
        company: "Tech Experts",
        jobTitle: "Développeur Senior",
        bio: "Développeur full-stack avec 8 ans d'expérience en JavaScript, React et Node.js.",
      },
    });

    const user4Password = await bcrypt.hash("design123", 10);
    const user4 = await prisma.user.upsert({
      where: { email: "laura.blanc@designstudio.fr" },
      update: {},
      create: {
        email: "laura.blanc@designstudio.fr",
        name: "Laura Blanc",
        password: user4Password,
        role: "Provider",
        company: "Design Studio",
        jobTitle: "Directrice Artistique",
        bio: "Passionnée de design graphique et d'identité visuelle pour les entreprises innovantes.",
      },
    });

    console.log("Utilisateurs créés:", { admin, user1, user2, user3, user4 });

// Créer des offres diversifiées
    const offers = [
      {
        title: "Développement Web Responsive",
        description:
          "Services de création et maintenance de sites web et d'applications adaptés à tous les appareils. Nous utilisons les technologies les plus récentes comme React, Vue.js et Next.js pour créer des expériences utilisateur exceptionnelles.",
        price: 1200,
        category: "Développement",
        authorId: admin.id,
        image: "/globe.svg",
      },
      {
        title: "Design Graphique Premium",
        description:
          "Création d'identités visuelles, logos et supports marketing qui reflètent parfaitement votre marque et captent l'attention de votre audience cible.",
        price: 800,
        category: "Design",
        authorId: admin.id,
        image: "/window.svg",
      },
      {
        title: "Marketing Digital Stratégique",
        description:
          "Stratégies SEO avancées, campagnes publicitaires optimisées et gestion professionnelle des réseaux sociaux pour maximiser votre visibilité en ligne et générer des leads qualifiés.",
        price: 950,
        category: "Marketing",
        authorId: user1.id,
        image: "/globe.svg",
      },
      {
        title: "Consulting IT & Cybersécurité",
        description:
          "Conseils et recommandations pour l'infrastructure et la sécurité informatique. Audit complet de votre système et mise en place de solutions adaptées à vos besoins spécifiques.",
        price: 1500,
        category: "Consulting",
        authorId: user1.id,
        image: "/window.svg",
      },
      {
        title: "Support Technique 24/7",
        description:
          "Assistance et maintenance pour vos systèmes informatiques disponible 24h/24 et 7j/7. Résolution rapide des problèmes et suivi personnalisé.",
        price: 650,
        category: "Support",
        authorId: admin.id,
        image: "/file.svg",
      },
      {
        title: "Formation Tech Avancée",
        description:
          "Sessions de formation pour vos équipes sur différentes technologies incluant l'IA, le cloud computing, la data science et le développement mobile.",
        price: 850,
        category: "Formation",
        authorId: admin.id,
        image: "/window.svg",
      },
      {
        title: "Développement d'Applications Mobiles",
        description:
          "Création d'applications iOS et Android natives ou cross-platform avec React Native ou Flutter. Design intuitif et performances optimisées.",
        price: 1800,
        category: "Développement",
        authorId: user3.id,
        image: "/window.svg",
      },
      {
        title: "Création de Contenu SEO",
        description:
          "Rédaction d'articles, de pages web et de contenu marketing optimisé pour les moteurs de recherche et conçu pour convertir vos visiteurs en clients.",
        price: 550,
        category: "Marketing",
        authorId: user4.id,
        image: "/file.svg",
      },
      {
        title: "Intégration de Systèmes CRM",
        description:
          "Installation, configuration et personnalisation de systèmes CRM comme Salesforce, HubSpot ou Microsoft Dynamics pour optimiser votre relation client.",
        price: 2200,
        category: "Consulting",
        authorId: user2.id,
        image: "/globe.svg",
      },
      {
        title: "Analyse de Données & BI",
        description:
          "Services d'analyse de données et business intelligence pour transformer vos données brutes en insights stratégiques et tableaux de bord interactifs.",
        price: 1750,
        category: "Analyse",
        authorId: user3.id,
        image: "/window.svg",
      },
      {
        title: "Design UX/UI Personnalisé",
        description:
          "Conception d'interfaces utilisateur intuitives et esthétiques basées sur une recherche utilisateur approfondie et les meilleures pratiques de l'expérience utilisateur.",
        price: 1100,
        category: "Design",
        authorId: user4.id,
        image: "/window.svg",
      },
      {
        title: "Migration vers le Cloud",
        description:
          "Services complets de migration de votre infrastructure vers des plateformes cloud comme AWS, Azure ou Google Cloud, avec optimisation des coûts et des performances.",
        price: 3000,
        category: "Infrastructure",
        authorId: user3.id,
        image: "/globe.svg",
      },
    ];

    const createdOffers = [];
    for (const offer of offers) {
      const createdOffer = await prisma.offer.create({
        data: offer,
      });
      createdOffers.push(createdOffer);
      console.log("Offre créée:", createdOffer.title);
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
    console.log("Offre de traduction créée:", createdTranslate.title);

    // Créer des conversations et des messages
    console.log("Création des conversations et messages...");

    // Première conversation
    const conversation1 = await prisma.conversation.create({
      data: {
        title: "Demande de développement web",
        offerId: createdOffers[0].id,
        participants: {
          create: [{ userId: user2.id }, { userId: admin.id }],
        },
        messages: {
          create: [
            {
              content:
                "Bonjour, je suis intéressé par votre service de développement web. Pouvez-vous me donner plus d'informations sur les technologies que vous utilisez?",
              senderId: user2.id,
              receiverId: admin.id,
            },
            {
              content:
                "Bonjour Sophie, merci pour votre intérêt. Nous utilisons principalement React, Next.js et Node.js pour nos projets web. Avez-vous des besoins spécifiques pour votre site?",
              senderId: admin.id,
              receiverId: user2.id,
              isRead: true,
            },
            {
              content:
                "Oui, je cherche à créer une plateforme e-commerce avec un système de paiement sécurisé. Est-ce que c'est dans vos compétences?",
              senderId: user2.id,
              receiverId: admin.id,
            },
          ],
        },
      },
    });
    console.log("Conversation 1 créée:", conversation1.title);

    // Deuxième conversation
    const conversation2 = await prisma.conversation.create({
      data: {
        title: "Question sur le design graphique",
        offerId: createdOffers[1].id,
        participants: {
          create: [{ userId: user1.id }, { userId: admin.id }],
        },
        messages: {
          create: [
            {
              content:
                "J'aurais besoin d'un nouveau logo pour ma startup dans le secteur tech. Pouvez-vous m'aider?",
              senderId: user1.id,
              receiverId: admin.id,
            },
            {
              content:
                "Bonjour! Bien sûr, nous serions ravis de vous aider. Pouvez-vous me donner plus d'informations sur votre startup et vos préférences en matière de design?",
              senderId: admin.id,
              receiverId: user1.id,
              isRead: true,
            },
          ],
        },
      },
    });
    console.log("Conversation 2 créée:", conversation2.title);

    // Troisième conversation
    const conversation3 = await prisma.conversation.create({
      data: {
        title: "Besoin d'analyse de données",
        offerId: createdOffers[9].id,
        participants: {
          create: [{ userId: user4.id }, { userId: user3.id }],
        },
        messages: {
          create: [
            {
              content:
                "Bonjour, notre entreprise a accumulé beaucoup de données client et nous aimerions les exploiter pour améliorer notre stratégie marketing. Pouvez-vous nous aider?",
              senderId: user4.id,
              receiverId: user3.id,
            },
            {
              content:
                "Bonjour Laura, je serais ravi de vous aider avec l'analyse de vos données. Nous pouvons mettre en place des tableaux de bord personnalisés et extraire des insights pertinents pour votre stratégie marketing.",
              senderId: user3.id,
              receiverId: user4.id,
            },
            {
              content:
                "Quel serait le délai pour un tel projet? Nous avons environ 50 000 enregistrements client à analyser.",
              senderId: user4.id,
              receiverId: user3.id,
            },
            {
              content:
                "Pour un volume de données de cette taille, je pense qu'un projet de 2 à 3 semaines serait raisonnable. Je peux vous proposer une réunion pour discuter des détails et vous présenter une proposition complète.",
              senderId: user3.id,
              receiverId: user4.id,
            },
          ],
        },
      },
    });
    console.log("Conversation 3 créée:", conversation3.title);

    // Quatrième conversation
    const conversation4 = await prisma.conversation.create({
      data: {
        title: "Service de traduction",
        offerId: createdTranslate.id,
        participants: {
          create: [{ userId: user1.id }, { userId: user2.id }],
        },
        messages: {
          create: [
            {
              content:
                "J'ai un document technique de 20 pages à traduire de français en anglais. Quel serait votre tarif?",
              senderId: user1.id,
              receiverId: user2.id,
            },
            {
              content:
                "Bonjour, pour un document technique de 20 pages, je propose un tarif de 300€. Ce prix inclut une relecture par un spécialiste du domaine. Quel est le sujet du document?",
              senderId: user2.id,
              receiverId: user1.id,
            },
          ],
        },
      },
    });
    console.log("Conversation 4 créée:", conversation4.title);

    console.log("Seeding terminé avec succès!");
  } catch (error) {
    console.error("Erreur pendant le seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

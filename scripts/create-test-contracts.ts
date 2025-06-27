import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestContracts() {
    try {
        console.log("Création de contrats de test...");

        // Récupérer les utilisateurs existants
        const client = await prisma.user.findFirst({
            where: { role: "Client" }
        });

        const provider = await prisma.user.findFirst({
            where: { role: "Provider" }
        });

        if (!client || !provider) {
            console.log("Clients ou prestataires non trouvés, exécutez d'abord le seed principal");
            return;
        }

        // Créer un contrat de test
        const contract = await prisma.contract.create({
            data: {
                title: "Développement d'une application mobile",
                description: "Création d'une application mobile pour la gestion des stocks",
                totalPrice: 5000,
                estimatedDuration: "6 semaines",
                status: "PENDING",
                clientId: client.id,
                servicePathId: "test-service-path-1"
            }
        });

        // Créer des étapes de contrat en attente
        await prisma.contractStep.createMany({
            data: [
                {
                    contractId: contract.id,
                    name: "Analyse et conception",
                    description: "Analyse des besoins et conception de l'architecture de l'application",
                    price: 1500,
                    duration: "2 semaines",
                    isRealOffer: true,
                    providerId: provider.id,
                    status: "PENDING"
                },
                {
                    contractId: contract.id,
                    name: "Développement de l'interface",
                    description: "Développement de l'interface utilisateur et des écrans principaux",
                    price: 2000,
                    duration: "3 semaines",
                    isRealOffer: true,
                    providerId: provider.id,
                    status: "PENDING"
                },
                {
                    contractId: contract.id,
                    name: "Tests et déploiement",
                    description: "Tests de l'application et mise en production",
                    price: 1500,
                    duration: "1 semaine",
                    isRealOffer: true,
                    providerId: provider.id,
                    status: "PENDING"
                }
            ]
        });

        // Créer un deuxième contrat
        const contract2 = await prisma.contract.create({
            data: {
                title: "Refonte du site web entreprise",
                description: "Modernisation complète du site web avec nouveau design",
                totalPrice: 3000,
                estimatedDuration: "4 semaines",
                status: "PENDING",
                clientId: client.id,
                servicePathId: "test-service-path-2"
            }
        });

        await prisma.contractStep.create({
            data: {
                contractId: contract2.id,
                name: "Refonte complète du site web",
                description: "Nouveau design, optimisation SEO et responsive design",
                price: 3000,
                duration: "4 semaines",
                isRealOffer: true,
                providerId: provider.id,
                status: "PENDING"
            }
        });

        console.log("Contrats de test créés avec succès !");
        console.log(`Contrat 1: ${contract.id}`);
        console.log(`Contrat 2: ${contract2.id}`);

    } catch (error) {
        console.error("Erreur lors de la création des contrats de test:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestContracts();

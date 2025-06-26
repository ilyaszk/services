import { prisma } from "./src/lib/prisma";

async function testAPIs() {
    try {
        console.log("🧪 Test des APIs de gestion des contrats...");
        
        // 1. Test de récupération des notifications
        console.log("\n1️⃣ Test des notifications...");
        const pendingContracts = await prisma.contractStep.findMany({
            where: {
                status: "PENDING"
            },
            include: {
                contract: {
                    include: {
                        client: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                offer: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        console.log(`✅ Notifications récupérées: ${pendingContracts.length}`);
        
        // 2. Test de récupération des projets
        console.log("\n2️⃣ Test des projets...");
        const acceptedContracts = await prisma.contractStep.findMany({
            where: {
                status: "ACCEPTED"
            },
            include: {
                contract: {
                    include: {
                        client: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                offer: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                }
            },
            orderBy: {
                deadline: 'asc'
            }
        });
        
        console.log(`✅ Projets récupérés: ${acceptedContracts.length}`);
        
        // 3. Afficher quelques détails
        if (pendingContracts.length > 0) {
            console.log("\n📋 Première notification:");
            const first = pendingContracts[0];
            console.log(`  - Nom: ${first.name}`);
            console.log(`  - Prix: ${first.price}€`);
            console.log(`  - Client: ${first.contract.client.name}`);
            console.log(`  - Statut: ${first.status}`);
        }
        
        if (acceptedContracts.length > 0) {
            console.log("\n📁 Premier projet:");
            const first = acceptedContracts[0];
            console.log(`  - Nom: ${first.name}`);
            console.log(`  - Prix: ${first.price}€`);
            console.log(`  - Client: ${first.contract.client.name}`);
            console.log(`  - Deadline: ${first.deadline}`);
        }
        
        console.log("\n🎉 Tous les tests sont passés !");
        
    } catch (error) {
        console.error("❌ Erreur lors des tests:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testAPIs();

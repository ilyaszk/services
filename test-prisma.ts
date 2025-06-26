import { prisma } from "@/lib/prisma";

async function testPrisma() {
    try {
        console.log("Test de connexion Prisma...");
        
        // Test de connexion
        const users = await prisma.user.findMany({ take: 1 });
        console.log("✅ Connexion Prisma OK - Users trouvés:", users.length);
        
        // Test du modèle ContractStep
        try {
            const contractSteps = await prisma.contractStep.findMany({ take: 1 });
            console.log("✅ Modèle ContractStep OK - Steps trouvés:", contractSteps.length);
        } catch (error) {
            console.log("❌ Erreur ContractStep:", error);
        }
        
    } catch (error) {
        console.error("❌ Erreur Prisma:", error);
    }
}

testPrisma();

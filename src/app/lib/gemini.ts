import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "AIzaSyBP5MRoxrYvU5PhwlEO8xJQ4hmxRJEVXz0");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function improveAd(userInput: string): Promise<string> {
    const prompt = `Voici une annonce écrite par un utilisateur pour un site de freelancing : "${userInput}".
Réecrit cette annonce pour la rendre plus professionnelle mais je veux que tu l'écrive comme si tu étais booba, claire et attrayante. Ne change pas l’intention originale. Ne fais pas de liste de proposition. Ta réponse doit simplement être le texte améliorer.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

export async function improveFilter(userInput: string, categories: string[]): Promise<string> {
    const prompt = `
                Tu es un assistant pour un site de mise en relation entre freelances et clients.

                Voici le besoin exprimé par un utilisateur : "${userInput}"

                Voici les catégories disponibles : ${categories.join(", ")}

                Ta mission est d’analyser le besoin, d’identifier la ou les catégories qui correspondent le mieux, et de me **retourner uniquement le ou les noms des catégories exacts**, sans explication.

                Format attendu :
                - Si une ou plusieurs catégories correspondent, retourne uniquement leurs noms, séparés par des virgules (exemple : "Design, Développement").
                - Si aucune catégorie ne correspond ou que le besoin est trop vague, retourne exactement : **"Aucune catégorie correspondante"**.

                Exemple :
                - Besoin : "Je cherche un graphiste pour créer un logo"
                - Catégories disponibles : Design, Développement, Formation
                - Réponse attendue : **"Design"**

                Attention :
                - Ne modifie pas l’intention du besoin.
                - Ne reformule pas.
                - Ne donne pas d'explication.
                - Donne uniquement le résultat, rien d'autre.
            `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

export async function analyzeNeed(userInput: string): Promise<string> {
    const prompt = `
                Tu es un consultant expert qui aide à analyser et clarifier les besoins des clients.

                Voici le besoin exprimé par un utilisateur : "${userInput}"

                Ta mission est d'analyser ce besoin et de fournir un résumé en une ou deux phrases

            `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

export async function generateSuggestedServices(userInput: string): Promise<string[]> {
    const prompt = `
                Tu es un expert en analyse de besoins pour une plateforme de services.

                Voici le besoin exprimé par un utilisateur : "${userInput}"

                Ta mission est d'analyser ce besoin et de suggérer 3 à 5 services spécifiques qui pourraient répondre à cette demande.

                Règles importantes :
                - Retourne uniquement une liste de services, un par ligne
                - Chaque service doit être précis et actionnable
                - Les services doivent être complémentaires et logiques
                - Utilise un vocabulaire professionnel
                - Ne donne pas d'explication, juste la liste

                Exemple de format attendu :
                Développement Web Personnalisé
                Optimisation SEO
                Migration Cloud
                Formation Utilisateurs
                Maintenance et Support

                Analyse maintenant le besoin et propose tes services suggérés :
            `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const services = response.text()
        .split('\n')
        .map(service => service.trim())
        .filter(service => service.length > 0)
        .slice(0, 5);

    return services;
}

export async function selectRelevantOffers(userInput: string, availableOffers: any[]): Promise<any[]> {
    if (!availableOffers || availableOffers.length === 0) {
        return [];
    }

    const offersData = availableOffers.map((offer, index) => ({
        index,
        title: offer.title,
        description: offer.description,
        category: offer.category,
        price: offer.price,
        author: offer.author?.name || 'Anonyme'
    }));

    const prompt = `
                Tu es un expert en sélection d'offres pour une plateforme de services.

                Voici le besoin exprimé par un utilisateur : "${userInput}"

                Voici les offres disponibles :
                ${offersData.map(offer =>
                    `[${offer.index}] ${offer.title} - ${offer.description} (Catégorie: ${offer.category}, Prix: ${offer.price}€, Prestataire: ${offer.author})`
                ).join('\n')}

                Ta mission est de sélectionner TOUTES les offres qui correspondent aux différents aspects du besoin exprimé.

                Règles IMPORTANTES :
                - Analyse TOUS les éléments du besoin (ex: "site internet ET logo" = 2 besoins distincts)
                - Sélectionne une offre pour CHAQUE aspect du besoin identifié
                - Si l'utilisateur demande plusieurs services, trouve un prestataire pour chacun
                - Priorité aux offres de qualité avec des descriptions détaillées
                - Maximum 8 offres sélectionnées pour couvrir tous les besoins
                - Assure-toi que le chemin final soit COMPLET

                Exemples d'analyse :
                - "Je veux un site internet et un logo" → Sélectionne une offre de développement web ET une offre de design graphique/logo
                - "J'ai besoin d'un site e-commerce avec formation" → Sélectionne une offre e-commerce ET une offre de formation
                - "Création d'application mobile et marketing" → Sélectionne une offre mobile ET une offre marketing

                Format de réponse :
                Retourne UNIQUEMENT les numéros des offres sélectionnées, un par ligne, sans explication.
                Exemple :
                0
                3
                7
                12

                Si aucune offre ne correspond, retourne exactement : "AUCUNE"

                Analyse maintenant et sélectionne les offres pour créer un chemin COMPLET :
            `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text().trim();

        if (responseText === "AUCUNE") {
            return [];
        }

        const selectedIndices = responseText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => parseInt(line))
            .filter(index => !isNaN(index) && index >= 0 && index < availableOffers.length);

        return selectedIndices.map(index => availableOffers[index]);
    } catch (error) {
        console.error('Erreur lors de la sélection des offres par l\'IA:', error);
        return [];
    }
}

export async function generatePathTitle(userNeed: string, selectedOffers: any[]): Promise<string> {
    if (!selectedOffers || selectedOffers.length === 0) {
        return 'Solution Personnalisée';
    }

    const offersInfo = selectedOffers.map(offer => ({
        title: offer.title,
        category: offer.category,
        description: offer.description
    }));

    const prompt = `
                Tu es un expert en naming et communication pour une plateforme de services.

                Voici le besoin exprimé par un utilisateur : "${userNeed}"

                Voici les services sélectionnés pour répondre à ce besoin :
                ${offersInfo.map(offer =>
                    `- ${offer.title} (${offer.category}) : ${offer.description}`
                ).join('\n')}

                Ta mission est de créer un titre accrocheur et professionnel qui résume parfaitement ce chemin de services.

                Règles IMPORTANTES :
                - Le titre doit être court (maximum 60 caractères)
                - Il doit capturer l'essence du besoin et de la solution
                - Utilise un vocabulaire professionnel et moderne
                - Évite les termes trop techniques
                - Rends-le attractif pour un client potentiel
                - Si plusieurs services différents, utilise des termes comme "Solution Complète", "Pack", "Ensemble"

                Exemples de bons titres :
                - "Solution Complète : Site Web + Logo"
                - "Pack E-commerce Complet"
                - "Transformation Digitale Clé en Main"
                - "Solution Web + Marketing Digital"
                - "Pack Développement + Formation"

                Retourne UNIQUEMENT le titre, sans explication ni guillemets.
            `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Erreur lors de la génération du titre par l\'IA:', error);

        const categories = [...new Set(selectedOffers.map(offer => offer.category))];
        if (categories.length > 1) {
            return `Solution Complète : ${categories.join(' + ')}`;
        }
        return `Solution Personnalisée : ${categories[0] || 'Multi-services'}`;
    }
}
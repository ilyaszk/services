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
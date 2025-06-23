import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "AIzaSyBP5MRoxrYvU5PhwlEO8xJQ4hmxRJEVXz0");

export async function improveAd(userInput: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Voici une annonce écrite par un utilisateur pour un site de freelancing : "${userInput}". 
Améliore cette annonce pour la rendre plus professionnelle, claire et attrayante. Ne change pas l’intention originale. Ne fais pas de liste de proposition. Ta réponse doit simplement être le texte améliorer`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

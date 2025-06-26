import { NextRequest, NextResponse } from 'next/server';
import { 
  analyzeUserNeedDetailed, 
  generatePersonalizedRecommendations,
  generateProjectRoadmap,
  generateSmartQuestions
} from '@/app/lib/gemini';
import { prisma } from '@/lib/prisma';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface ServiceRecommendation {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  matchScore: number;
  reasons: string[];
}

interface ConversationAnalysis {
  userNeed: string;
  complexity: 'simple' | 'medium' | 'complex';
  budget: string;
  timeline: string;
  priorities: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, userId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Récupérer les offres disponibles pour les recommandations
    const availableOffers = await prisma.offer.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // Construire l'historique de conversation pour le contexte
    const conversationContext = conversationHistory
      .map((msg: Message) => `${msg.isBot ? 'Assistant' : 'Utilisateur'}: ${msg.content}`);

    // Utiliser l'analyse détaillée des besoins
    const aiResponse = await analyzeUserNeedDetailed(message, conversationContext);

    // Générer des questions intelligentes pour continuer la conversation
    const smartQuestions = await generateSmartQuestions(message, conversationContext.join('\n'));

    // Générer des recommandations personnalisées
    const personalizedRecommendations = await generatePersonalizedRecommendations(
      message, 
      availableOffers
    );

    // Analyser le besoin pour générer des suggestions
    const analysisPrompt = `
Analyse ce besoin utilisateur et extrait les informations structurées suivantes:

MESSAGE: ${message}
CONTEXTE: ${conversationContext.join('\n')}

Retourne un JSON avec cette structure exacte:
{
  "userNeed": "résumé du besoin principal en une phrase",
  "complexity": "simple|medium|complex",
  "budget": "estimation budgétaire ou 'non spécifié'",
  "timeline": "délai estimé ou 'non spécifié'",
  "priorities": ["priorité1", "priorité2", "priorité3"],
  "keywords": ["mot-clé1", "mot-clé2", "mot-clé3"]
}

Ne retourne que le JSON, rien d'autre.
`;

    // Utiliser les questions intelligentes comme suggestions
    let analysis = null;
    let suggestions: string[] = smartQuestions.slice(0, 3);
    let keywords: string[] = [];

    try {
      // Pour l'analyse, on peut utiliser une approche simplifiée
      // En extrayant des mots-clés du message utilisateur
      const words = message.toLowerCase().split(' ');
      keywords = words.filter(word => 
        word.length > 3 && 
        !['dans', 'avec', 'pour', 'comme', 'être', 'avoir', 'faire', 'aller'].includes(word)
      ).slice(0, 5);

      analysis = {
        userNeed: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        complexity: message.length > 100 ? 'complex' : message.length > 50 ? 'medium' : 'simple',
        budget: 'non spécifié',
        timeline: 'non spécifié',
        priorities: keywords.slice(0, 3)
      };
    } catch (error) {
      console.error('Erreur lors du parsing de l\'analyse:', error);
    }

    // Générer des recommandations de services basées sur l'analyse
    const serviceRecommendations: ServiceRecommendation[] = [];
    
    if (keywords.length > 0) {
      // Algorithme de recommandation simple basé sur les mots-clés
      for (const offer of availableOffers) {
        let matchScore = 0;
        const reasons: string[] = [];

        // Vérifier la correspondance avec les mots-clés
        keywords.forEach(keyword => {
          const keywordLower = keyword.toLowerCase();
          if (offer.title.toLowerCase().includes(keywordLower) || 
              offer.description.toLowerCase().includes(keywordLower) ||
              offer.category.toLowerCase().includes(keywordLower)) {
            matchScore += 25;
            reasons.push(`Correspond à "${keyword}"`);
          }
        });

        // Bonus pour la catégorie si elle correspond
        if (analysis?.priorities.some((priority: string) => 
          offer.category.toLowerCase().includes(priority.toLowerCase()) ||
          priority.toLowerCase().includes(offer.category.toLowerCase())
        )) {
          matchScore += 20;
          reasons.push('Catégorie prioritaire');
        }

        // Bonus pour le budget si spécifié
        if (analysis?.budget && analysis.budget !== 'non spécifié') {
          const budgetMatch = analysis.budget.match(/(\d+)/);
          if (budgetMatch) {
            const estimatedBudget = parseInt(budgetMatch[1]);
            if (offer.price <= estimatedBudget * 1.2) { // 20% de marge
              matchScore += 15;
              reasons.push('Dans votre budget');
            }
          }
        }

        // Ajouter les services avec un score suffisant
        if (matchScore >= 25) {
          serviceRecommendations.push({
            id: offer.id,
            title: offer.title,
            description: offer.description.substring(0, 100) + '...',
            price: offer.price,
            category: offer.category,
            matchScore,
            reasons
          });
        }
      }

      // Trier par score de correspondance
      serviceRecommendations.sort((a, b) => b.matchScore - a.matchScore);
      // Limiter à 3 recommandations
      serviceRecommendations.splice(3);
    }

    // Générer des suggestions contextuelles si aucune n'a été générée
    if (suggestions.length === 0) {
      const defaultSuggestions = [
        "Pouvez-vous me donner plus de détails sur votre budget ?",
        "Quel est votre délai pour ce projet ?",
        "Avez-vous des préférences particulières ?",
        "Y a-t-il des contraintes spécifiques à considérer ?"
      ];
      suggestions = defaultSuggestions.slice(0, 2);
    }

    return NextResponse.json({
      response: aiResponse,
      analysis,
      suggestions,
      serviceRecommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur dans l\'agent IA:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        response: "Désolé, je rencontre actuellement des difficultés techniques. Pouvez-vous reformuler votre demande ?"
      },
      { status: 500 }
    );
  }
}

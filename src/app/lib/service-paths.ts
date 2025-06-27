import { generatePathTitle as generatePathTitleWithGemini } from './gemini';

// Types pour les offres (de la base de données)
export interface Offer {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    author?: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
}

// Types pour les chemins de services
export interface ServiceStep {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    offerId?: string;
    isRealOffer: boolean;
    author?: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
}

export interface ServicePath {
    id: string;
    name: string;
    description: string;
    steps: ServiceStep[];
    totalPrice: number;
    estimatedDuration: string;
    category: string;
    realOffersCount: number;
}

// Fonction pour estimer la durée basée sur le prix
function estimateDurationFromPrice(price: number): string {
    if (price < 500) return "1-3 jours";
    if (price < 1000) return "1-2 semaines";
    if (price < 2000) return "2-4 semaines";
    return "1-2 mois";
}

// Fonction pour convertir une offre en ServiceStep
function offerToServiceStep(offer: Offer): ServiceStep {
    return {
        id: `offer-${offer.id}`,
        name: offer.title,
        description: offer.description,
        price: offer.price,
        duration: estimateDurationFromPrice(offer.price),
        offerId: offer.id,
        isRealOffer: true,
        author: offer.author
    };
}

// Fonction pour créer des étapes complémentaires si nécessaire
function createComplementaryStep(index: number, category: string): ServiceStep {
    const complementarySteps = [
        {
            name: "Consultation et Planification",
            description: "Analyse des besoins et planification détaillée du projet",
            price: Math.floor(Math.random() * 300) + 150
        },
        {
            name: "Suivi et Support",
            description: "Accompagnement et support technique après livraison",
            price: Math.floor(Math.random() * 400) + 200
        },
        {
            name: "Formation et Transfert de Compétences",
            description: "Formation pour l'utilisation optimale de la solution",
            price: Math.floor(Math.random() * 500) + 250
        }
    ];

    const step = complementarySteps[index] || complementarySteps[0];

    return {
        id: `complement-${Date.now()}-${index}`,
        name: step.name,
        description: step.description,
        price: step.price,
        duration: estimateDurationFromPrice(step.price),
        isRealOffer: false
    };
}

// Services de secours si aucune suggestion n'est disponible
const fallbackServices = [
    "Développement Web",
    "Design Graphique",
    "Marketing Digital",
    "Formation Professionnelle"
];

// Fonction pour grouper les offres par mots-clés
function findOffersForService(offers: Offer[], serviceKeywords: string): Offer[] {
    const keywords = serviceKeywords.toLowerCase();

    return offers.filter(offer => {
        const offerText = `${offer.title} ${offer.description} ${offer.category}`.toLowerCase();

        if (keywords.includes('développement') || keywords.includes('web') || keywords.includes('application') || keywords.includes('site')) {
            return offerText.includes('développement') || offerText.includes('web') ||
                   offerText.includes('application') || offerText.includes('site') ||
                   offer.category.toLowerCase().includes('développement');
        }

        if (keywords.includes('design') || keywords.includes('graphique') || keywords.includes('logo') || keywords.includes('création')) {
            return offerText.includes('design') || offerText.includes('graphique') ||
                   offerText.includes('logo') || offerText.includes('création') ||
                   offer.category.toLowerCase().includes('design');
        }

        if (keywords.includes('seo') || keywords.includes('référencement') || keywords.includes('optimisation')) {
            return offerText.includes('seo') || offerText.includes('référencement') ||
                   offerText.includes('optimisation') ||
                   offer.category.toLowerCase().includes('marketing');
        }

        if (keywords.includes('formation') || keywords.includes('accompagnement') || keywords.includes('coaching')) {
            return offerText.includes('formation') || offerText.includes('accompagnement') ||
                   offerText.includes('coaching') ||
                   offer.category.toLowerCase().includes('formation');
        }

        return offerText.includes(keywords) ||
               offer.category.toLowerCase().includes(keywords.split(' ')[0]);
    });
}

export async function generatePaths(suggestedServices: string[], availableOffers: Offer[] = [], userNeed: string = ""): Promise<ServicePath[]> {
    if (availableOffers.length === 0) {
        console.warn('Aucune offre disponible pour générer des chemins');
        return [];
    }

    let selectedOffers: Offer[] = [];
    if (userNeed.trim()) {
        const { selectRelevantOffers } = await import('./gemini');
        selectedOffers = await selectRelevantOffers(userNeed, availableOffers);
    } else {
        // Fallback: utiliser l'ancien système de recherche par mots-clés
        const servicesToUse = suggestedServices.length > 0 ? suggestedServices : fallbackServices;
        const limitedServices = servicesToUse.slice(0, 3);

        selectedOffers = limitedServices.flatMap(service =>
            findOffersForService(availableOffers, service).slice(0, 2)
        );
    }

    if (selectedOffers.length === 0) {
        console.warn('Aucune offre pertinente trouvée par l\'IA pour ce besoin');
        return [];
    }

    const paths: ServicePath[] = [];

    // Créer un chemin principal complet avec toutes les offres sélectionnées
    if (selectedOffers.length > 0) {
        const allSteps: ServiceStep[] = selectedOffers.map(offer => offerToServiceStep(offer));
        const totalPrice = allSteps.reduce((sum, step) => sum + step.price, 0);
        const realOffersCount = allSteps.length;

        // Organiser les étapes de manière logique (par exemple, design avant développement)
        const organizedSteps = organizeStepsByLogicalOrder(allSteps);

        const durationWeeks = Math.max(2, Math.ceil(organizedSteps.length * 1.5));
        const estimatedDuration = `${durationWeeks}-${durationWeeks + 2} semaines`;

        // Analyser le besoin pour créer un titre personnalisé
        const pathTitle = await generatePathTitle(userNeed, selectedOffers);

        let description = `Solution complète intégrant ${realOffersCount} prestataire sélectionné par l'IA pour répondre entièrement à votre besoin`;
        if (realOffersCount > 1) {
            description = `Solution complète intégrant ${realOffersCount} prestataires sélectionnés par l'IA pour répondre entièrement à votre besoin`;
        }

        paths.push({
            id: `path-${Date.now()}-complete`,
            name: pathTitle,
            description,
            steps: organizedSteps,
            totalPrice,
            estimatedDuration,
            category: 'Solution Complète',
            realOffersCount
        });
    }

    // Optionnel : créer des chemins alternatifs par catégorie si on a plusieurs types de services
    const offersByCategory = new Map<string, Offer[]>();
    selectedOffers.forEach(offer => {
        const category = offer.category || 'Autres';
        if (!offersByCategory.has(category)) {
            offersByCategory.set(category, []);
        }
        offersByCategory.get(category)!.push(offer);
    });

    // Si on a plusieurs catégories, proposer aussi des chemins par spécialité
    if (offersByCategory.size > 1) {
        let pathIndex = 1;
        for (const [category, offers] of offersByCategory) {
            if (offers.length > 0) {
                const steps: ServiceStep[] = offers.map(offer => offerToServiceStep(offer));
                const totalPrice = steps.reduce((sum, step) => sum + step.price, 0);
                const realOffersCount = steps.length;

                const durationWeeks = Math.max(1, Math.ceil(steps.length * 1.2));
                const estimatedDuration = `${durationWeeks}-${durationWeeks + 1} semaine${durationWeeks > 1 ? 's' : ''}`;

                paths.push({
                    id: `path-${Date.now()}-${pathIndex}`,
                    name: `Option ${category} uniquement`,
                    description: `Chemin spécialisé en ${category.toLowerCase()} avec ${realOffersCount} prestataire(s)`,
                    steps,
                    totalPrice,
                    estimatedDuration,
                    category: category,
                    realOffersCount
                });

                pathIndex++;
            }
        }
    }

    return paths;
}

function organizeStepsByLogicalOrder(steps: ServiceStep[]): ServiceStep[] {
    const priorityOrder = [
        'design', 'logo', 'graphique', 'création', 'maquette',
        'développement', 'web', 'site', 'application', 'programmation',
        'seo', 'référencement', 'marketing', 'promotion',
        'formation', 'accompagnement', 'support', 'maintenance'
    ];

    return steps.sort((a, b) => {
        const aText = `${a.name} ${a.description}`.toLowerCase();
        const bText = `${b.name} ${b.description}`.toLowerCase();

        // Trouver la priorité de chaque étape
        const aPriority = priorityOrder.findIndex(keyword => aText.includes(keyword));
        const bPriority = priorityOrder.findIndex(keyword => bText.includes(keyword));

        // Si aucune priorité trouvée, garder l'ordre original
        if (aPriority === -1 && bPriority === -1) return 0;
        if (aPriority === -1) return 1;
        if (bPriority === -1) return -1;

        return aPriority - bPriority;
    });
}

async function generatePathTitle(userNeed: string, selectedOffers: Offer[]): Promise<string> {
    try {
        return await generatePathTitleWithGemini(userNeed, selectedOffers);
    } catch (error) {
        console.error('Erreur lors de la génération du titre avec l\'IA:', error);

        // Fallback vers la logique précédente en cas d'erreur
        const needLower = userNeed.toLowerCase();
        const categories = [...new Set(selectedOffers.map(offer => offer.category))];

        // Détection de patterns courants
        if (needLower.includes('site') && needLower.includes('logo')) {
            return 'Solution Complète : Site Web + Identité Visuelle';
        }
        if (needLower.includes('e-commerce') || needLower.includes('boutique')) {
            return 'Solution E-commerce Complète';
        }
        if (needLower.includes('application') || needLower.includes('app')) {
            return 'Développement d\'Application Complète';
        }
        if (needLower.includes('marketing') && needLower.includes('site')) {
            return 'Solution Web + Marketing Digital';
        }

        // Fallback basé sur les catégories
        if (categories.length > 1) {
            return `Solution Complète : ${categories.join(' + ')}`;
        }

        return `Solution Personnalisée : ${categories[0] || 'Multi-services'}`;
    }
}

export function calculatePathPrice(steps: ServiceStep[]): number {
    return steps.reduce((total, step) => total + step.price, 0);
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

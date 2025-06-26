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

// Fonction principale pour générer les chemins de services basés sur les vraies offres
export function generatePaths(suggestedServices: string[], availableOffers: Offer[] = []): ServicePath[] {
    if (availableOffers.length === 0) {
        // console.warn('Aucune offre disponible pour générer des chemins');
        return [];
    }

    const servicesToUse = suggestedServices.length > 0 ? suggestedServices : fallbackServices;

    // Limiter à 3 services pour éviter la surcharge
    const limitedServices = servicesToUse.slice(0, 3);

    const paths: ServicePath[] = limitedServices.map((service, index) => {
        const relevantOffers = findOffersForService(availableOffers, service);

        const steps: ServiceStep[] = [];

        // Utiliser jusqu'à 3 offres réelles
        const selectedOffers = relevantOffers.slice(0, 3);
        selectedOffers.forEach(offer => {
            steps.push(offerToServiceStep(offer));
        });

        // Si moins de 3 étapes, ajouter des étapes complémentaires
        while (steps.length < 3) {
            steps.push(createComplementaryStep(steps.length, service));
        }

        const totalPrice = steps.reduce((sum, step) => sum + step.price, 0);
        const realOffersCount = steps.filter(step => step.isRealOffer).length;

        // Calcul de la durée estimée basée sur le nombre d'étapes et la complexité
        const durationWeeks = Math.max(2, Math.ceil(steps.length * 1.5));
        const estimatedDuration = `${durationWeeks}-${durationWeeks + 2} semaines`;

        return {
            id: `path-${Date.now()}-${index}`,
            name: `Chemin d'Accompagnement : ${service}`,
            description: realOffersCount > 0
                ? `Solution complète basée sur ${realOffersCount} offre(s) réelle(s) de la plateforme pour ${service.toLowerCase()}`
                : `Solution complète pour ${service.toLowerCase()} avec un accompagnement personnalisé`,
            steps,
            totalPrice,
            estimatedDuration,
            category: service.split(' ')[0],
            realOffersCount
        };
    });

    return paths;
}

// Fonction pour calculer le prix total d'un chemin
export function calculatePathPrice(steps: ServiceStep[]): number {
    return steps.reduce((total, step) => total + step.price, 0);
}

// Fonction pour formater le prix
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

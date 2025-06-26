import { useState, useEffect } from "react";
import { improveFilter, analyzeNeed, generateSuggestedServices } from "@/app/lib/gemini";
import { generatePaths, ServicePath, formatPrice, Offer } from "@/app/lib/service-paths";

interface AIModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    offers: Offer[];
    onApplySuggestion: (updatedCategories: string[]) => void;
}

export default function AIModal({ isOpen, onClose, categories, offers, onApplySuggestion }: AIModalProps) {
    const [mounted, setMounted] = useState(false);
    const [aiQuery, setAiQuery] = useState<string>("");
    const [isAILoading, setIsAILoading] = useState<boolean>(false);
    const [needAnalysis, setNeedAnalysis] = useState<string>("");
    const [suggestedServices, setSuggestedServices] = useState<string[]>([]);
    const [servicePaths, setServicePaths] = useState<ServicePath[]>([]);
    const [showPaths, setShowPaths] = useState<boolean>(false);
    const [isCreatingContract, setIsCreatingContract] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClose = () => {
        setAiQuery("");
        setNeedAnalysis("");
        setSuggestedServices([]);
        setServicePaths([]);
        setShowPaths(false);
        onClose();
    };

    const handleAISubmit = async () => {
        if (!aiQuery.trim()) return;

        setIsAILoading(true);
        try {
            // Analyse du besoin, amélioration du filtre et génération des services suggérés en parallèle
            const [
                analysisResult,
                servicesResult
            ] = await Promise.all([
                analyzeNeed(aiQuery),
                generateSuggestedServices(aiQuery)
            ]);

            setNeedAnalysis(analysisResult);
            setSuggestedServices(servicesResult);
        } catch (error) {
            console.error("Erreur lors de l'appel à l'IA:", error);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleGeneratePaths = () => {
        const paths = generatePaths(suggestedServices, offers);
        setServicePaths(paths);
        setShowPaths(true);
    };

    const handleCreateContract = async (servicePathData: ServicePath) => {
        setIsCreatingContract(true);
        try {
            const response = await fetch('/api/contracts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    servicePathData
                }),
            });

            console.log(response);

            if (!response.ok) {
                throw new Error('Erreur lors de la création du contrat');
            }

            const contract = await response.json();

            // TODO: Gérer les notifications
            // Afficher un message de succès et rediriger vers les contrats
            // alert(`Contrat créé avec succès ! ID: ${contract.id}`);
            handleClose();

            window.location.href = `/contrats/${contract.id}`;

        } catch (error) {
            console.error('Erreur lors de la création du contrat:', error);
            alert('Erreur lors de la création du contrat. Veuillez réessayer.');
        } finally {
            setIsCreatingContract(false);
        }
    };

    const handleApplySuggestion = (suggestion: string) => {
        const suggestions = suggestion.split(',').map(item => item.trim());

        let updatedCategories: string[] = [...categories]; // Start with existing categories

        suggestions.forEach(suggestion => {
            // Add the suggestion if it's not already in the categories
            if (!updatedCategories.includes(suggestion)) {
                updatedCategories.push(suggestion);
            }
        });

        console.log("Catégories disponibles:", categories);
        console.log("Catégories mises à jour:", updatedCategories);

        onApplySuggestion(updatedCategories);

        handleClose();
    };

    if (!mounted) {
        return null;
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto border border-gray-200 dark:border-gray-800 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Demander à l'IA
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Décrivez votre besoin
                    </label>
                    <textarea
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Exemple: Je voudrais créer un site e-commerce avec paiement en ligne..."
                        className="w-full h-32 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent dark:bg-gray-800 dark:text-white"
                        disabled={isAILoading}
                    />
                </div>

                <div className="flex justify-end space-x-3 mb-4">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        disabled={isAILoading}
                    >
                        { "Annuler" }
                    </button>
                    <button
                        onClick={handleAISubmit}
                        disabled={!aiQuery.trim() || isAILoading}
                        className="px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] hover:opacity-90 transition-opacity text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isAILoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Analyse en cours...
                            </>
                        ) : (
                            "Analyser le besoin"
                        )}
                    </button>
                </div>

                {/* Affichage du résumé du besoin */}
                {needAnalysis && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📋 Analyse de votre besoin
                        </label>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                                {needAnalysis}
                            </div>
                        </div>
                    </div>
                )}

                {/* Affichage des services suggérés */}
                {suggestedServices.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            🎯 Services suggérés par l'IA
                        </label>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <ul className="space-y-2">
                                {suggestedServices.map((service, index) => (
                                    <li key={index} className="flex items-center text-gray-800 dark:text-gray-200">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                                        <span className="text-sm">{service}</span>
                                    </li>
                                ))}
                            </ul>

                            {!showPaths && (
                                <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-700">
                                    <button
                                        onClick={handleGeneratePaths}
                                        className="w-full px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] hover:opacity-90 transition-opacity text-white rounded-lg flex items-center justify-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        Générer des Chemins de Services
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Affichage des chemins de services générés */}
                {showPaths && servicePaths.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            🛤️ Chemins de Services Générés
                        </label>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {servicePaths.map((path, pathIndex) => (
                                <div key={path.id} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                {path.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {path.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                    </svg>
                                                    {formatPrice(path.totalPrice)}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {path.estimatedDuration}
                                                </span>
                                                {path.realOffersCount > 0 && (
                                                    <span className="flex items-center text-green-600 dark:text-green-400">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {path.realOffersCount} offre(s) réelle(s)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Étapes du chemin :
                                        </h4>
                                        {path.steps.map((step, stepIndex) => (
                                            <div key={step.id} className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-1">
                                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-xs font-semibold mr-2">
                                                                {stepIndex + 1}
                                                            </span>                                            <h5 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                                {step.name}
                                                {step.isRealOffer && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Offre réelle
                                                    </span>
                                                )}
                                            </h5>
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 ml-8">
                                                            {step.description}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-2 ml-8 text-xs text-gray-500 dark:text-gray-400">
                                                            <span>{formatPrice(step.price)}</span>
                                                            <span>•</span>
                                                            <span>{step.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-700">
                                        <button
                                        onClick={() => handleCreateContract(path)}
                                        className="w-full px-3 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] hover:opacity-90 transition-opacity text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        disabled={isCreatingContract}
                                        >
                                            {isCreatingContract ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                    Création du contrat...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Créer un contrat
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

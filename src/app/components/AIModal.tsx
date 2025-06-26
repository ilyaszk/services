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
    const [isGeneratingPaths, setIsGeneratingPaths] = useState<boolean>(false);
    const [isCreatingContract, setIsCreatingContract] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (aiQuery.trim().length === 0 && (needAnalysis || suggestedServices.length > 0)) {
            setNeedAnalysis("");
            setSuggestedServices([]);
            setServicePaths([]);
            setShowPaths(false);
            setIsGeneratingPaths(false);
        }
    }, [aiQuery, needAnalysis, suggestedServices.length]);

    const handleClose = () => {
        setAiQuery("");
        setNeedAnalysis("");
        setSuggestedServices([]);
        setServicePaths([]);
        setShowPaths(false);
        setIsGeneratingPaths(false);
        onClose();
    };

    const handleAISubmit = async () => {
        if (!aiQuery.trim()) return;

        setNeedAnalysis("");
        setSuggestedServices([]);
        setServicePaths([]);
        setShowPaths(false);
        setIsGeneratingPaths(false);

        setIsAILoading(true);
        try {
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

    const handleGeneratePaths = async () => {
        setIsGeneratingPaths(true);
        try {
            const paths = await generatePaths(suggestedServices, offers, aiQuery);
            setServicePaths(paths);
            setShowPaths(true);
        } catch (error) {
            console.error("Erreur lors de la génération des chemins:", error);
            alert("Erreur lors de la génération des chemins de services. Veuillez réessayer.");
        } finally {
            setIsGeneratingPaths(false);
        }
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
                    {(needAnalysis || suggestedServices.length > 0) && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-xs text-blue-600 dark:text-blue-300 flex items-center">
                                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Une nouvelle analyse effacera l'analyse actuelle et tous les chemins de services générés.
                            </p>
                        </div>
                    )}
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
                            <>
                                {(needAnalysis || suggestedServices.length > 0) && (
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                                {(needAnalysis || suggestedServices.length > 0) ? "Nouvelle analyse" : "Analyser le besoin"}
                            </>
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
                                        disabled={isGeneratingPaths}
                                        className="w-full px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] hover:opacity-90 transition-opacity text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGeneratingPaths ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                Sélection des offres par l'IA...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                                                </svg>
                                                Générer des Chemins de Services
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Affichage des chemins de services générés */}
                {showPaths && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            🛤️ Chemins de services générés
                        </label>
                        {servicePaths.length > 0 ? (
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
                                                            </span>                                            <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                                {step.name}
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
                        ) : (
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                                <div className="flex items-center text-orange-700 dark:text-orange-300">
                                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-medium mb-1">Aucune offre pertinente trouvée</h4>
                                        <p className="text-sm">L'IA n'a trouvé aucune offre correspondant exactement à votre besoin dans notre catalogue actuel. Vous pouvez :</p>
                                        <ul className="text-sm mt-2 space-y-1">
                                            <li>• Reformuler votre demande de manière plus générale</li>
                                            <li>• Consulter directement le catalogue d'offres</li>
                                            <li>• Contacter directement les prestataires</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

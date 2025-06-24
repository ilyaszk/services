import { useState, useEffect } from "react";
import { improveFilter } from "../lib/gemini";

interface AIModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    onApplySuggestion: (updatedCategories: string[]) => void;
}

interface HistoryItem {
    query: string;
    response: string;
}

export default function AIModal({ isOpen, onClose, categories, onApplySuggestion }: AIModalProps) {
    const [mounted, setMounted] = useState(false);
    const [aiQuery, setAiQuery] = useState<string>("");
    const [isAILoading, setIsAILoading] = useState<boolean>(false);
    const [improvedQuery, setImprovedQuery] = useState<string>("");
    const [aiHistory, setAiHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClose = () => {
        setAiQuery("");
        setImprovedQuery("");
        setAiHistory([]);
        onClose();
    };

    const handleAISubmit = async () => {
        if (!aiQuery.trim()) return;

        setIsAILoading(true);
        try {
            const improvedQueryResult = await improveFilter(aiQuery, categories);

            if (improvedQueryResult) {
                setAiHistory(prev => [{ query: aiQuery, response: improvedQueryResult }, ...prev]);
            }

            console.log("History: ", aiHistory);

            setImprovedQuery(improvedQueryResult);
        } catch (error) {
            console.error("Erreur lors de l'appel à l'IA:", error);
        } finally {
            setIsAILoading(false);
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
            <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800 shadow-lg">
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
                        // value="Je voudrais créer un site e-commerce avec paiement en ligne"
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Exemple: Je voudrais créer un site e-commerce avec paiement en ligne..."
                        className="w-full h-32 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent dark:bg-gray-800 dark:text-white"
                        disabled={isAILoading}
                    />
                </div>

                {/* Affichage de la requête améliorée */}
                {improvedQuery && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Suggestion de l'IA (dernière)
                        </label>
                        <div className="bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 rounded-lg p-3">
                            <p className="text-[#0ea5e9] dark:text-[#0ea5e9] whitespace-pre-wrap">
                                {improvedQuery}
                            </p>
                        </div>
                    </div>
                )}

                {/* Historique des requêtes précédentes */}
                {aiHistory.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Historique des suggestions
                        </label>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                            {aiHistory.map((item, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 mr-3">
                                            <div className="mb-2">
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    Demande #{aiHistory.length - index}:
                                                </span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                                    {item.query}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    Réponse:
                                                </span>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                                                    {item.response}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleApplySuggestion(item.response)}
                                            className="px-3 py-1 bg-gradient-to-r from-[#10b981] to-[#1e40af] hover:opacity-90 text-white text-xs rounded transition-opacity flex-shrink-0"
                                        >
                                            Appliquer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        disabled={isAILoading}
                    >
                        {improvedQuery ? "Fermer" : "Annuler"}
                    </button>
                    {!improvedQuery ? (
                        <button
                            onClick={handleAISubmit}
                            disabled={!aiQuery.trim() || isAILoading}
                            className="px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] hover:opacity-90 transition-opacity text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isAILoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                    Traitement...
                                </>
                            ) : (
                                "Envoyer à l'IA"
                            )}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleAISubmit}
                                disabled={!aiQuery.trim() || isAILoading}
                                className="px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] hover:opacity-90 transition-opacity text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isAILoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        Traitement...
                                    </>
                                ) : (
                                    "Envoyer à l'IA"
                                )}
                            </button>
                            <button
                                onClick={() => handleApplySuggestion(improvedQuery)}
                                className="px-3 py-1 bg-gradient-to-r from-[#10b981] to-[#1e40af] hover:opacity-90 text-white text-xs rounded transition-opacity flex-shrink-0"
                            >
                                Appliquer
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

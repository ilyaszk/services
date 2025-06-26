"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  Sparkles, 
  MessageSquare,
  Brain,
  Target,
  ArrowRight
} from "lucide-react";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  serviceRecommendations?: ServiceRecommendation[];
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

export default function AgentIAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationAnalysis, setConversationAnalysis] = useState<ConversationAnalysis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    // Message d'accueil
    const welcomeMessage: Message = {
      id: "welcome",
      content: "Bonjour ! Je suis votre assistant IA personnalisé. Je vais vous aider à définir précisément vos besoins et vous recommander les meilleures prestations adaptées à votre projet. Décrivez-moi votre projet ou vos objectifs, et je vous guiderai étape par étape.",
      isBot: true,
      timestamp: new Date(),
      suggestions: [
        "Je veux créer un site web pour mon entreprise",
        "J'ai besoin d'une stratégie marketing complète",
        "Je cherche à améliorer mon image de marque",
        "J'ai un projet de développement d'application"
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent-ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages,
          userId: session?.user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec l\'agent IA');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now().toString() + '_bot',
        content: data.response,
        isBot: true,
        timestamp: new Date(),
        suggestions: data.suggestions,
        serviceRecommendations: data.serviceRecommendations
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (data.analysis) {
        setConversationAnalysis(data.analysis);
      }

    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        content: "Désolé, une erreur s'est produite. Pouvez-vous reformuler votre demande ?",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Assistant IA Personnalisé
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Un agent intelligent qui comprend vos besoins spécifiques et vous guide vers les meilleures solutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Analyse de conversation */}
          {conversationAnalysis && (
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Analyse de vos besoins
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Besoin identifié
                    </h4>
                    <p className="text-sm">{conversationAnalysis.userNeed}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Complexité
                    </h4>
                    <Badge variant={
                      conversationAnalysis.complexity === 'simple' ? 'default' :
                      conversationAnalysis.complexity === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {conversationAnalysis.complexity === 'simple' ? 'Simple' :
                       conversationAnalysis.complexity === 'medium' ? 'Moyen' : 'Complexe'}
                    </Badge>
                  </div>

                  {conversationAnalysis.budget && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Budget estimé
                      </h4>
                      <p className="text-sm">{conversationAnalysis.budget}</p>
                    </div>
                  )}

                  {conversationAnalysis.timeline && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Délai souhaité
                      </h4>
                      <p className="text-sm">{conversationAnalysis.timeline}</p>
                    </div>
                  )}

                  {conversationAnalysis.priorities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Priorités
                      </h4>
                      <div className="space-y-1">
                        {conversationAnalysis.priorities.map((priority, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {priority}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chat principal */}
          <div className={conversationAnalysis ? "lg:col-span-3" : "lg:col-span-4"}>
            <Card className="h-[70vh] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversation avec l'assistant
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                {/* Messages */}
                <div className="h-full overflow-y-auto p-6 space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                      {message.isBot && (
                        <Avatar className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600">
                          <Bot className="h-4 w-4 text-white" />
                        </Avatar>
                      )}
                      
                      <div className={`max-w-2xl ${message.isBot ? 'text-left' : 'text-right'}`}>
                        <div className={`inline-block p-4 rounded-lg ${
                          message.isBot 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>

                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Suggestions :
                            </p>
                            <div className="space-y-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-left h-auto p-2 whitespace-normal"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommandations de services */}
                        {message.serviceRecommendations && message.serviceRecommendations.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Sparkles className="h-4 w-4" />
                              Services recommandés :
                            </p>
                            <div className="grid gap-3">
                              {message.serviceRecommendations.map((service) => (
                                <Card key={service.id} className="p-3 hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-sm">{service.title}</h4>
                                    <Badge variant="secondary" className="text-xs">
                                      {Math.round(service.matchScore)}% de correspondance
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {service.description}
                                  </p>
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-green-600">
                                      {service.price}€
                                    </span>
                                    <Button size="sm" variant="outline">
                                      Voir l'offre
                                      <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  </div>
                                  {service.reasons.length > 0 && (
                                    <div className="mt-2 pt-2 border-t">
                                      <p className="text-xs text-gray-500 mb-1">Pourquoi cette recommandation :</p>
                                      <div className="flex flex-wrap gap-1">
                                        {service.reasons.map((reason, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {reason}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {!message.isBot && (
                        <Avatar className="h-8 w-8 bg-gradient-to-r from-green-500 to-blue-600">
                          <User className="h-4 w-4 text-white" />
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600">
                        <Bot className="h-4 w-4 text-white" />
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Décrivez votre projet ou posez une question..."
                      className="flex-1 min-h-[60px] resize-none"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => handleSendMessage(inputMessage)}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

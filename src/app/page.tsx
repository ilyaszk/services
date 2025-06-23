import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Services Management Platform
              </h1>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8">
                Simplifiez l'accès, la contractualisation et le paiement des
                prestations de service pour votre entreprise.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/offres"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-center font-medium transition-colors"
                >
                  Découvrir les offres
                </Link>
                <Link
                  href="/api/auth/signin"
                  className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg text-center font-medium transition-colors"
                >
                  Connexion
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md h-64 md:h-80">
                <div className="absolute inset-0 bg-blue-600 rounded-lg transform rotate-3"></div>
                <div className="absolute inset-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                  <div className="h-full flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <svg
                          className="w-12 h-12 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                        Simplifiez votre gestion
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Gagnez du temps et réduisez votre stress administratif
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Fonctionnalités principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center transition-transform hover:transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Catalogue d'offres
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Accédez à un large catalogue de services avec des filtres
                avancés pour trouver exactement ce dont vous avez besoin.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center transition-transform hover:transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Authentification sécurisée
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connectez-vous facilement via GitHub ou email pour une
                expérience utilisateur fluide et sécurisée.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center transition-transform hover:transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                Matching IA (Bientôt)
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Bénéficiez d'un matching intelligent qui vous propose les
                services les plus pertinents pour votre entreprise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            À propos de SMP
          </h2>
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="bg-blue-600 p-1 rounded-lg">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Notre mission
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Simplifier la gestion des prestations de services
                    professionnels en offrant une expérience fluide, rapide et
                    sécurisée pour les entreprises de toute taille.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Que vous soyez une entreprise individuelle, une TPE ou une
                    PME, SMP vous accompagne pour optimiser la gestion de vos
                    prestataires.
                  </p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                Technologies utilisées
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Next.js 14 (App Router)
                  </span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    NextAuth.js pour l'authentification
                  </span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    SQLite via Prisma (ORM)
                  </span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Tailwind CSS pour le design
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Prêt à simplifier la gestion de vos services ?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez SMP dès aujourd'hui et découvrez comment notre plateforme
            peut transformer votre approche des prestations de services.
          </p>
          <Link
            href="/offres"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium inline-block transition-colors"
          >
            Voir les offres
          </Link>
        </div>
      </section>
    </div>
  );
}

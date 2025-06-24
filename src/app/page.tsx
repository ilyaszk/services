import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-[30%] -left-[10%] w-[40%] h-[70%] rounded-full bg-[#1e40af]/20 blur-[100px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#8b5cf6]/20 blur-[100px]"></div>
          <div className="absolute -bottom-[30%] left-[20%] w-[40%] h-[60%] rounded-full bg-[#0ea5e9]/20 blur-[100px]"></div>
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="mb-6 flex justify-center">
              <span className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white px-4 py-1 rounded-full text-sm font-medium">
                Service Management Platform v1.0
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Services Management pour{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6]">
                les entreprises modernes
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">
              Simplifiez l'accès, la contractualisation et le paiement des
              prestations de service pour votre entreprise.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/offres"
                className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-lg text-center font-medium transition-colors"
              >
                Découvrir les offres
              </Link>
              <Link
                href="/api/auth/signin"
                className="border border-gray-700 hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-center font-medium transition-colors"
              >
                Connexion →
              </Link>
            </div>
          </div>
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 border border-gray-800 rounded-xl -rotate-1"></div>
            <div className="absolute inset-0 border border-gray-800 rounded-xl rotate-1"></div>
            <div className="relative bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-xl p-1">
              <div className="bg-black rounded-lg overflow-hidden">
                <div className="h-10 border-b border-gray-800 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-[#f59e0b] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                    <div className="w-3 h-3 bg-[#8b5cf6] rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto text-[#0ea5e9] mb-4"
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
                    <h3 className="text-2xl font-medium text-white mb-2">
                      Simplifiez votre gestion
                    </h3>
                    <p className="text-gray-400">
                      Gagnez du temps et réduisez votre stress administratif
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-[10%] -right-[20%] w-[40%] h-[60%] rounded-full bg-[#10b981]/10 blur-[120px]"></div>
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex justify-center mb-16">
            <span className="border border-gray-800 text-gray-400 rounded-full px-5 py-1 text-sm">
              Fonctionnalités principales
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Tout ce dont vous avez besoin pour{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#10b981] to-[#0ea5e9]">
              gérer vos prestations
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-gray-800 bg-gradient-to-b from-gray-900 to-black rounded-xl p-8 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0ea5e9]/10">
              <div className="bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-white"
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
              <h3 className="text-xl font-medium text-white mb-3">
                Catalogue d'offres
              </h3>
              <p className="text-gray-400">
                Accédez à un large catalogue de services avec des filtres
                avancés pour trouver exactement ce dont vous avez besoin.
              </p>
            </div>
            <div className="border border-gray-800 bg-gradient-to-b from-gray-900 to-black rounded-xl p-8 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#8b5cf6]/10">
              <div className="bg-gradient-to-r from-[#8b5cf6] to-[#1e40af] w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-white"
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
              <h3 className="text-xl font-medium text-white mb-3">
                Authentification sécurisée
              </h3>
              <p className="text-gray-400">
                Connectez-vous facilement via GitHub ou email pour une
                expérience utilisateur fluide et sécurisée.
              </p>
            </div>
            <div className="border border-gray-800 bg-gradient-to-b from-gray-900 to-black rounded-xl p-8 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#f59e0b]/10">
              <div className="bg-gradient-to-r from-[#f59e0b] to-[#10b981] w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-white"
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
              <h3 className="text-xl font-medium text-white mb-3">
                Matching IA (Bientôt)
              </h3>
              <p className="text-gray-400">
                Bénéficiez d'un matching intelligent qui vous propose les
                services les plus pertinents pour votre entreprise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[60%] rounded-full bg-[#f59e0b]/10 blur-[120px]"></div>
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex justify-center mb-16">
            <span className="border border-gray-800 text-gray-400 rounded-full px-5 py-1 text-sm">
              À propos
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            La plateforme conçue pour{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f59e0b] to-[#8b5cf6]">
              les entreprises modernes
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="border border-gray-800 bg-gradient-to-b from-gray-900 to-black rounded-xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Notre mission
                </h3>
                <p className="text-gray-400 mb-4">
                  Simplifier la gestion des prestations de services
                  professionnels en offrant une expérience fluide, rapide et
                  sécurisée pour les entreprises de toute taille.
                </p>
                <p className="text-gray-400">
                  Que vous soyez une entreprise individuelle, une TPE ou une
                  PME, SMP vous accompagne pour optimiser la gestion de vos
                  prestataires.
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-6">
                Technologies utilisées
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-800 bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 flex items-center">
                  <div className="bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-300">Next.js 14 (App Router)</span>
                </div>
                <div className="border border-gray-800 bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 flex items-center">
                  <div className="bg-gradient-to-r from-[#8b5cf6] to-[#1e40af] w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-300">NextAuth.js</span>
                </div>
                <div className="border border-gray-800 bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 flex items-center">
                  <div className="bg-gradient-to-r from-[#10b981] to-[#0ea5e9] w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-300">SQLite via Prisma</span>
                </div>
                <div className="border border-gray-800 bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 flex items-center">
                  <div className="bg-gradient-to-r from-[#f59e0b] to-[#10b981] w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16z"></path>
                    </svg>
                  </div>
                  <span className="text-gray-300">Tailwind CSS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0ea5e9] to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] blur-md"></div>
                <span className="relative bg-black border border-gray-800 rounded-full px-5 py-1 text-sm text-gray-300">
                  Démarrez maintenant
                </span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Prêt à simplifier la gestion de vos services ?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Rejoignez SMP dès aujourd'hui et découvrez comment notre
              plateforme peut transformer votre approche des prestations de
              services.
            </p>
            <Link
              href="/offres"
              className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 text-white px-8 py-4 rounded-lg font-medium inline-flex items-center justify-center transition-opacity"
            >
              Voir les offres
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

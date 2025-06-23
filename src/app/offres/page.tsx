import Link from "next/link";

export default function OffersPage() {
  // Ces offres seraient normalement chargées depuis la base de données
  const offers = [
    {
      id: 1,
      title: "Développement Web",
      description:
        "Services de création et maintenance de sites web et d'applications",
      price: 1200,
      category: "Développement",
    },
    {
      id: 2,
      title: "Design Graphique",
      description:
        "Création d'identités visuelles, logos et supports marketing",
      price: 800,
      category: "Design",
    },
    {
      id: 3,
      title: "Marketing Digital",
      description:
        "Stratégies SEO, campagnes publicitaires et gestion des réseaux sociaux",
      price: 950,
      category: "Marketing",
    },
    {
      id: 4,
      title: "Consulting IT",
      description:
        "Conseils et recommandations pour l'infrastructure et la sécurité informatique",
      price: 1500,
      category: "Consulting",
    },
    {
      id: 5,
      title: "Support Technique",
      description: "Assistance et maintenance pour vos systèmes informatiques",
      price: 650,
      category: "Support",
    },
    {
      id: 6,
      title: "Formation",
      description:
        "Sessions de formation pour vos équipes sur différentes technologies",
      price: 850,
      category: "Formation",
    },
  ];

  // Catégories uniques pour les filtres
  const categories = Array.from(new Set(offers.map((offer) => offer.category)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm py-4">
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              SMP
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              Accueil
            </Link>
            <Link
              href="/api/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors"
            >
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-6 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Nos offres de services
          </h1>
          <p className="text-lg md:text-xl max-w-2xl">
            Découvrez notre catalogue complet de prestations pour répondre à
            tous vos besoins professionnels.
          </p>
        </div>
      </header>

      {/* Filters and Offers */}
      <section className="container mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Filtres
              </h2>

              {/* Category filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Catégories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="ml-2 text-gray-700 dark:text-gray-300"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Prix
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="100"
                      defaultValue="2000"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      0 €
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      2000 €
                    </span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                Appliquer les filtres
              </button>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-transform hover:transform hover:scale-105"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        {offer.category}
                      </span>
                      <span className="text-gray-900 dark:text-white font-bold">
                        {offer.price} €
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {offer.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {offer.description}
                    </p>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                      Voir les détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SMP</h3>
              <p className="text-gray-400">
                Simplifiez l'accès, la contractualisation et le paiement des
                prestations de service pour votre entreprise.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#about"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    À propos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/offres"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Offres
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Contact</h3>
              <p className="text-gray-400">contact@smp-platform.com</p>
              <div className="flex space-x-4 mt-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} SMP - Services Management
              Platform. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

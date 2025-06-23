"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                SMP
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="border-transparent text-gray-900 dark:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Accueil
              </Link>
              <Link
                href="/offres"
                className="border-transparent text-gray-900 dark:text-gray-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Offres
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === "authenticated" && session?.user ? (
              <div className="flex items-center">
                <span className="text-gray-700 dark:text-gray-300 mr-4">
                  Bonjour, {session.user.name || "Utilisateur"}
                </span>

                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={`Avatar de ${
                          session.user.name || "l'utilisateur"
                        }`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {session.user.name?.charAt(0).toUpperCase() ||
                          session.user.email?.charAt(0).toUpperCase() ||
                          "U"}
                      </div>
                    )}
                  </button>

                  {isMenuOpen && (
                    <div className="z-100 origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {session.user.name || "Utilisateur"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profil
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut({ redirect: true, callbackUrl: "/" });
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Ouvrir le menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/offres"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Offres
            </Link>
          </div>

          {status === "authenticated" && session?.user ? (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={`Avatar de ${session.user.name || "l'utilisateur"}`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {session.user.name?.charAt(0).toUpperCase() ||
                      session.user.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                    {session.user.name || "Utilisateur"}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {session.user.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut({ redirect: true, callbackUrl: "/" });
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <Link
                  href="/auth/signin"
                  className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

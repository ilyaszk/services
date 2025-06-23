# 🧠 SMP – Services Management Platform

SMP est une plateforme intelligente qui simplifie l’accès, la contractualisation et le paiement des prestations de service pour les entreprises (EI, TPE, PME).

---

## 🚀 Mission

Simplifier la gestion des prestations de services professionnels en offrant une expérience fluide, rapide et sécurisée.

---

## 🧩 Fonctionnalités V1

- ✅ **Landing Page** : présentation de la plateforme et redirection vers les offres
- ✅ **Liste des offres** : catalogue avec filtres
- ✅ **Authentification** : via GitHub ou email
- ✅ **Base de données** : SQLite avec Prisma
- 🚧 **Matching IA** : à venir
- 🚧 **Paiements sécurisés (Escrow)** : à venir

---

## ⚙️ Stack technique

| Composant        | Techno                  |
| ---------------- | ----------------------- |
| Frontend         | Next.js 14 (App Router) |
| Authentification | NextAuth.js             |
| Base de données  | SQLite (via Prisma)     |
| UI Styling       | Tailwind CSS            |
| ORM              | Prisma                  |
| IA Matching      | OpenAI API (future)     |

---

## 🗂️ Structure du projet

/app
├── layout.tsx # Layout global
├── page.tsx # Landing page
├── offres/
│ └── page.tsx # Liste des offres
/lib
├── prisma.ts # Client Prisma
/pages/api/auth
├── [...nextauth].ts # Auth route NextAuth
/prisma
├── schema.prisma # Modèle de données
/styles
├── globals.css # CSS global

---

## 🔐 Authentification – NextAuth.js

Fichier : `/pages/api/auth/[...nextauth].ts`

```ts
import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email"

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!
    })
  ],
})
model User {
  id       Int     @id @default(autoincrement())
  email    String  @unique
  name     String?
  offers   Offer[]
}

model Offer {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  price       Float
  category    String
  createdAt   DateTime @default(now())
  author      User?    @relation(fields: [authorId], references: [id])
  authorId    Int?
}

```

# Installation des dépendances

npm install

# Générer le client Prisma

npx prisma generate

# Appliquer la migration

npx prisma migrate dev --name init

# Lancer le serveur de dev

npm run dev

| URL             | Description               |
| --------------- | ------------------------- |
| `/`             | Landing Page              |
| `/offres`       | Liste des offres          |
| `/api/auth/...` | Authentification NextAuth |

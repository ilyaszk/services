import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

// Extend the built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Temporarily disable GitHub provider until we have valid credentials
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID || '',
    //   clientSecret: process.env.GITHUB_SECRET || '',
    // }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isCorrectPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.sub || "";
        session.user.name = token.name as string | null;
        session.user.email = token.email as string | "";
        session.user.image = token.picture as string | null;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;

// Use NextAuth with our configuration
const handler = NextAuth(authConfig);

// Export the auth, signIn, and signOut functions
export const { auth, signIn, signOut } = handler;

// Export route handlers for Next.js App Router
export const GET = handler.handlers.GET;
export const POST = handler.handlers.POST;

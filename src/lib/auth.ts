import { prisma } from '@/lib/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      role: string | undefined;
      company: string | null;
      jobTitle: string | null;
      bio: string | null;
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
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
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

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.sub || '';
        session.user.name = token.name as string | null;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | null;
        session.user.role = token.role as string | undefined;
        session.user.company = token.company as string | null;
        session.user.jobTitle = token.jobTitle as string | null;
        session.user.bio = token.bio as string | null;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.sub = u.id;
        token.name = u.name;
        token.email = u.email;
        token.picture = u.image;
        token.role = u.role;
        token.company = u.company;
        token.jobTitle = u.jobTitle;
        token.bio = u.bio;
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
        });

        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
          token.role = dbUser.role;
          token.company = dbUser.company;
          token.jobTitle = dbUser.jobTitle;
          token.bio = dbUser.bio;
        } else {
          return null;
        }
      }

      return token;
    },
  },
} satisfies NextAuthConfig;

// Initialize NextAuth handler
const handler = NextAuth(authConfig);

// Export auth function for use in route handlers
export const { auth, signIn, signOut } = handler;

import NextAuth, { DefaultSession, NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyCredentials } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      apiKey?: string;
    } & DefaultSession["user"]
  }
  interface User {
    apiKey?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }
        
        try {
          const user = await verifyCredentials(credentials.email, credentials.password);
          if (!user) {
            throw new Error('Invalid email or password');
          }
          return user;
        } catch (error: any) {
          // Throw specific error message or default to generic one
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/',
    error: '/?error=true', // Add this line to handle errors
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.apiKey = user.apiKey;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
        token.apiKey = session.apiKey;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.apiKey = token.apiKey as string | undefined;
      }
      return session;
    },
  },
  // Add custom error messages
  theme: {
    error: {
      'Default': 'Unable to sign in',
      'CredentialsSignin': 'Invalid email or password',
      'EmailSignin': 'Check your email address',
      'SessionRequired': 'Please sign in to access this page',
    }
  }
};

export default NextAuth(authOptions);

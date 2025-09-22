import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma) as any, // Temporarily disabled due to compatibility issues
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("Aucun compte trouvé avec cet e-mail");

        if (!user.password) {
          throw new Error(
            "Ce compte utilise une connexion sociale. Utilisez Google pour vous connecter."
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) throw new Error("Mot de passe incorrect");

        if (!user.emailVerified) {
          throw new Error("Veuillez vérifier votre e-mail avant de vous connecter");
        }

        return {
          id: user.id,
          email: user.email!,
          name: user.name!,
          role: user.role as "STUDENT" | "INSTRUCTOR" | "ADMIN",
          image: user.image || undefined,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        console.log("JWT callback - new sign in:", { userId: user.id, provider: account.provider });
        
        if (account.provider === "google") {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: new Date(),
              },
            });
            token.role = existingUser.role;
            token.userId = existingUser.id;
          } else {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                image: user.image,
                role: "STUDENT",
                emailVerified: new Date(),
              },
            });
            token.role = newUser.role;
            token.userId = newUser.id;
          }
        } else {
          token.role = user.role;
          token.userId = user.id;
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.role = token.role as "STUDENT" | "INSTRUCTOR" | "ADMIN";
      }
      
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user, account }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
  },

  debug: process.env.NODE_ENV === "development",
};

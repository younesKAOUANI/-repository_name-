import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
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
          university: user.university || undefined,
          year: user.year || undefined,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "STUDENT";
        token.university = user.university || undefined;
        token.year = user.year || undefined;
      } else {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
        });
        if (dbUser) {
          token.role = dbUser.role as "STUDENT" | "INSTRUCTOR" | "ADMIN";
        token.university = dbUser.university || undefined;
        token.year = dbUser.year || undefined;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as "STUDENT" | "INSTRUCTOR" | "ADMIN";
        session.user.university = token.university ?? undefined;
        session.user.year = token.year ?? undefined;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              image: user.image,
              emailVerified: new Date(),
              role: "STUDENT",
            },
          });
        }
      }
      return true;
    },
  },

  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },

  events: {
    async signIn({ user, account }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
  },

  debug: process.env.NODE_ENV === "development",
};

// ✅ Export route handlers
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

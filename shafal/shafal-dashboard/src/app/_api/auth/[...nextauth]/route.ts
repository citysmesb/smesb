import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import fs from 'fs';
import path from 'path';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@shafal.org" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
            const dataPath = path.join(process.cwd(), 'data', 'users.json');
            const fileData = fs.readFileSync(dataPath, 'utf-8');
            const users = JSON.parse(fileData);
            
            // In a real app we would use bcrypt.compare(), but for this flat-file DB we do a simple check
            // (If we upgrade to bcrypt later, we will use it here)
            const user = users.find((u: any) => u.email === credentials.email && u.password === credentials.password);
            
            if (user) {
                return { id: user.id, email: user.email, name: user.name, role: user.role, permissions: user.permissions || [] };
            }
        } catch (error) {
            console.error("Error reading users.json in auth", error);
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    }
  },
  secret: "shafal-super-secret-key-1234567890",
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

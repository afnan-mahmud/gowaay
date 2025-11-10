import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { api } from './api';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await api.auth.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (response.success && response.data) {
            const { user, token } = response.data as any; // Type assertion for API response
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              phone: user.phone,
              accessToken: token,
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as any; // Type assertion for custom user properties
        token.accessToken = customUser.accessToken;
        token.role = customUser.role;
        token.phone = customUser.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const user = session.user as any; // Type assertion for custom user properties
        user.id = token.sub!;
        user.role = token.role as string;
        user.phone = token.phone as string;
        (session as any).accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

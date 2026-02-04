import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data.accessToken) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: `${data.user.firstName} ${data.user.lastName}`,
              image: data.user.profileImage,
              accessToken: data.accessToken,
              userType: data.user.userType,
              ...data.user,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google sign-in, register/login with our backend
      if (account?.provider === 'google' && profile) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: profile.email,
              googleId: profile.sub,
              firstName: (profile as any).given_name || profile.name?.split(' ')[0] || '',
              lastName: (profile as any).family_name || profile.name?.split(' ').slice(1).join(' ') || '',
              profileImage: (profile as any).picture,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            // Store tokens in user object for JWT callback
            (user as any).accessToken = data.accessToken;
            (user as any).userType = data.user.userType;
            (user as any).backendUser = data.user;
            return true;
          }
          return false;
        } catch (error) {
          console.error('Google auth backend error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.userType = (user as any).userType;
        token.backendUser = (user as any).backendUser || user;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.userType = token.userType as string;
      if (token.backendUser) {
        session.user = token.backendUser as any;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

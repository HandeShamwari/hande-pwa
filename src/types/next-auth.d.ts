import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    userType?: string;
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      profileImage?: string;
      userType?: string;
    } & DefaultSession['user'];
  }

  interface User {
    accessToken?: string;
    userType?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    userType?: string;
    backendUser?: any;
  }
}

import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string;
            isAdmin: boolean;
            phone?: string | null;
            address?: string | null;
            city?: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        isAdmin: boolean;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        isAdmin: boolean;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
    }
}

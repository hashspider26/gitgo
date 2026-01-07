import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const getPrismaClient = () => {
    // We check for TURSO_DATABASE_URL first. On Vercel, you should set your Turso URL here.
    // If we use the standard DATABASE_URL name with a libsql:// prefix, 
    // Prisma's CLI/Client might still try to validate it against the 'file:' requirement 
    // for the sqlite provider. Using a different name bypasses this check.

    const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (url?.startsWith("libsql://")) {
        const libsql = createClient({
            url: url,
            authToken: authToken,
        });
        const adapter = new PrismaLibSQL(libsql);

        return new PrismaClient({ adapter });
    }

    // Local development fallback
    return new PrismaClient();
};

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

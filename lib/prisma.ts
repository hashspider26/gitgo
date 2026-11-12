import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const setupPrisma = () => {
    // Ensure DATABASE_URL is always defined so Prisma's schema validation never fails
    // when only TURSO_DATABASE_URL is configured or during build-time prerendering.
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = "file:./dev.db";
    }

    const url =
        process.env.TURSO_DATABASE_URL ||
        (process.env.DATABASE_URL.startsWith("libsql:") || process.env.DATABASE_URL.startsWith("https:")
            ? process.env.DATABASE_URL
            : undefined);
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (url && authToken) {
        console.log("Prisma: Using Turso Live Database Connection");
        const libsql = createClient({
            url: url,
            authToken: authToken,
        });
        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    }

    console.log("Prisma: Fallback to local SQLite connection");
    return new PrismaClient();
};

export const prisma = globalForPrisma.prisma ?? setupPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;



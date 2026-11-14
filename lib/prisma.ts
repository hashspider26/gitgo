import { PrismaClient } from "@prisma/client/wasm";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const getPrisma = (): PrismaClient => {
    if (globalForPrisma.prisma) {
        return globalForPrisma.prisma;
    }

    // Ensure DATABASE_URL is always defined so Prisma's schema validation never fails
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = "file:./dev.db";
    }

    const url =
        process.env.TURSO_DATABASE_URL ||
        (process.env.DATABASE_URL.startsWith("libsql:") || process.env.DATABASE_URL.startsWith("https:")
            ? process.env.DATABASE_URL
            : undefined);
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (url) {
        console.log("Prisma: Using Turso Live Database Connection");
        const libsql = createClient({
            url: url,
            authToken: authToken,
        });
        const adapter = new PrismaLibSQL(libsql);
        const client = new PrismaClient({ adapter });
        globalForPrisma.prisma = client;
        return client;
    }

    console.log("Prisma: Fallback to local SQLite connection");
    const client = new PrismaClient();
    globalForPrisma.prisma = client;
    return client;
};

// Lazy Proxy so PrismaClient is only instantiated at request time AFTER
// Cloudflare Workers has populated process.env (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN).
export const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop, receiver) {
        const client = getPrisma();
        const value = Reflect.get(client, prop, receiver);
        return typeof value === "function" ? value.bind(client) : value;
    },
});



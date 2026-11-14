import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/http";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const customFetch = async (input: any, init?: any) => {
    if (
        input &&
        typeof input === "object" &&
        typeof input.url === "string" &&
        (typeof globalThis.Request === "undefined" || !(input instanceof globalThis.Request))
    ) {
        const headers = new globalThis.Headers();
        if (input.headers && typeof input.headers.forEach === "function") {
            input.headers.forEach((value: string, key: string) => {
                headers.set(key, value);
            });
        }
        const method = input.method || "GET";
        const body =
            method !== "GET" && method !== "HEAD" && input.body != null
                ? input.body
                : undefined;
        return globalThis.fetch(input.url, {
            method,
            headers,
            body,
            ...init,
        });
    }
    return globalThis.fetch(input, init);
};

const getPrisma = (): PrismaClient => {
    if (globalForPrisma.prisma) {
        return globalForPrisma.prisma;
    }

    // Ensure DATABASE_URL is always defined so Prisma's schema validation never fails
    if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = "file:./dev.db";
    }

    const rawUrl =
        process.env.TURSO_DATABASE_URL ||
        (process.env.DATABASE_URL.startsWith("libsql:") || process.env.DATABASE_URL.startsWith("https:")
            ? process.env.DATABASE_URL
            : undefined);
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (rawUrl) {
        console.log("Prisma: Using Turso Live Database Connection");
        const url = rawUrl.replace(/^libsql:\/\//, "https://");
        const libsql = createClient({
            url,
            authToken,
            fetch: customFetch,
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

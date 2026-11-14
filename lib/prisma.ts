import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/http";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const customFetch = async (input: any, init?: any) => {
    // Capture native fetch bypassing Next.js patchedFetch if available
    const nativeFetch: typeof fetch =
        (globalThis as any)._nextOriginalFetch || globalThis.fetch;

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
        let body: any = undefined;
        if (method !== "GET" && method !== "HEAD" && input.body != null) {
            body =
                input.body instanceof Uint8Array
                    ? new Uint8Array(input.body.buffer, input.body.byteOffset, input.body.byteLength)
                    : input.body;
        }
        return nativeFetch(input.url, {
            method,
            headers,
            body,
            cache: "no-store",
            ...init,
        });
    }
    return nativeFetch(input, { cache: "no-store", ...init });
};

const createPrismaClient = (): PrismaClient => {
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
        const url = rawUrl.replace(/^libsql:\/\//, "https://");
        const libsql = createClient({
            url,
            authToken,
            fetch: customFetch,
        });
        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    }

    return new PrismaClient();
};

const getPrisma = (): PrismaClient => {
    // In Cloudflare Workers / OpenNext, each request has its own AsyncLocalStorage store
    // (__openNextAls). Sharing a PrismaClient across different Worker requests causes
    // cross-request I/O cancellation when concurrent RSC prefetches run.
    const alsStore = (globalThis as any).__openNextAls?.getStore?.();
    if (alsStore) {
        if (!alsStore.__prismaClient) {
            alsStore.__prismaClient = createPrismaClient();
        }
        return alsStore.__prismaClient;
    }

    const isWorkerd =
        typeof (globalThis as any).WebSocketPair !== "undefined" ||
        (typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers");
    if (isWorkerd) {
        return createPrismaClient();
    }

    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
};

// Lazy Proxy so PrismaClient is resolved per-request in Cloudflare Workers
// and cached as a singleton in standard Node.js / Vercel environments.
export const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop, receiver) {
        const client = getPrisma();
        const value = Reflect.get(client, prop, receiver);
        return typeof value === "function" ? value.bind(client) : value;
    },
});

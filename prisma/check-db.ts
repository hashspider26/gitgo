import { prisma } from "../lib/prisma";

async function check() {
    const products = await prisma.product.findMany();
    console.log(`Current product count: ${products.length}`);
    if (products.length > 0) {
        console.log("Product IDs:", products.map(p => p.id));
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());


import { prisma } from "../lib/prisma";

async function check() {
    const products = await prisma.product.findMany({
        take: 5
    });
    console.log(`Current product count: ${products.length}`);
    products.forEach(p => {
        console.log(`Product: ${p.title}`);
        console.log(`Images: ${p.images}`);
        console.log('---');
    });
}

check().catch(console.error).finally(() => prisma.$disconnect());

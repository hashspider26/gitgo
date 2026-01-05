
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = ["Seeds", "Tools", "Pots", "Fertilizers"];

async function main() {
    console.log('Seeding categories...');
    for (const name of categories) {
        try {
            await prisma.category.upsert({
                where: { name },
                update: {},
                create: { name },
            });
            console.log(`Ensured category: ${name}`);
        } catch (e) {
            console.error(`Error adding ${name}:`, e);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

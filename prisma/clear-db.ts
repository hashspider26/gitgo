import { prisma } from "../lib/prisma";

async function main() {
    console.log("Cleaning up database...");

    // Delete in order to respect foreign key constraints
    const orderItems = await prisma.orderItem.deleteMany();
    console.log(`Deleted ${orderItems.count} order items.`);

    const orders = await prisma.order.deleteMany();
    console.log(`Deleted ${orders.count} orders.`);

    const products = await prisma.product.deleteMany();
    console.log(`Deleted ${products.count} products.`);

    const categories = await prisma.category.deleteMany();
    console.log(`Deleted ${categories.count} categories.`);

    const contactMessages = await prisma.contactMessage.deleteMany();
    console.log(`Deleted ${contactMessages.count} contact messages.`);

    console.log("Database cleanup complete!");
}

main()
    .catch((e) => {
        console.error("Error during cleanup:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

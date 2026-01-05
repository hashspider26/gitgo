import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
    // Clean up existing data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();

    // Create initial products
    const products = [
        {
            title: "Organic Tomato Seeds",
            slug: "organic-tomato-seeds",
            description: "High-quality organic tomato seeds for your home garden. These seeds yield juicy, red tomatoes perfect for salads and cooking.",
            price: 150,
            category: "Seeds",
            stock: 100,
            isFeatured: true,
            images: JSON.stringify(["https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=800"]),
        },
        {
            title: "Basil Herb Seeds",
            slug: "basil-herb-seeds",
            description: "Fresh aromatic basil seeds. Easy to grow and perfect for adding fresh flavor to your dishes.",
            price: 100,
            category: "Seeds",
            stock: 50,
            isFeatured: true,
            images: JSON.stringify(["https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&q=80&w=800"]),
        },
        {
            title: "Gardening Trowel",
            slug: "gardening-trowel",
            description: "Durable steel trowel with a comfortable grip. Essential tool for planting and digging.",
            price: 450,
            category: "Tools",
            stock: 20,
            isFeatured: false,
            images: JSON.stringify(["https://images.unsplash.com/photo-1416879895691-88fc402b8d9d?auto=format&fit=crop&q=80&w=800"]),
        },
        {
            title: "Sunflower Seeds",
            slug: "sunflower-seeds",
            description: "Giant sunflower seeds that grow into tall, beautiful flowers. Great for bees and aesthetics.",
            price: 120,
            category: "Seeds",
            stock: 80,
            isFeatured: true,
            images: JSON.stringify(["https://images.unsplash.com/photo-1471943311132-c66dfe85d694?auto=format&fit=crop&q=80&w=800"]),
        },
        {
            title: "Watering Can (5L)",
            slug: "watering-can-5l",
            description: "Lightweight plastic watering can with a 5-liter capacity. Perfect for watering indoor and outdoor plants.",
            price: 600,
            category: "Tools",
            stock: 15,
            isFeatured: false,
            images: JSON.stringify(["https://images.unsplash.com/photo-1599687267812-35c05dc70be1?auto=format&fit=crop&q=80&w=800"]),
        },
    ];

    for (const product of products) {
        await prisma.product.create({
            data: product,
        });
    }

    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.user.upsert({
        where: { email: "admin@greenvalley.pk" },
        update: {
            password: hashedPassword,
            isAdmin: true,
        },
        create: {
            email: "admin@greenvalley.pk",
            name: "Admin",
            password: hashedPassword,
            isAdmin: true,
        }
    });

    console.log("Seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

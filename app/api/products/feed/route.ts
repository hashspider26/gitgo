import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const baseUrl = process.env.NEXTAUTH_URL || "https://greenvalleyseeds.pk";
        
        // Meta (Facebook) Catalog Feed in CSV format
        // Required columns: id, title, description, availability, condition, price, link, image_link, brand
        let csv = "id,title,description,availability,condition,price,link,image_link,brand\n";

        products.forEach(product => {
            const id = product.id;
            const title = `"${product.title.replace(/"/g, '""')}"`;
            const description = `"${product.description.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
            const availability = product.stock > 0 ? "in stock" : "out of stock";
            const condition = "new";
            const price = `${product.price} PKR`;
            const link = `${baseUrl}/product/${product.slug}`;
            
            let imageLink = "";
            try {
                const images = JSON.parse(product.images);
                imageLink = images.length > 0 ? images[0] : "";
            } catch (e) {}

            const brand = "Green Valley Seeds";

            csv += `${id},${title},${description},${availability},${condition},${price},${link},${imageLink},${brand}\n`;
        });

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": 'attachment; filename="meta-catalog-feed.csv"',
            },
        });
    } catch (error) {
        console.error("Feed generation failed:", error);
        return NextResponse.json({ error: "Failed to generate feed" }, { status: 500 });
    }
}

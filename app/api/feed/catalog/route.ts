import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const viewRaw = searchParams.get("view") === "raw";
    const products = await prisma.product.findMany();

    const baseUrl = "https://greenvalleyseeds.pk";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Green Valley Seeds Product Catalog</title>
    <link>${baseUrl}</link>
    <description>Green Valley Seeds Products Feed for Catalog Ads</description>
`;

    for (const product of products) {
      let imageUrl = "";
      try {
        const images = JSON.parse(product.images);
        if (Array.isArray(images) && images.length > 0) {
          imageUrl = images[0];
        } else if (typeof images === 'string' && images.length > 0) {
          imageUrl = images; // in case it's not a JSON array
        }
      } catch (e) {
        // Fallback or ignore if images parsing fails
        imageUrl = product.images || ""; 
      }

      // Ensure URL is absolute
      if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = `${baseUrl}${imageUrl}`;
      }

      // Basic xml escaping
      const escapeXml = (unsafe: string) => {
        return (unsafe || "").replace(/[<>&'"]/g, function (c) {
          switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
          }
        });
      };

      const title = escapeXml(product.title);
      const description = escapeXml(product.description || product.title);
      const link = `${baseUrl}/product/${product.slug}`;
      const image_link = escapeXml(imageUrl);
      const price = `${product.price}.00 PKR`;
      const availability = product.stock > 0 ? "in_stock" : "out_of_stock";

      xml += `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${image_link}</g:image_link>
      <g:brand>Green Valley Seeds</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
`;

      if (product.salePrice && product.salePrice < product.price) {
        xml += `      <g:sale_price>${product.salePrice}.00 PKR</g:sale_price>\n`;
      }

      xml += `    </item>\n`;
    }

    xml += `  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": viewRaw ? "text/plain" : "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Feed generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

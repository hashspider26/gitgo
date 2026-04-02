import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordContactNotification } from "@/lib/discord";


// POST - Submit contact form
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create contact message
        const contactMessage = await prisma.contactMessage.create({
            data: {
                name,
                email,
                phone: phone || null,
                subject,
                message,
                status: "UNREAD"
            }
        });

        // Send Discord notification (fire and forget)
        sendDiscordContactNotification(contactMessage).catch(err =>
            console.error("Delayed Discord contact notification failed:", err)
        );

        return NextResponse.json(
            { message: "Message sent successfully", id: contactMessage.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating contact message:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}

// GET - Fetch messages for admin
export async function GET(request: NextRequest) {
    try {
        // Check if user is admin
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Build where clause
        const where: any = {};
        if (status) {
            where.status = status;
        }

        // Fetch messages
        const [messages, total] = await Promise.all([
            prisma.contactMessage.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset
            }),
            prisma.contactMessage.count({ where })
        ]);

        return NextResponse.json({
            messages,
            total,
            limit,
            offset
        });
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}


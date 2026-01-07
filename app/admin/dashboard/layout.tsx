import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

import { NotificationManager } from "@/components/admin/notification-manager";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        redirect("/");
    }

    return (
        <>
            <NotificationManager />
            {children}
        </>
    );
}

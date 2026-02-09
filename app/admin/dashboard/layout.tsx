import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminTabs } from "@/components/admin/admin-tabs";

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
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
            <AdminTabs sessionName={session.user.name || "Admin"} />

            <main className="py-8">
                {children}
            </main>
        </div>
    );
}

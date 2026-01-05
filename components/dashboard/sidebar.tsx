import Link from "next/link";
import { LayoutDashboard, Package, Store, DollarSign, Settings, ShoppingCart, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  role: "influencer" | "dropshipper";
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
};

export function DashboardSidebar({ role, className, collapsed, onToggle }: Props) {
  const items = role === "dropshipper"
    ? [
      { href: "/dashboard/dropshipper", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/dropshipper/orders", label: "Orders", icon: ShoppingCart },
      { href: "/dashboard/dropshipper/products", label: "Products", icon: Package },
      { href: "/dashboard/dropshipper/stores", label: "Stores", icon: Store },
      { href: "/dashboard/dropshipper/analytics", label: "Analytics", icon: DollarSign },
      { href: "/dashboard/dropshipper/settings", label: "Settings", icon: Settings },
    ]
    : [
      { href: "/store/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/products", label: "Browse", icon: Package },
      { href: "/store/dashboard/store", label: "My Store", icon: Store },
      { href: "/store/dashboard/earnings", label: "Earnings", icon: DollarSign },
      { href: "/store/dashboard/settings", label: "Settings", icon: Settings },
    ];

  return (
    <aside className={cn("h-full border-r border-zinc-200", collapsed ? "w-14" : "w-[168px]", className)}>
      <div className={cn("flex items-center justify-between p-3", collapsed && "justify-center")}>
        {!collapsed && <div className="text-sm font-semibold">Dashboard</div>}
        {onToggle && (
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
            onClick={onToggle}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 hover:bg-zinc-100"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>
      <nav className={cn("space-y-1 p-2", collapsed && "px-1")}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-zinc-100",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? item.label : undefined}
            aria-label={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}



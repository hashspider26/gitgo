import { Metadata } from "next";
import Link from "next/link";
import { 
    ArrowLeft, 
    BarChart3, 
    MousePointerClick, 
    Facebook,
    TrendingUp,
    Eye,
    Receipt,
    Target,
    BadgeDollarSign
} from "lucide-react";

export const metadata: Metadata = {
    title: "Facebook Ad Analytics | Green Valley Seeds",
    description: "Data analytics for Facebook ad campaigns",
};

// Mock data structured as what an API response might look like
export default function DataAnalyticsPage() {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 p-4 md:p-6 pb-20">
            <div className="mx-auto max-w-6xl space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-2 transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3 tracking-tight">
                            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                                <Facebook className="w-6 h-6 text-white" />
                            </div>
                            Ads Performance
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Real-time overview of your Meta (Facebook) advertising campaigns.</p>
                    </div>

                    {/* Notice Banner about API Connection */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 md:w-96 shadow-sm">
                        <div className="flex gap-3">
                            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300">Live Data Setup Required</h3>
                                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                                    To fetch real server data, please provide your <span className="font-bold">Facebook Access Token</span> and <span className="font-bold">Ad Account ID</span> in the environment variables. The data below is currently structurally mocked.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <KpiCard 
                        title="Total Ad Spend"
                        value="Rs 45,230"
                        trend="+12%"
                        icon={<Receipt className="w-5 h-5" />}
                        color="text-rose-600"
                        bg="bg-rose-100 dark:bg-rose-900/30"
                    />
                    <KpiCard 
                        title="Link Clicks"
                        value="3,412"
                        trend="+24%"
                        icon={<MousePointerClick className="w-5 h-5" />}
                        color="text-blue-600"
                        bg="bg-blue-100 dark:bg-blue-900/30"
                    />
                    <KpiCard 
                        title="Impressions"
                        value="89,431"
                        trend="+8%"
                        icon={<Eye className="w-5 h-5" />}
                        color="text-purple-600"
                        bg="bg-purple-100 dark:bg-purple-900/30"
                    />
                    <KpiCard 
                        title="Cost per Click (CPC)"
                        value="Rs 13.25"
                        trend="-5%"
                        trendDownGood
                        icon={<BarChart3 className="w-5 h-5" />}
                        color="text-emerald-600"
                        bg="bg-emerald-100 dark:bg-emerald-900/30"
                    />
                    <KpiCard 
                        title="Cost per Purchase"
                        value="Rs 350"
                        trend="-11%"
                        trendDownGood
                        icon={<BadgeDollarSign className="w-5 h-5" />}
                        color="text-amber-600"
                        bg="bg-amber-100 dark:bg-amber-900/30"
                    />
                </div>

                {/* Campaigns List */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Active Campaigns</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-950/50">
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">Campaign Name</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">Status</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">Spend</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">Clicks</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">CPP</th>
                                    <th className="py-4 px-6 text-xs font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">ROAS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                <CampaignRow name="Summer Seed Sale 2024" status="ACTIVE" spend="Rs 12,400" clicks="1,204" cpp="Rs 310" roas="4.2x" />
                                <CampaignRow name="Tomato & Veggie Boost" status="ACTIVE" spend="Rs 8,150" clicks="854" cpp="Rs 452" roas="3.8x" />
                                <CampaignRow name="Retargeting - Cart Abandoners" status="ACTIVE" spend="Rs 4,680" clicks="420" cpp="Rs 125" roas="6.5x" />
                                <CampaignRow name="Brand Awareness - Lahore" status="PAUSED" spend="Rs 20,000" clicks="934" cpp="-" roas="1.2x" />
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

function KpiCard({ title, value, trend, icon, color, bg, trendDownGood = false }: any) {
    const isPositive = trend.startsWith('+');
    const isGood = isPositive ? !trendDownGood : trendDownGood;

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                    isGood 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                }`}>
                    <TrendingUp className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} />
                    {trend}
                </div>
            </div>
            <div>
                <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-1">{title}</h3>
                <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function CampaignRow({ name, status, spend, clicks, cpp, roas }: any) {
    return (
        <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
            <td className="py-4 px-6">
                <p className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{name}</p>
            </td>
            <td className="py-4 px-6">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    status === 'ACTIVE' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                    {status}
                </span>
            </td>
            <td className="py-4 px-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{spend}</td>
            <td className="py-4 px-6 text-sm font-medium text-zinc-700 dark:text-zinc-300">{clicks}</td>
            <td className="py-4 px-6 text-sm font-semibold text-amber-700 dark:text-amber-400">{cpp}</td>
            <td className="py-4 px-6">
                <span className="inline-flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-black text-sm px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50">
                    {roas}
                </span>
            </td>
        </tr>
    );
}

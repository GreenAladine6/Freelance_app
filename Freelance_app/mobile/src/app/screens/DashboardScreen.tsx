import { useEffect, useState } from "react";
import { Bell, Plus, Search, TrendingUp, Clock, CheckCircle2, DollarSign, Briefcase, MessageSquare, BriefcaseIcon } from "lucide-react";
import { useHistory } from "react-router-dom";
import { motion } from "motion/react";
import { BottomNavigation } from "../components/BottomNavigation";
import { PageTransition } from "../components/PageTransition";
import { useRole } from "../context/RoleContext";
import { apiGetMyApplications, ApiApplication } from "../api";

const QUICK_ACTIONS = [
  { label: "Create New Gig", filled: true, path: "/create-gig" },
  { label: "Browse Projects", filled: false, path: "/browse" },
  { label: "My Gigs", filled: false, path: "/gigs" },
  { label: "Update Portfolio", filled: false, path: "/profile" }
];

export function DashboardScreen() {
  const history = useHistory();
  const { userName, accessToken } = useRole();
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    const load = async () => {
      try {
        setLoadingStats(true);
        const data = await apiGetMyApplications(accessToken);
        setApplications(data);
      } catch {}
      finally { setLoadingStats(false); }
    };
    load();
  }, [accessToken]);

  const pending = applications.filter((a) => a.status === "pending").length;
  const accepted = applications.filter((a) => a.status === "accepted").length;

  const STATS = [
    { label: "Active Gigs", value: loadingStats ? "..." : String(accepted), icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending Apps", value: loadingStats ? "..." : String(pending), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total Applied", value: loadingStats ? "..." : String(applications.length), icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Earnings", value: "$0", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" }
  ];

  const RECENT = applications.slice(0, 4).map((a) => ({
    id: a.id,
    text: `Application ${a.status === "pending" ? "pending review" : a.status === "accepted" ? "accepted!" : "rejected"} — Job ${a.job_id.slice(-6)}`,
    time: a.created_at ? new Date(a.created_at).toLocaleDateString() : "",
    icon: a.status === "accepted" ? CheckCircle2 : a.status === "pending" ? Clock : MessageSquare,
    iconColor: a.status === "accepted" ? "text-green-500" : a.status === "pending" ? "text-orange-400" : "text-red-400"
  }));

  return (
    <PageTransition>
      <div className="h-screen bg-[#F5F5F5] flex flex-col max-w-[360px] mx-auto overflow-hidden relative font-['Roboto'] pb-20">
        {/* Top App Bar */}
        <header className="bg-white px-4 py-3 flex items-center justify-between elevation-1 z-10">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => history.push("/profile")}
              className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-[#8B5CF6]/20"
            >
              <img src="https://i.pravatar.cc/150?u=me" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-medium leading-none mb-1">Welcome back,</p>
              <h1 className="text-sm font-bold text-gray-900 leading-none">{userName}</h1>
            </div>
          </div>
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {/* Stats Cards (2x2 Grid) */}
          <section className="grid grid-cols-2 gap-4">
            {STATS.map((stat, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={stat.label}
                className="bg-white p-4 rounded-2xl elevation-8 flex flex-col gap-2"
              >
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-sm font-bold text-gray-900 mb-3 px-1 uppercase tracking-widest">Quick Actions</h2>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => history.push(action.path)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                    action.filled 
                      ? "bg-[#8B5CF6] text-white elevation-4" 
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">My Applications</h2>
              <button onClick={() => history.push("/gigs")} className="text-xs font-bold text-[#8B5CF6]">See All</button>
            </div>
            <div className="bg-white rounded-2xl elevation-2 divide-y overflow-hidden">
              {RECENT.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-xs text-gray-400">No applications yet. Browse gigs to get started!</p>
                  <button onClick={() => history.push("/browse")} className="mt-3 text-xs font-bold text-[#8B5CF6]">Browse Now →</button>
                </div>
              )}
              {RECENT.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className={`shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center ${activity.iconColor}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 font-medium leading-tight mb-0.5 truncate">{activity.text}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <BottomNavigation />
      </div>
    </PageTransition>
  );
}

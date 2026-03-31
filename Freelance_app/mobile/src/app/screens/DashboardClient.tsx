import { useEffect, useState } from "react";
import { Search, Bell, Folder, FileText, Wallet, Plus, Star } from "lucide-react";
import { useHistory } from "react-router-dom";
import { motion } from "motion/react";
import { BottomNavigation } from "../components/BottomNavigation";
import { PageTransition } from "../components/PageTransition";
import { useRole } from "../context/RoleContext";
import { apiGetFreelancers, apiGetMyJobs, ApiUser, ApiJob } from "../api";

const CATEGORIES = ["Design", "Development", "Writing", "Marketing", "Video", "Music", "Business"];

export function DashboardClient() {
  const history = useHistory();
  const { userName, accessToken } = useRole();
  const [freelancers, setFreelancers] = useState<ApiUser[]>([]);
  const [myJobs, setMyJobs] = useState<ApiJob[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingData(true);
        const [fl, jobs] = await Promise.all([
          apiGetFreelancers(),
          accessToken ? apiGetMyJobs(accessToken) : Promise.resolve([]),
        ]);
        setFreelancers(fl.slice(0, 5));
        setMyJobs(jobs);
      } catch {}
      finally { setLoadingData(false); }
    };
    load();
  }, [accessToken]);

  const openJobs = myJobs.filter((j) => j.status === "open").length;
  const inProgressJobs = myJobs.filter((j) => j.status === "in_progress").length;
  const totalApplicationsCount = myJobs.reduce((sum, j) => sum + (j.application_count || 0), 0);

  return (
    <PageTransition>
      <div className="h-screen bg-[#F8F9FA] flex flex-col max-w-[360px] mx-auto overflow-hidden relative font-['Roboto'] pb-20">
        {/* Top App Bar */}
        <header className="bg-white px-4 py-3 flex items-center justify-between elevation-1">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.pravatar.cc/150?u=client" 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-[#8B5CF6]/20 cursor-pointer"
              onClick={() => history.push("/profile-client")}
            />
            <h1 className="text-base font-bold text-gray-900 leading-none">Hi, {userName.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100">
              <Search className="w-6 h-6" />
            </button>
            <div className="relative">
              <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100">
                <Bell className="w-6 h-6" />
              </button>
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pt-4 flex flex-col gap-6">
          {/* Hero Section */}
          <section className="px-4">
            <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-2xl p-6 text-white elevation-4">
              <h2 className="text-xl font-bold mb-1">Find the perfect freelancer</h2>
              <p className="text-sm text-white/80 mb-4">Browse thousands of talented professionals</p>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="What service are you looking for?" 
                  className="w-full bg-white text-gray-900 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-white/50 outline-none"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map((cat) => (
                  <button key={cat} className="whitespace-nowrap bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full text-xs font-bold transition-colors">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Overview */}
          <section>
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
              {[
                { label: "Active Projects", value: loadingData ? "..." : String(openJobs), icon: Folder, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Proposals", value: loadingData ? "..." : String(totalApplicationsCount), icon: FileText, color: "text-orange-500", bg: "bg-orange-50" },
                { label: "In Progress", value: loadingData ? "..." : String(inProgressJobs), icon: Wallet, color: "text-green-500", bg: "bg-green-50" },
              ].map((stat, i) => (
                <div key={i} className="min-w-[140px] bg-white p-4 rounded-2xl elevation-1 flex flex-col gap-2">
                  <div className={`${stat.bg} ${stat.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 leading-tight">{stat.value}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-tight">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended Freelancers */}
          <section className="flex flex-col gap-3">
            <div className="px-4 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recommended</h3>
              <button onClick={() => history.push("/browse")} className="text-xs font-bold text-[#8B5CF6]">See All</button>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2">
              {loadingData && <p className="text-xs text-gray-400 py-2">Loading...</p>}
              {!loadingData && freelancers.length === 0 && <p className="text-xs text-gray-400 py-2">No freelancers yet.</p>}
              {freelancers.map((freelancer, idx) => (
                <div key={freelancer.id} className="min-w-[160px] bg-white p-4 rounded-2xl border border-gray-100 elevation-2 flex flex-col items-center text-center gap-2">
                  <img src={`https://i.pravatar.cc/150?u=${freelancer.id}`} alt={freelancer.full_name || freelancer.username} className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{freelancer.full_name || freelancer.username}</h4>
                    <p className="text-[10px] text-gray-500 font-medium mb-1">{freelancer.skills?.split(",")[0] || "Freelancer"}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] font-bold text-gray-700">5.0</span>
                    </div>
                  </div>
                  {freelancer.hourly_rate && <div className="text-xs font-bold text-[#8B5CF6] mt-1">${freelancer.hourly_rate}/hr</div>}
                </div>
              ))}
            </div>
          </section>

          {/* Popular Services */}
          <section className="px-4 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Popular Services</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "SaaS Design", price: "from $200", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300" },
                { title: "React Mobile App", price: "from $800", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=300" },
              ].map((service, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 elevation-2">
                  <img src={service.img} alt={service.title} className="w-full h-24 object-cover" />
                  <div className="p-3">
                    <h4 className="text-[11px] font-bold text-gray-900 leading-tight mb-0.5">{service.title}</h4>
                    <p className="text-[10px] text-[#8B5CF6] font-bold">{service.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* FAB */}
        <button
          onClick={() => history.push("/create-gig")}
          className="fixed bottom-24 right-6 w-14 h-14 bg-[#8B5CF6] text-white rounded-2xl elevation-6 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-40">
          <Plus className="w-7 h-7" />
        </button>

        <BottomNavigation />
      </div>
    </PageTransition>
  );
}

import { ArrowLeft, Shield, Key, Settings, FileText, CheckCircle, Flag, BarChart3, LogOut } from "lucide-react";
import { useHistory } from "react-router-dom";
import { PageTransition } from "../components/PageTransition";
import { BottomNavigation } from "../components/BottomNavigation";
import { useRole } from "../context/RoleContext";

export function ProfileAdmin() {
  const history = useHistory();
  const { logout } = useRole();

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  return (
    <PageTransition>
      <div className="h-screen bg-[#F5F5F5] flex flex-col max-w-[360px] mx-auto overflow-hidden relative font-['Roboto'] pb-20">
        {/* Header Section */}
        <div className="bg-white px-4 pt-4 pb-8 border-b elevation-1">
           <div className="flex justify-between items-center mb-6">
              <button onClick={() => history.goBack()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-base font-bold text-gray-900">Admin Profile</h1>
              <div className="w-10" /> {/* Spacer */}
           </div>
           
           <div className="flex flex-col items-center">
              <div className="relative">
                <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-20 h-20 rounded-full border-4 border-[#8B5CF6]/10 object-cover" />
                <div className="absolute -bottom-1 -right-1 bg-red-500 p-1.5 rounded-full border-2 border-white shadow-sm">
                   <Shield className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
              <h2 className="mt-3 text-lg font-bold text-gray-900">Sarah Williams</h2>
              <div className="mt-1 flex items-center gap-2">
                 <span className="bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">System Admin</span>
                 <span className="text-[10px] text-gray-400 font-medium">Lvl 4 Permissions</span>
              </div>
           </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
           {/* Admin Info Section */}
           <section className="bg-white rounded-2xl p-4 elevation-1">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Admin Info</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Email</span>
                    <span className="font-bold text-gray-800">sarah.admin@hub.com</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Employee ID</span>
                    <span className="font-bold text-gray-800">#ADM-9421</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Last Login</span>
                    <span className="font-bold text-gray-800">Today, 08:45 AM</span>
                 </div>
              </div>
           </section>

           {/* Statistics Grid */}
           <section className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-2xl elevation-1 flex flex-col items-center text-center gap-1">
                 <CheckCircle className="w-4 h-4 text-green-500" />
                 <p className="text-sm font-bold text-gray-900">1,245</p>
                 <p className="text-[8px] text-gray-500 font-bold uppercase">Validated</p>
              </div>
              <div className="bg-white p-3 rounded-2xl elevation-1 flex flex-col items-center text-center gap-1">
                 <Flag className="w-4 h-4 text-red-500" />
                 <p className="text-sm font-bold text-gray-900">432</p>
                 <p className="text-[8px] text-gray-500 font-bold uppercase">Moderated</p>
              </div>
              <div className="bg-white p-3 rounded-2xl elevation-1 flex flex-col items-center text-center gap-1">
                 <BarChart3 className="w-4 h-4 text-[#8B5CF6]" />
                 <p className="text-sm font-bold text-gray-900">98%</p>
                 <p className="text-[8px] text-gray-500 font-bold uppercase">Efficiency</p>
              </div>
           </section>

           {/* Quick Actions List */}
           <section className="bg-white rounded-2xl overflow-hidden elevation-1">
              <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                       <Key className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Change Password</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F3E8FF] text-[#8B5CF6] rounded-lg">
                       <Settings className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Admin Settings</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                       <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">View Audit Log</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
           </section>

           {/* Activity Log Preview */}
           <section className="bg-white rounded-2xl p-4 elevation-1">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Activity Log</h3>
              <div className="space-y-4">
                 {[
                   { action: "Updated security protocols", time: "2h ago" },
                   { action: "Approved 15 new freelancer applications", time: "4h ago" },
                 ].map((log, i) => (
                   <div key={i} className="flex gap-3">
                      <div className="w-1 h-full bg-[#8B5CF6] rounded-full" />
                      <div>
                        <p className="text-xs text-gray-800 font-medium leading-tight">{log.action}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{log.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           <div className="pt-4">
              <button 
                onClick={handleLogout}
                className="w-full bg-white text-red-500 border border-red-100 py-3 rounded-2xl text-sm font-bold hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                 <LogOut className="w-4 h-4" />
                 Log Out of System
              </button>
           </div>
        </main>

        <BottomNavigation />
      </div>
    </PageTransition>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
  </svg>
);

import { useEffect, useState } from "react";
import { ArrowLeft, Edit, MapPin, Calendar, Clock, DollarSign, Briefcase, Users, Star, CheckCircle, LogOut, Settings, HelpCircle, ChevronRight as ChevronRightIcon, X } from "lucide-react";
import { useHistory } from "react-router-dom";
import { BottomNavigation } from "../components/BottomNavigation";
import { PageTransition } from "../components/PageTransition";
import { useRole } from "../context/RoleContext";
import { apiGetProfile, apiUpdateProfile, apiGetMyJobs, ApiUser, ApiJob } from "../api";

export function ProfileClient() {
  const history = useHistory();
  const { userName, logout, accessToken, user: ctxUser } = useRole();
  const [profileData, setProfileData] = useState<ApiUser | null>(null);
  const [myJobs, setMyJobs] = useState<ApiJob[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Edit modal
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    const load = async () => {
      try {
        setLoadingData(true);
        const [profile, jobs] = await Promise.all([
          apiGetProfile(accessToken),
          apiGetMyJobs(accessToken),
        ]);
        setProfileData(profile);
        setMyJobs(jobs);
      } catch {}
      finally { setLoadingData(false); }
    };
    load();
  }, [accessToken]);

  const openEdit = () => {
    setEditName(profileData?.full_name || ctxUser?.full_name || userName || "");
    setEditBio(profileData?.bio || "");
    setSaveMsg("");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!accessToken) return;
    try {
      setSaving(true);
      const updated = await apiUpdateProfile(accessToken, {
        full_name: editName.trim() || undefined,
        bio: editBio.trim() || undefined,
      });
      setProfileData(updated.user);
      setSaveMsg("Profile saved!");
      setTimeout(() => { setEditing(false); setSaveMsg(""); }, 1200);
    } catch (err: any) {
      setSaveMsg(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); history.push("/login"); };

  const displayName = profileData?.full_name || ctxUser?.full_name || userName;
  const aboutText = profileData?.bio || "Tech entrepreneur looking for creative designers and developers.";
  const openJobs = myJobs.filter((j) => j.status === "open");
  const inProgressJobs = myJobs.filter((j) => j.status === "in_progress");
  const totalApplications = myJobs.reduce((s, j) => s + (j.application_count || 0), 0);

  return (
    <PageTransition>
      <div className="h-screen bg-[#F8F9FA] flex flex-col max-w-[360px] mx-auto overflow-hidden relative font-['Roboto'] pb-20">
        {/* Header */}
        <div className="bg-white px-4 pt-4 pb-12 elevation-1 relative">
           <div className="flex justify-between items-center mb-6">
              <button onClick={() => history.goBack()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button onClick={openEdit} className="flex items-center gap-2 border border-gray-200 px-4 py-1.5 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all">
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </button>
           </div>
           
           <div className="flex flex-col items-center">
              <div className="relative">
                <img src="https://i.pravatar.cc/150?u=client" alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
                <div className="absolute bottom-1 right-1 bg-blue-500 p-1.5 rounded-full border-2 border-white shadow-sm">
                   <CheckCircle className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">{displayName}</h2>
              <div className="mt-1.5 flex items-center gap-2">
                 <span className="bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">Client</span>
                 <span className="text-[11px] text-gray-400 font-medium">{profileData?.created_at ? `Member since ${new Date(profileData.created_at).getFullYear()}` : "Member"}</span>
              </div>
           </div>
        </div>

        <main className="flex-1 overflow-y-auto px-4 -mt-6 z-10 space-y-4">
           {/* About Section */}
           <section className="bg-white rounded-2xl p-4 elevation-2">
              <h3 className="text-sm font-bold text-gray-900 mb-2">About</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{aboutText}</p>
           </section>

           {/* Hiring Preferences */}
           <section className="bg-white rounded-2xl p-4 elevation-2">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Hiring Preferences</h3>
              <div className="flex flex-wrap gap-2">
                 {["UI/UX Design", "React", "Node.js", "Brand Strategy", "SaaS"].map((tag) => (
                   <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-full">
                     {tag}
                   </span>
                 ))}
              </div>
           </section>

           {/* Statistics Grid */}
           <section className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl elevation-2 flex flex-col items-center text-center gap-1">
                 <Briefcase className="w-5 h-5 text-[#8B5CF6] mb-1" />
                 <p className="text-lg font-bold text-gray-900">{loadingData ? "..." : String(myJobs.length)}</p>
                 <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Projects Posted</p>
              </div>
              <div className="bg-white p-4 rounded-2xl elevation-2 flex flex-col items-center text-center gap-1">
                 <Users className="w-5 h-5 text-blue-500 mb-1" />
                 <p className="text-lg font-bold text-gray-900">{loadingData ? "..." : String(inProgressJobs.length)}</p>
                 <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">In Progress</p>
              </div>
              <div className="bg-white p-4 rounded-2xl elevation-2 flex flex-col items-center text-center gap-1">
                 <DollarSign className="w-5 h-5 text-green-500 mb-1" />
                 <p className="text-lg font-bold text-gray-900">{loadingData ? "..." : String(totalApplications)}</p>
                 <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Total Proposals</p>
              </div>
              <div className="bg-white p-4 rounded-2xl elevation-2 flex flex-col items-center text-center gap-1">
                 <Star className="w-5 h-5 text-yellow-500 mb-1" />
                 <p className="text-lg font-bold text-gray-900">{loadingData ? "..." : String(openJobs.length)}</p>
                 <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Open Jobs</p>
              </div>
           </section>

           {/* Active Projects List */}
           <section className="bg-white rounded-2xl p-4 elevation-2 pb-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-900">My Jobs</h3>
                <button onClick={() => history.push("/gigs")} className="text-xs font-bold text-[#8B5CF6]">View All</button>
              </div>
              <div className="space-y-4">
                {loadingData && <p className="text-xs text-gray-400">Loading...</p>}
                {!loadingData && myJobs.length === 0 && (
                  <p className="text-xs text-gray-400 pb-3">No jobs posted yet.</p>
                )}
                {myJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{job.title}</p>
                      <p className={`text-[10px] font-bold ${job.status === "open" ? "text-green-500" : job.status === "in_progress" ? "text-blue-500" : "text-gray-400"}`}>
                        {job.status === "in_progress" ? "In Progress" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        {job.application_count !== undefined && ` · ${job.application_count} proposals`}
                      </p>
                    </div>
                    <button onClick={() => history.push("/gigs")} className="p-1.5 rounded-full hover:bg-gray-50">
                       <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
           </section>

           {/* Account Actions Section */}
           <section className="bg-white rounded-2xl overflow-hidden elevation-2 mb-4">
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                       <Settings className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Account Settings</span>
                 </div>
                 <ChevronRightIcon className="w-4 h-4 text-gray-300" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-[#8B5CF6] rounded-lg">
                       <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Help & Support</span>
                 </div>
                 <ChevronRightIcon className="w-4 h-4 text-gray-300" />
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-red-50 active:bg-red-100 transition-colors"
              >
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                       <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-red-500">Log Out</span>
                 </div>
                 <ChevronRightIcon className="w-4 h-4 text-red-300" />
              </button>
           </section>
        </main>

        <BottomNavigation />

        {/* Edit Profile Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setEditing(false)}>
            <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 pb-10 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-gray-900">Edit Profile</h3>
                <button onClick={() => setEditing(false)} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Full Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Bio</label>
                  <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} placeholder="Describe yourself..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30" />
                </div>
              </div>
              {saveMsg && <p className={`text-xs font-semibold ${saveMsg.includes("saved") ? "text-green-600" : "text-red-500"}`}>{saveMsg}</p>}
              <button onClick={handleSave} disabled={saving} className="w-full bg-[#8B5CF6] text-white font-bold py-3 rounded-2xl text-sm active:scale-95 transition-all disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
  </svg>
);

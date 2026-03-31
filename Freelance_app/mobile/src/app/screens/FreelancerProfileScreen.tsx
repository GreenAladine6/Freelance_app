import { useEffect, useState } from "react";
import { Edit, Upload, Plus, ArrowLeft, Star, Download, ChevronRight, Briefcase, LogOut, Settings, HelpCircle, Bell } from "lucide-react";
import { useHistory } from "react-router-dom";
import { BottomNavigation } from "../components/BottomNavigation";
import { PageTransition } from "../components/PageTransition";
import { useRole } from "../context/RoleContext";
import { apiGetProfile, apiUpdateProfile, ApiUser } from "../api";

export function FreelancerProfileScreen() {
  const history = useHistory();
  const { userName, logout, accessToken, user: ctxUser } = useRole();
  const [profileData, setProfileData] = useState<ApiUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Edit modal
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editRate, setEditRate] = useState("");
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    const load = async () => {
      try {
        setLoadingProfile(true);
        const data = await apiGetProfile(accessToken);
        setProfileData(data);
      } catch {}
      finally { setLoadingProfile(false); }
    };
    load();
  }, [accessToken]);

  const openEdit = () => {
    const p = profileData;
    setEditName(p?.full_name || ctxUser?.full_name || userName || "");
    setEditBio(p?.bio || "");
    setEditSkills(p?.skills || "");
    setEditRate(p?.hourly_rate ? String(p.hourly_rate) : "");
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
        skills: editSkills.trim() || undefined,
        hourly_rate: editRate ? parseFloat(editRate) : undefined,
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
  const bio = profileData?.bio || "Expert UI/UX Designer & Full-stack Developer with over 5 years of experience.";
  const skills = profileData?.skills
    ? profileData.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : ["React", "TypeScript", "Node.js"];
  const rate = profileData?.hourly_rate ? `$${profileData.hourly_rate}/hr` : null;

  const portfolioItems = [
    { id: 1, title: "E-commerce Website", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300" },
    { id: 2, title: "Mobile App Design", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=300" },
    { id: 3, title: "Dashboard UI", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300" },
    { id: 4, title: "Landing Page", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=300" },
  ];

  return (
    <PageTransition>
      <div className="h-screen bg-[#F5F5F5] flex flex-col max-w-[360px] mx-auto pb-20 overflow-hidden font-['Roboto'] relative">
        {/* Header Section */}
        <div className="bg-white px-4 pt-4 pb-12 relative border-b border-gray-100 elevation-1">
           <div className="flex justify-between items-center mb-6">
              <button onClick={() => history.goBack()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                 <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="w-10" />
           </div>

           <div className="flex flex-col items-center">
              <div className="relative">
                 <img src="https://i.pravatar.cc/150?u=freelancer" alt="Profile" className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-lg object-cover" />
                 <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white shadow-sm" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">{displayName}</h2>
              <div className="mt-1 flex items-center gap-2">
                 <span className="bg-purple-100 text-[#8B5CF6] text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">Freelancer</span>
                 <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-[11px] font-bold text-gray-700">4.9</span>
                    <span className="text-[11px] text-gray-400 font-medium">(124 reviews)</span>
                 </div>
              </div>
              {rate && <p className="mt-1 text-xs text-[#8B5CF6] font-bold">{rate}</p>}
              <p className="mt-1 text-xs text-green-600 font-bold">Available for hire</p>
           </div>
        </div>

        <main className="flex-1 overflow-y-auto px-4 -mt-6 z-10 space-y-4">
           {/* About Me Section */}
           <section className="bg-white rounded-2xl p-4 elevation-2">
              <h3 className="text-sm font-bold text-gray-900 mb-2">About Me</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{bio}</p>
           </section>

           {/* Skills Section */}
           <section className="bg-white rounded-2xl p-4 elevation-2">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                 {skills.map((skill) => (
                   <span key={skill} className="bg-purple-50 text-[#8B5CF6] text-[10px] font-bold px-3 py-1.5 rounded-full border border-purple-100">
                      {skill}
                   </span>
                 ))}
              </div>
           </section>

           {/* Portfolio Section */}
           <section className="bg-white rounded-2xl p-4 elevation-2">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-gray-900">Portfolio</h3>
                 <button className="text-[10px] font-bold text-[#8B5CF6]">See All</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 {portfolioItems.map((item) => (
                    <div key={item.id} className="aspect-video rounded-xl overflow-hidden relative group cursor-pointer border border-gray-100">
                       <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[9px] text-white font-bold leading-tight truncate">{item.title}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </section>

           {/* Resume/CV Section */}
           <section className="bg-white rounded-2xl p-4 elevation-2">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Resume/CV</h3>
              <button className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-xl hover:bg-gray-100 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                       <FileTextIcon className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    <div className="text-left">
                       <p className="text-[11px] font-bold text-gray-800">My_Professional_CV.pdf</p>
                       <p className="text-[9px] text-gray-400 font-medium">Updated 2 weeks ago</p>
                    </div>
                 </div>
                 <Download className="w-4 h-4 text-gray-400" />
              </button>
           </section>

           {/* Statistics Section */}
           <section className="bg-white rounded-2xl p-4 elevation-2 pb-1">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                 {[
                   { label: "Total Gigs", value: "24", icon: Briefcase },
                   { label: "Completed Projects", value: "156", icon: CheckCircle2Icon },
                   { label: "Response Time", value: "2 hours", icon: ClockIcon },
                   { label: "Member Since", value: "June 2021", icon: CalendarIcon },
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-3">
                      <div className="flex items-center gap-3">
                         <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
                            <stat.icon className="w-4 h-4" />
                         </div>
                         <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">{stat.value}</span>
                   </div>
                 ))}
              </div>
           </section>

           {/* Account Actions Section */}
           <section className="bg-white rounded-2xl overflow-hidden elevation-2 mb-4">
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-[#8B5CF6] rounded-lg">
                       <Settings className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Account Settings</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                       <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Help & Support</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-gray-300" />
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
                 <ChevronRight className="w-4 h-4 text-red-300" />
              </button>
           </section>
        </main>

        {/* FAB - Edit Profile */}
        <button
          onClick={openEdit}
          className="fixed bottom-24 right-6 w-14 h-14 bg-[#8B5CF6] text-white rounded-2xl elevation-8 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-40">
           <Edit className="w-6 h-6" />
        </button>

        {/* Edit Profile Modal */}
        {editing && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditing(false)} />
            <div className="fixed bottom-0 left-0 right-0 max-w-[360px] mx-auto bg-white rounded-t-3xl z-50 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-5">Edit Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Full Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8B5CF6]" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Bio</label>
                  <textarea rows={3} value={editBio} onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8B5CF6] resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Skills (comma-separated)</label>
                  <input value={editSkills} onChange={(e) => setEditSkills(e.target.value)}
                    placeholder="React, TypeScript, Figma"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8B5CF6]" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Hourly Rate ($)</label>
                  <input type="number" value={editRate} onChange={(e) => setEditRate(e.target.value)}
                    placeholder="45"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8B5CF6]" />
                </div>
                {saveMsg && <p className={`text-xs font-medium ${ saveMsg.includes("Failed") ? "text-red-500" : "text-green-600"}`}>{saveMsg}</p>}
                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3.5 bg-[#8B5CF6] text-white rounded-full font-bold text-sm disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </>
        )}

        <BottomNavigation />
      </div>
    </PageTransition>
  );
}

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckCircle2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

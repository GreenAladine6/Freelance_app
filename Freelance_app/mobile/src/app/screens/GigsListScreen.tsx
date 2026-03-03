import { useEffect, useMemo, useState } from "react";
import { Search, Plus, X, Briefcase, Clock, DollarSign, User, CheckCircle, XCircle } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";
import { PageTransition } from "../components/PageTransition";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  apiGetJobs,
  apiApplyForJob,
  apiGetMyJobs,
  apiGetJobApplications,
  apiAcceptApplication,
  apiRejectApplication,
  ApiJob,
  ApiApplication,
} from "../api";
import { useRole } from "../context/RoleContext";

export function GigsListScreen() {
  const history = useHistory();
  const { role, accessToken, user } = useRole();
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "mine">(
    role === "client" ? "mine" : "all"
  );
  const [selectedJob, setSelectedJob] = useState<ApiJob | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const isClient = role === "client";

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      let data: ApiJob[];
      if (activeTab === "mine" && isClient && accessToken) {
        data = await apiGetMyJobs(accessToken);
      } else {
        data = await apiGetJobs({ status: "open" });
      }
      setJobs(data);
    } catch (err: any) {
      setError(err.message || "Failed to load gigs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, [activeTab]);

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const term = search.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title?.toLowerCase().includes(term) ||
        job.description?.toLowerCase().includes(term) ||
        job.skills_required?.toLowerCase().includes(term) ||
        job.client_name?.toLowerCase().includes(term)
    );
  }, [jobs, search]);

  const openJobModal = async (job: ApiJob) => {
    setSelectedJob(job);
    setCoverLetter("");
    setProposedRate("");
    setApplyMsg(null);
    setApplications([]);
    if (isClient && accessToken && job.client_id === user?.id) {
      try {
        setAppsLoading(true);
        const apps = await apiGetJobApplications(accessToken, job.id);
        setApplications(apps);
      } catch {}
      finally { setAppsLoading(false); }
    }
  };

  const handleApply = async () => {
    if (!coverLetter.trim()) { setApplyMsg({ ok: false, text: "Please write a cover letter." }); return; }
    if (!accessToken) { history.push("/login"); return; }
    try {
      setApplying(true);
      setApplyMsg(null);
      await apiApplyForJob(accessToken, selectedJob!.id, {
        cover_letter: coverLetter.trim(),
        proposed_rate: proposedRate ? parseFloat(proposedRate) : undefined,
      });
      setApplyMsg({ ok: true, text: "Application submitted successfully!" });
      setCoverLetter("");
      setProposedRate("");
    } catch (err: any) {
      setApplyMsg({ ok: false, text: err.message || "Failed to apply." });
    } finally {
      setApplying(false);
    }
  };

  const handleAccept = async (appId: string) => {
    if (!accessToken) return;
    try {
      await apiAcceptApplication(accessToken, appId);
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: "accepted" as const } : a)));
    } catch (err: any) { alert(err.message || "Failed to accept"); }
  };

  const handleReject = async (appId: string) => {
    if (!accessToken) return;
    try {
      await apiRejectApplication(accessToken, appId);
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: "rejected" as const } : a)));
    } catch (err: any) { alert(err.message || "Failed to reject"); }
  };

  const isOwnJob = (job: ApiJob) => isClient && job.client_id === user?.id;

  return (
    <PageTransition>
      <div className="h-screen bg-gray-50 flex flex-col max-w-[360px] mx-auto overflow-hidden pb-20">
        <div className="bg-white border-b border-gray-200">
          <div className="h-14 flex items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-gray-900">{isClient ? "My Projects" : "Browse Gigs"}</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full"><Search className="w-5 h-5 text-gray-700" /></button>
          </div>
          {isClient && (
            <div className="flex px-4 border-t border-gray-100">
              {(["mine", "all"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-bold relative transition-colors ${activeTab === tab ? "text-[#8B5CF6]" : "text-gray-500"}`}>
                  {tab === "mine" ? "My Jobs" : "All Jobs"}
                  {activeTab === tab && (
                    <motion.div layoutId="gigTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6]" />
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 h-10 px-4 bg-gray-100 rounded-xl">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input type="text" placeholder="Search gigs..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
          {loading && <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin" /></div>}
          {error && !loading && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{error}</div>}
          {!loading && !error && filteredJobs.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <Briefcase className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm font-bold text-gray-500">No gigs found</p>
              {isClient && <button onClick={() => history.push("/create-gig")} className="mt-4 px-6 py-2.5 bg-[#8B5CF6] text-white rounded-full text-xs font-bold">Post a Job</button>}
            </div>
          )}
          {!loading && !error && filteredJobs.map((job) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => openJobModal(job)}
              className="bg-white rounded-2xl p-4 elevation-1 cursor-pointer active:scale-[0.98] transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {(job.client_name || "J")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-500 font-medium">{job.client_name || "Client"}</p>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{job.title}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${job.status === "open" ? "bg-green-50 text-green-600" : job.status === "in_progress" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                  {job.status === "in_progress" ? "In Progress" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{job.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {job.duration && <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{job.duration}</span></div>}
                  {job.application_count !== undefined && <div className="flex items-center gap-1"><User className="w-3 h-3" /><span>{job.application_count} applied</span></div>}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span className="text-sm font-bold text-[#8B5CF6]">{typeof job.budget === "number" ? `$${job.budget}` : job.budget || "N/A"}</span>
                </div>
              </div>
              {job.skills_required && (
                <div className="mt-3 flex gap-1.5 flex-wrap">
                  {job.skills_required.split(",").slice(0, 3).map((s) => (
                    <span key={s} className="bg-purple-50 text-[#8B5CF6] text-[10px] font-bold px-2 py-0.5 rounded-full">{s.trim()}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {isClient && (
          <button onClick={() => history.push("/create-gig")}
            className="fixed bottom-24 right-6 w-14 h-14 bg-[#8B5CF6] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#7C3AED] transition-colors elevation-4 z-40">
            <Plus className="w-6 h-6" />
          </button>
        )}

        <BottomNavigation />

        <AnimatePresence>
          {selectedJob && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedJob(null)} className="fixed inset-0 bg-black/50 z-40" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="fixed bottom-0 left-0 right-0 max-w-[360px] mx-auto bg-white rounded-t-3xl z-50 flex flex-col max-h-[88vh]">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 shrink-0" />
                <div className="px-5 pt-3 pb-3 flex items-start justify-between shrink-0">
                  <div className="flex-1 pr-4">
                    <h2 className="text-base font-bold text-gray-900 leading-tight">{selectedJob.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedJob.client_name || "Client"}</p>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="p-1.5 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="flex gap-3 px-5 mb-3 shrink-0 flex-wrap">
                  <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                    <DollarSign className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-bold text-green-600">{typeof selectedJob.budget === "number" ? `$${selectedJob.budget}` : selectedJob.budget}</span>
                  </div>
                  {selectedJob.duration && (
                    <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span className="text-xs font-bold text-blue-500">{selectedJob.duration}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto px-5 pb-8 no-scrollbar">
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{selectedJob.description}</p>
                  {selectedJob.skills_required && (
                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-700 mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.skills_required.split(",").map((s) => (
                          <span key={s} className="bg-purple-50 text-[#8B5CF6] text-[11px] font-bold px-3 py-1 rounded-full border border-purple-100">{s.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FREELANCER: Apply form */}
                  {!isClient && selectedJob.status === "open" && (
                    <div className="mt-2">
                      <p className="text-sm font-bold text-gray-900 mb-3">Apply for this Job</p>
                      {applyMsg && (
                        <div className={`mb-3 p-3 rounded-xl text-xs font-medium ${applyMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{applyMsg.text}</div>
                      )}
                      {!applyMsg?.ok && (
                        <>
                          <div className="mb-3">
                            <label className="text-xs font-bold text-gray-600 block mb-1.5">Cover Letter <span className="text-red-500">*</span></label>
                            <textarea rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                              placeholder="Explain why you're the perfect fit for this job..."
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 resize-none transition-all" />
                          </div>
                          <div className="mb-4">
                            <label className="text-xs font-bold text-gray-600 block mb-1.5">Your Rate ($/hr) <span className="text-gray-400 font-normal"> optional</span></label>
                            <input type="number" value={proposedRate} onChange={(e) => setProposedRate(e.target.value)} placeholder="e.g. 50"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all" />
                          </div>
                          <button onClick={handleApply} disabled={applying}
                            className="w-full py-3.5 bg-[#8B5CF6] text-white rounded-full font-bold text-sm disabled:opacity-60 hover:bg-[#7C3AED] transition-colors active:scale-95">
                            {applying ? "Submitting..." : "Submit Application"}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* CLIENT: View applications for own jobs */}
                  {isOwnJob(selectedJob) && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-gray-900">Applications</p>
                        <span className="text-xs text-gray-500 font-medium">{applications.length} total</span>
                      </div>
                      {appsLoading && <div className="flex justify-center py-6"><div className="w-6 h-6 border-4 border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin" /></div>}
                      {!appsLoading && applications.length === 0 && <div className="bg-gray-50 rounded-xl p-6 text-center"><p className="text-sm text-gray-500">No applications yet.</p></div>}
                      {!appsLoading && applications.map((app) => (
                        <div key={app.id} className="bg-gray-50 rounded-xl p-4 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">
                                {(app.freelancer_name || "F")[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900">{app.freelancer_name || "Freelancer"}</p>
                                {app.proposed_rate && <p className="text-[10px] text-gray-500">${app.proposed_rate}/hr proposed</p>}
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${app.status === "accepted" ? "bg-green-100 text-green-700" : app.status === "rejected" ? "bg-red-100 text-red-600" : "bg-yellow-50 text-yellow-700"}`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-3">{app.cover_letter}</p>
                          {app.status === "pending" && (
                            <div className="flex gap-2">
                              <button onClick={() => handleAccept(app.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white rounded-full text-xs font-bold hover:bg-green-600 transition-colors">
                                <CheckCircle className="w-3.5 h-3.5" />Accept
                              </button>
                              <button onClick={() => handleReject(app.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-100 text-red-600 rounded-full text-xs font-bold hover:bg-red-200 transition-colors">
                                <XCircle className="w-3.5 h-3.5" />Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {isClient && !isOwnJob(selectedJob) && <p className="text-xs text-gray-400 text-center py-4">This job is posted by another client.</p>}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

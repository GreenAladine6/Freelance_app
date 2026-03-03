import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Search, Bookmark, Star, LogIn, MapPin, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { PageTransition } from "../components/PageTransition";

const RECOMMENDED = [
  {
    id: 1,
    title: "Modern SaaS Website Design",
    freelancer: "Alex Chen",
    avatar: "https://i.pravatar.cc/150?u=alex",
    rating: 4.9,
    price: "$250",
    image: "https://images.unsplash.com/photo-1710799885122-428e63eff691?q=80&w=400"
  },
  {
    id: 2,
    title: "Mobile App UX Audit",
    freelancer: "Sarah Miller",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    rating: 4.8,
    price: "$180",
    image: "https://images.unsplash.com/photo-1554260570-83dc2f46ef79?q=80&w=400"
  }
];

const POPULAR = [
  {
    id: 3,
    title: "Custom Logo Design & Branding",
    freelancer: "David Wolf",
    avatar: "https://i.pravatar.cc/150?u=david",
    rating: 5.0,
    price: "$120",
    image: "https://images.unsplash.com/photo-1713616147761-c126f8009c6f?q=80&w=400"
  },
  {
    id: 4,
    title: "Python Data Visualization",
    freelancer: "Emma Watson",
    avatar: "https://i.pravatar.cc/150?u=emma",
    rating: 4.7,
    price: "$300",
    image: "https://images.unsplash.com/photo-1551288049-bbbda5366fd9?q=80&w=400"
  }
];

const FREELANCERS = [
  { id: 1, name: "Alex Chen", specialty: "UI/UX Designer", rating: 4.9, rate: "$45/hr", reviews: 124, location: "Paris, FR", avatar: "https://i.pravatar.cc/150?u=alex", verified: true, skills: ["Figma", "React", "Tailwind"] },
  { id: 2, name: "Sarah Miller", specialty: "React Developer", rating: 5.0, rate: "$60/hr", reviews: 89, location: "New York, US", avatar: "https://i.pravatar.cc/150?u=sarah", verified: true, skills: ["React", "TypeScript", "Node.js"] },
  { id: 3, name: "David Wolf", specialty: "Brand Strategist", rating: 4.8, rate: "$55/hr", reviews: 67, location: "Berlin, DE", avatar: "https://i.pravatar.cc/150?u=david", verified: false, skills: ["Branding", "Marketing", "Adobe"] },
  { id: 4, name: "Emma Watson", specialty: "Data Scientist", rating: 4.7, rate: "$70/hr", reviews: 45, location: "London, UK", avatar: "https://i.pravatar.cc/150?u=emma", verified: true, skills: ["Python", "ML", "Pandas"] },
];

const PROJECTS = [
  { id: 1, title: "E-commerce Website Redesign", client: "TechCorp Inc.", budget: "$1,200", deadline: "2 weeks", skills: ["React", "UI/UX", "Figma"], proposals: 8, avatar: "https://i.pravatar.cc/150?u=client1" },
  { id: 2, title: "Mobile App for Food Delivery", client: "FoodieStartup", budget: "$3,500", deadline: "4 weeks", skills: ["React Native", "Node.js", "MongoDB"], proposals: 14, avatar: "https://i.pravatar.cc/150?u=client2" },
  { id: 3, title: "Brand Identity & Logo Package", client: "Startup Hub", budget: "$450", deadline: "1 week", skills: ["Illustrator", "Branding", "Design"], proposals: 5, avatar: "https://i.pravatar.cc/150?u=client3" },
  { id: 4, title: "Python Data Analysis Dashboard", client: "DataViz Co.", budget: "$800", deadline: "3 weeks", skills: ["Python", "Dashboard", "Analytics"], proposals: 11, avatar: "https://i.pravatar.cc/150?u=client4" },
];

export function BrowseScreen() {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState("Services");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleInteraction = () => {
    setShowLoginPrompt(true);
  };

  return (
    <PageTransition>
      <div className="h-screen bg-[#F5F5F5] flex flex-col max-w-[360px] mx-auto overflow-hidden relative font-['Roboto']">
      {/* Top App Bar */}
      <header className="bg-white px-4 py-3 flex items-center justify-between elevation-1 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center">
            <span className="text-white font-bold text-xs">FH</span>
          </div>
          <span className="text-[#8B5CF6] font-bold text-lg">FreelanceHub</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600">
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => history.push("/login")}
            className="text-[#8B5CF6] font-medium px-2 py-1"
          >
            Login
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b flex px-4">
        {["Services", "Freelancers", "Projects"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab ? "text-[#8B5CF6]" : "text-gray-500"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">

        {/* ===== SERVICES TAB ===== */}
        {activeTab === "Services" && (
          <>
            <section className="py-6">
              <h2 className="px-4 text-base font-semibold text-gray-900 mb-4">Recommended for you</h2>
              <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
                {RECOMMENDED.map((item) => (
                  <div 
                    key={item.id} 
                    className="min-w-[240px] bg-white rounded-xl overflow-hidden elevation-1 flex flex-col cursor-pointer"
                    onClick={handleInteraction}
                  >
                    <div className="h-32 relative">
                      <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-600">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">{item.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <img src={item.avatar} alt="" className="w-5 h-5 rounded-full" />
                        <span className="text-xs text-gray-500">{item.freelancer}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-medium">{item.rating}</span>
                        </div>
                        <span className="text-[#8B5CF6] font-bold text-sm">From {item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="px-4 pb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Popular Services</h2>
              <div className="flex flex-col gap-4">
                {POPULAR.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-xl p-3 elevation-1 flex gap-3 cursor-pointer"
                    onClick={handleInteraction}
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                      <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                        <span className="text-xs text-gray-500">{item.freelancer}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-medium">{item.rating}</span>
                        </div>
                        <span className="text-[#8B5CF6] font-bold text-sm">{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ===== FREELANCERS TAB ===== */}
        {activeTab === "Freelancers" && (
          <section className="px-4 py-4 flex flex-col gap-3">
            <p className="text-xs text-gray-500 font-medium">{FREELANCERS.length} freelancers available</p>
            {FREELANCERS.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl p-4 elevation-2 cursor-pointer"
                onClick={handleInteraction}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <img src={f.avatar} alt={f.name} className="w-14 h-14 rounded-full object-cover border-2 border-white elevation-1" />
                    {f.verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-[#8B5CF6] rounded-full p-0.5 border-2 border-white">
                        <CheckCircle className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-gray-900">{f.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500">{f.specialty}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] text-gray-400">{f.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#8B5CF6]">{f.rate}</p>
                    <div className="flex items-center justify-end gap-0.5 mt-0.5">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-gray-700">{f.rating}</span>
                      <span className="text-[10px] text-gray-400">({f.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {f.skills.map((skill) => (
                    <span key={skill} className="bg-purple-50 text-[#8B5CF6] text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-100">
                      {skill}
                    </span>
                  ))}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleInteraction(); }}
                  className="mt-3 w-full py-2 bg-[#8B5CF6] text-white text-xs font-bold rounded-xl hover:bg-[#7C3AED] transition-colors active:scale-95"
                >
                  View Profile
                </button>
              </motion.div>
            ))}
          </section>
        )}

        {/* ===== PROJECTS TAB ===== */}
        {activeTab === "Projects" && (
          <section className="px-4 py-4 flex flex-col gap-3">
            <p className="text-xs text-gray-500 font-medium">{PROJECTS.length} open projects</p>
            {PROJECTS.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl p-4 elevation-2 cursor-pointer"
                onClick={handleInteraction}
              >
                <div className="flex items-start gap-3 mb-3">
                  <img src={p.avatar} alt={p.client} className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 leading-tight mb-0.5">{p.title}</h3>
                    <p className="text-xs text-gray-500">{p.client}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-green-600">{p.budget}</span>
                    <span className="text-gray-400">budget</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{p.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">{p.proposals} proposals</span>
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap mb-3">
                  {p.skills.map((skill) => (
                    <span key={skill} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleInteraction(); }}
                  className="w-full py-2 border-2 border-[#8B5CF6] text-[#8B5CF6] text-xs font-bold rounded-xl hover:bg-[#8B5CF6] hover:text-white transition-all active:scale-95"
                >
                  Apply Now
                </button>
              </motion.div>
            ))}
          </section>
        )}

      </main>

      {/* Floating Banner */}
      <div className="fixed bottom-4 left-4 right-4 max-w-[328px] mx-auto z-20">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-[#1F2937] text-white p-4 rounded-2xl flex items-center justify-between elevation-4"
        >
          <div className="flex-1">
            <p className="text-sm font-medium">Unlock full features</p>
            <p className="text-[10px] text-gray-400">Save projects, chat, and more</p>
          </div>
          <button 
            onClick={() => history.push("/signup")}
            className="bg-[#8B5CF6] text-white px-4 py-2 rounded-full text-xs font-bold"
          >
            Sign Up
          </button>
        </motion.div>
      </div>

      {/* Login Prompt Modal/Bottom Sheet */}
      <AnimatePresence>
        {showLoginPrompt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginPrompt(false)}
              className="fixed inset-0 bg-black/50 z-30"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-[360px] mx-auto bg-white rounded-t-3xl p-6 z-40"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-4">
                  <LogIn className="w-8 h-8 text-[#8B5CF6]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Join FreelanceHub to continue</h2>
                <p className="text-sm text-gray-500">Create an account or sign in to access this feature</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => history.push("/signup")}
                  className="w-full py-3.5 bg-[#8B5CF6] text-white rounded-full font-bold elevation-1"
                >
                  Create Account
                </button>
                <button
                  onClick={() => history.push("/login")}
                  className="w-full py-3.5 border border-gray-300 text-gray-700 rounded-full font-bold"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full py-2 text-gray-500 font-medium text-sm mt-2"
                >
                  Continue as guest
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </PageTransition>
  );
}

import { Search, Plus, Archive, Trash2, MoreVertical, MessageSquare, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { BottomNavigation } from "../components/BottomNavigation";
import { PageTransition } from "../components/PageTransition";
import { useRole } from "../context/RoleContext";

const CONVERSATIONS = [
  {
    id: 1,
    name: "Alex Chen",
    avatar: "https://i.pravatar.cc/150?u=alex",
    lastMessage: "I've reviewed the design concepts and they look amazing!",
    time: "5m ago",
    unread: 2,
    online: true,
    role: "Freelancer",
    specialty: "UI/UX Designer",
    project: "Logo Design Project",
    priority: "low"
  },
  {
    id: 2,
    name: "Sarah Miller",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    lastMessage: "Can we schedule a call for tomorrow morning?",
    time: "2h ago",
    unread: 0,
    online: false,
    role: "Client",
    specialty: "Tech Founder",
    project: "Mobile App Development",
    priority: "medium"
  },
  {
    id: 3,
    name: "Support Desk",
    avatar: "https://i.pravatar.cc/150?u=support",
    lastMessage: "Your dispute has been resolved in your favor.",
    time: "Yesterday",
    unread: 0,
    online: true,
    role: "Support",
    priority: "high",
    isSupport: true
  },
  {
    id: 4,
    name: "Emma Watson",
    avatar: "https://i.pravatar.cc/150?u=emma",
    lastMessage: "Let me know if you need any further adjustments.",
    time: "Yesterday",
    unread: 1,
    online: false,
    role: "Freelancer",
    specialty: "Illustrator",
    project: "Branding Kit",
    priority: "low"
  }
];

export function ConversationsListScreen() {
  const history = useHistory();
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const getTabs = () => {
    if (role === "admin") return ["All", "Support", "Flagged"];
    if (role === "client") return ["All", "Freelancers", "Support"];
    return ["All", "Clients", "Support"];
  };

  const tabs = getTabs();

  const filteredConversations = CONVERSATIONS.filter(chat => {
    if (activeTab === "All") return true;
    if (activeTab === "Support" || activeTab === "Support Tickets") return chat.isSupport;
    if (activeTab === "Freelancers") return chat.role === "Freelancer";
    if (activeTab === "Clients") return chat.role === "Client";
    if (activeTab === "Flagged") return chat.priority === "high";
    return true;
  });

  return (
    <PageTransition>
      <div className="h-screen bg-white flex flex-col max-w-[360px] mx-auto overflow-hidden relative font-['Roboto'] pb-20">
        {/* Top App Bar */}
        <header className="bg-white px-4 py-3 flex items-center justify-between z-10 border-b border-gray-50">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <Search className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex px-4 border-b mb-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[80px] py-3 text-xs font-bold transition-colors relative whitespace-nowrap ${
                activeTab === tab ? "text-[#8B5CF6]" : "text-gray-500"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabMsg"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <main className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {filteredConversations.map((chat) => (
              <motion.div
                key={chat.id}
                onClick={() => history.push(`/messages/${chat.id}`)}
                className="px-4 py-3 flex gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer relative group border-b border-gray-50/50"
              >
                <div className="relative shrink-0">
                  <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-full object-cover elevation-1" />
                  {chat.online && (
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className={`text-sm font-bold truncate ${chat.unread > 0 ? "text-gray-900" : "text-gray-700"}`}>
                        {chat.name}
                      </h3>
                      {role === "admin" && (
                         <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                           chat.role === "Freelancer" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                         }`}>
                           {chat.role}
                         </span>
                      )}
                      {chat.priority === "high" && role === "admin" && (
                         <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{chat.time}</span>
                  </div>
                  
                  {/* Context Info */}
                  <div className="flex items-center gap-2 mb-0.5">
                    {role === "client" && chat.specialty && (
                      <span className="text-[10px] text-[#8B5CF6] font-bold">{chat.specialty}</span>
                    )}
                    {role === "freelancer" && chat.project && (
                      <span className="text-[10px] text-gray-500 font-bold">Re: {chat.project}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <p className={`text-xs truncate ${chat.unread > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <div className="bg-[#8B5CF6] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shrink-0">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-20 px-10 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">No conversations found</h2>
              <p className="text-sm text-gray-500">Try switching tabs or searching for a different user.</p>
            </div>
          )}
        </main>

        {/* FAB */}
        <button className="fixed bottom-24 right-6 w-14 h-14 bg-[#8B5CF6] text-white rounded-2xl elevation-6 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
          <Plus className="w-7 h-7" />
        </button>

        <BottomNavigation />
      </div>
    </PageTransition>
  );
}


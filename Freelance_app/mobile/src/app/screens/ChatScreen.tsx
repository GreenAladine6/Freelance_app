import { useState, useRef, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ArrowLeft, Video, MoreVertical, Plus, Send, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PageTransition } from "../components/PageTransition";

const INITIAL_MESSAGES = [
  { id: 1, text: "Hey! I saw your profile and I'm interested in your services.", sender: "received", time: "10:30 AM" },
  { id: 2, text: "Hello! Thank you for reaching out. I'd love to help you with your project.", sender: "sent", time: "10:32 AM", read: true },
  { id: 3, text: "Can you share some of your previous work related to SaaS design?", sender: "received", time: "10:35 AM" },
  { id: 4, text: "Sure! I've sent you a link to my portfolio in your email. I can also upload some files here.", sender: "sent", time: "10:38 AM", read: true },
  { id: 5, text: "I've reviewed the design concepts and they look amazing!", sender: "received", time: "10:45 AM" },
];

export function ChatScreen() {
  const history = useHistory();
  const { id } = useParams();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "sent",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  return (
    <PageTransition>
      <div className="h-screen bg-[#F8F9FA] flex flex-col max-w-[360px] mx-auto overflow-hidden relative font-['Roboto']">
      {/* Top App Bar */}
      <header className="bg-white px-3 py-2 flex items-center justify-between elevation-1 z-10 border-b">
        <div className="flex items-center gap-2">
          <button onClick={() => history.goBack()} className="p-1 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=alex" alt="Alex Chen" className="w-10 h-10 rounded-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-none mb-1">Alex Chen</h1>
              <p className="text-[10px] text-green-600 font-medium">Active now</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 rounded-full hover:bg-gray-100">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 no-scrollbar"
      >
        <div className="flex justify-center mb-2">
          <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
        </div>

        {messages.map((msg, index) => {
          const isSent = msg.sender === "sent";
          return (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={msg.id}
              className={`flex flex-col ${isSent ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isSent
                    ? "bg-[#8B5CF6] text-white rounded-br-none elevation-1"
                    : "bg-white text-gray-800 rounded-bl-none border border-gray-100 elevation-1"
                }`}
              >
                {msg.text}
              </div>
              <div className={`flex items-center gap-1 mt-1 ${isSent ? "flex-row" : "flex-row-reverse"}`}>
                <span className="text-[9px] text-gray-400 font-medium uppercase">{msg.time}</span>
                {isSent && <CheckCheck className={`w-3 h-3 ${msg.read ? "text-[#8B5CF6]" : "text-gray-300"}`} />}
              </div>
            </motion.div>
          );
        })}
      </main>

      {/* Message Input */}
      <div className="bg-white px-4 py-3 border-t">
        <div className="flex items-end gap-3">
          <button className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-[#8B5CF6] transition-colors mb-0.5">
            <Plus className="w-6 h-6" />
          </button>
          <div className="flex-1 min-h-[44px] bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 flex items-center">
            <textarea
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none max-h-32 py-1 outline-none no-scrollbar"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <AnimatePresence>
            {inputValue.trim() && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleSendMessage}
                className="p-2 bg-[#8B5CF6] text-white rounded-full shadow-md hover:bg-[#7C3AED] transition-all mb-0.5"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

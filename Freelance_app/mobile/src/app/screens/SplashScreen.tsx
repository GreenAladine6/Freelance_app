import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { motion } from "motion/react";
import { useRole } from "../context/RoleContext";

export function SplashScreen() {
  const history = useHistory();
  const { isAuthenticated, role } = useRole();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        // Redirect to appropriate dashboard based on role
        if (role === "admin") history.replace("/dashboard-admin");
        else if (role === "client") history.replace("/dashboard-client");
        else history.replace("/dashboard");
      } else {
        history.replace("/interests");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [history, isAuthenticated, role]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center max-w-[360px] mx-auto overflow-hidden relative">
      {/* Status bar placeholder */}
      <div className="fixed top-0 left-0 right-0 h-6 bg-black z-50" />

      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 2.7 }}
        className="flex flex-col items-center justify-center"
      >
        {/* Logo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: [0.8, 1.05, 1],
          }}
          transition={{
            opacity: { duration: 0.5 },
            scale: { duration: 0.3, delay: 0.5, ease: "easeOut" }
          }}
          className="w-20 h-20 rounded-2xl bg-[#8B5CF6] flex items-center justify-center mb-8"
        >
          <Briefcase className="w-10 h-10 text-white" />
        </motion.div>

        {/* Text Container */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-white text-3xl font-bold mb-2 tracking-tight"
          >
            FreelanceHub
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.3 }}
            className="text-[#9CA3AF] text-base"
          >
            Where freelance happens
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

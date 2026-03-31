import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { PageTransition } from "../components/PageTransition";

const INTERESTS = [
  "Web Development",
  "Mobile Apps",
  "Graphic Design",
  "Writing & Translation",
  "Video Editing",
  "Marketing",
  "Photography",
  "AI & Machine Learning",
  "Architecture",
  "Music & Audio"
];

export function InterestSelectionScreen() {
  const history = useHistory();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelected(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const isContinueEnabled = selected.length >= 3;

  return (
    <PageTransition>
      <div className="min-h-screen bg-white flex flex-col max-w-[360px] mx-auto overflow-hidden relative font-['Roboto']">
        {/* Status Bar */}
        <div className="h-6 w-full bg-white" />

        <main className="flex-1 px-6 pt-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">What are you interested in?</h1>
            <p className="text-sm text-gray-500 mb-8">Select topics to personalize your experience</p>

            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
                    selected.includes(interest)
                      ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  {selected.includes(interest) && <Check className="w-4 h-4" />}
                  {interest}
                </button>
              ))}
            </div>
          </motion.div>
        </main>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 max-w-[360px] mx-auto p-6 bg-white/80 backdrop-blur-sm flex flex-col gap-3">
          <button
            onClick={() => history.push("/browse")}
            disabled={!isContinueEnabled}
            className={`w-full py-3.5 rounded-full font-medium transition-all ${
              isContinueEnabled
                ? "bg-[#8B5CF6] text-white elevation-2"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
          <button
            onClick={() => history.push("/browse")}
            className="w-full py-2 text-[#8B5CF6] font-medium text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </PageTransition>
  );
}

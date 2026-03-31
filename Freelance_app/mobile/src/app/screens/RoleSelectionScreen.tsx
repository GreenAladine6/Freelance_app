import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Laptop, Briefcase, Shield } from "lucide-react";
import { PageTransition } from "../components/PageTransition";
import { useRole, UserRole } from "../context/RoleContext";

export function RoleSelectionScreen() {
  const history = useHistory();
  const { setRole } = useRole();
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");

  const handleContinue = () => {
    if (selectedRole) {
      setRole(selectedRole as UserRole);
      history.push("/login");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
        {/* Status bar */}
        <div className="h-6 bg-white" />

        {/* Content */}
        <div className="flex-1 px-4 py-8 flex flex-col overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join FreelanceHub as...
          </h1>
          <p className="text-base text-gray-600 mb-8">Choose how you want to get started</p>

          <div className="flex-1 flex flex-col gap-4">
            {/* Freelancer card */}
            <button
              onClick={() => setSelectedRole("freelancer")}
              className={`flex flex-col items-center p-8 rounded-xl transition-all shadow-lg hover:shadow-xl ${
                selectedRole === "freelancer"
                  ? "border-2 border-[#8B5CF6] bg-purple-50"
                  : "border border-gray-200 bg-white"
              }`}
            >
              <div className="w-20 h-20 rounded-full bg-[#8B5CF6] flex items-center justify-center mb-4">
                <Laptop className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                I'm a Freelancer
              </h3>
              <p className="text-sm text-gray-600 text-center">
                I want to offer my services
              </p>
            </button>

            {/* Client card */}
            <button
              onClick={() => setSelectedRole("client")}
              className={`flex flex-col items-center p-8 rounded-xl transition-all shadow-lg hover:shadow-xl ${
                selectedRole === "client"
                  ? "border-2 border-[#8B5CF6] bg-purple-50"
                  : "border border-gray-200 bg-white"
              }`}
            >
              <div className="w-20 h-20 rounded-full bg-[#8B5CF6] flex items-center justify-center mb-4">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                I'm a Client
              </h3>
              <p className="text-sm text-gray-600 text-center">
                I want to hire talent
              </p>
            </button>

            {/* Admin card */}
            <button
              onClick={() => setSelectedRole("admin")}
              className={`flex flex-col items-center p-8 rounded-xl transition-all shadow-lg hover:shadow-xl ${
                selectedRole === "admin"
                  ? "border-2 border-[#8B5CF6] bg-purple-50"
                  : "border border-gray-200 bg-white"
              }`}
            >
              <div className="w-20 h-20 rounded-full bg-[#8B5CF6] flex items-center justify-center mb-4">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                I'm an Admin
              </h3>
              <p className="text-sm text-gray-600 text-center">
                I want to manage the platform
              </p>
            </button>
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full h-14 bg-[#8B5CF6] text-white rounded-lg font-medium text-base hover:bg-[#7C3AED] transition-colors shadow-md mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>

        {/* Navigation bar placeholder */}
        <div className="h-12 bg-white" />
      </div>
    </PageTransition>
  );
}

import { FormEvent, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Briefcase,
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserCircle,
} from "lucide-react";
import { PageTransition } from "../components/PageTransition";
import { apiRegister } from "../api";
import { useRole } from "../context/RoleContext";

export function SignUpScreen() {
  const history = useHistory();
  const { handleLoginSuccess } = useRole();
  const [role, setRole] = useState<"Freelancer" | "Client" | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!role || !agreed || !email || !password) {
      setError("Please fill all fields and accept the terms.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const user_type = role === "Client" ? "client" : "freelancer";

      await apiRegister({
        username: email.split("@")[0],
        email,
        password,
        user_type,
        full_name: fullName || undefined,
      });

      // After successful registration, immediately send user to login
      history.push("/login");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white flex flex-col max-w-[360px] mx-auto overflow-hidden relative font-['Roboto']">
        {/* Top App Bar */}
        <header className="px-4 py-3 flex items-center gap-4 border-b">
          <button onClick={() => history.goBack()} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Create Account</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-[#8B5CF6]">
              Step 1 of 2
            </span>
            <div className="flex gap-1">
              <div className="w-8 h-1.5 bg-[#8B5CF6] rounded-full" />
              <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
            </div>
          </div>

          <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 ml-1">
                Full Name
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 focus:border-[#8B5CF6] transition-all text-sm text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3 mt-2">
              <label className="text-xs font-medium text-gray-500 ml-1">
                I want to join as:
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole("Freelancer")}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === "Freelancer"
                      ? "bg-[#F5F3FF] border-[#8B5CF6] text-[#8B5CF6]"
                      : "bg-white border-gray-100 text-gray-500"
                  }`}
                >
                  <User className="w-6 h-6" />
                  <span className="text-xs font-bold">Freelancer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("Client")}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === "Client"
                      ? "bg-[#F5F3FF] border-[#8B5CF6] text-[#8B5CF6]"
                      : "bg-white border-gray-100 text-gray-500"
                  }`}
                >
                  <Briefcase className="w-6 h-6" />
                  <span className="text-xs font-bold">Client</span>
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
              />
              <span className="text-xs text-gray-500">
                I agree to Terms & Conditions
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={!agreed || !role || loading}
              className={`w-full py-4 rounded-full font-bold transition-all mt-4 ${
                agreed && role && !loading
                  ? "bg-[#8B5CF6] text-white elevation-2"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Creating account..." : "Continue"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => history.push("/login")}
                className="text-[#8B5CF6] font-bold"
              >
                Sign In
              </button>
            </p>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}

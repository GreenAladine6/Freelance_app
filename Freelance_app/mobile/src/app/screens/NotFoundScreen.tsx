import { useHistory } from "react-router-dom";
import { Home } from "lucide-react";
import { PageTransition } from "../components/PageTransition";

export function NotFoundScreen() {
  const history = useHistory();

  return (
    <PageTransition>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center max-w-md mx-auto px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[#8B5CF6] mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <button
            onClick={() => history.push("/dashboard")}
            className="flex items-center gap-2 px-6 py-3 bg-[#8B5CF6] text-white rounded-lg font-medium hover:bg-[#7C3AED] transition-colors mx-auto"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </PageTransition>
  );
}

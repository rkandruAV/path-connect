import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function AuthLayout() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 text-white flex-col justify-center p-12">
        <h1 className="text-4xl font-bold mb-4">PathConnect</h1>
        <p className="text-xl text-primary-100 mb-8">
          AI-powered mentorship that connects you with the perfect guide for your journey.
        </p>
        <ul className="space-y-4 text-primary-100">
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-xs">✓</span>
            AI-matched mentors based on your goals
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-xs">✓</span>
            Automated session summaries & action items
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-xs">✓</span>
            Personalized learning paths
          </li>
        </ul>
      </div>

      {/* Right panel - auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

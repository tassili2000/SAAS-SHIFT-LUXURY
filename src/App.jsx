import React, { useEffect, Suspense } from 'react';
import AdminDashboard from './pages/admin/AdminDashboard';
import Storefront from './pages/client/Storefront';
import AuthPortal from './pages/AuthPortal';
import { useTheme } from './hooks/useTheme';
import { useAuthStore } from './store/useAuthStore';

const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Initialisation Shift</p>
    </div>
  </div>
);

export default function App() {
  const { theme } = useTheme();
  const { user, role, isLoading, initSession, logout } = useAuthStore();

  // Au montage : récupère la session Supabase existante
  useEffect(() => {
    initSession();
  }, []);

  // Pendant le chargement initial de la session
  if (isLoading) return <LoadingFallback />;

  const renderView = () => {
    if (!user) {
      return <AuthPortal />;
    }

    switch (role) {
      case 'merchant':
        return <AdminDashboard onLogout={logout} />;
      case 'client':
      default:
        return <Storefront onLogout={logout} />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Suspense fallback={<LoadingFallback />}>
        {renderView()}
      </Suspense>
    </div>
  );
}

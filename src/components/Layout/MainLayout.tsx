import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import MobileSidebar from './MobileSidebar';
import { useAuth } from '../../context/AuthContext';

const MainLayout: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If there's no current user, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar: hidden on mobile, flex on md+ */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      {/* Main content: full width on mobile */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Mobile nav: visible only on mobile */}
        <div className="md:hidden">
          <MobileNav onMenuClick={() => setSidebarOpen(true)} />
          {sidebarOpen && <MobileSidebar onClose={() => setSidebarOpen(false)} />}
        </div>
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
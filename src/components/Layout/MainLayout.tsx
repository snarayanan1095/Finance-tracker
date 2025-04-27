import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useAppContext } from '../../context/AppContext';
import LoginPage from '../../pages/Login';

const MainLayout: React.FC = () => {
  const { state } = useAppContext();

  // If there's no current user, show the login page
  if (!state.currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
};

export default MainLayout;
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, DollarSign, Users, BarChart, Settings, Menu } from 'lucide-react';

const MobileNav: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: 'Home', icon: <Home size={20} />, path: '/' },
    { title: 'Expenses', icon: <DollarSign size={20} />, path: '/expenses' },
    { title: 'Family', icon: <Users size={20} />, path: '/family' },
    { title: 'Reports', icon: <BarChart size={20} />, path: '/reports' },
    { title: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              location.pathname === item.path
                ? 'text-teal-600'
                : 'text-gray-500'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
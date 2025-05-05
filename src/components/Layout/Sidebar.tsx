import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, DollarSign, Users, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { signOut } from '../../services/firebase';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white w-64 p-4">
      <div className="flex items-center mb-8">
        <img
          src="/family-finance-logo.png"
          alt="Family Finance Logo"
          className="w-10 h-10 mr-2"
        />
        <span className="text-xl font-bold">Family Finance</span>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#18181b] rounded-lg transition-colors"
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/expenses"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#18181b] rounded-lg transition-colors"
            >
              <DollarSign className="h-5 w-5 mr-3" />
              Expenses
            </Link>
          </li>
          <li>
            <Link
              to="/family"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#18181b] rounded-lg transition-colors"
            >
              <Users className="h-5 w-5 mr-3" />
              Family
            </Link>
          </li>
          <li>
            <Link
              to="/reports"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#18181b] rounded-lg transition-colors"
            >
              <BarChart2 className="h-5 w-5 mr-3" />
              Reports
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#18181b] rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center px-4 py-2 text-gray-300 hover:bg-[#18181b] rounded-lg transition-colors mt-auto"
      >
        <LogOut className="h-5 w-5 mr-3" />
        Sign Out
      </button>
    </div>
  );
};

export default Sidebar;
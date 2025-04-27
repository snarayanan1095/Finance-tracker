import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, DollarSign, Users, BarChart, Settings, LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useAppContext();

  const menuItems = [
    { title: 'Dashboard', icon: <Home size={20} />, path: '/' },
    { title: 'Expenses', icon: <DollarSign size={20} />, path: '/expenses' },
    { title: 'Family', icon: <Users size={20} />, path: '/family' },
    { title: 'Reports', icon: <BarChart size={20} />, path: '/reports' },
    { title: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    navigate('/login');
  };

  return (
    <div className="hidden md:flex flex-col h-screen bg-white border-r border-gray-200 w-64 p-4">
      <div className="flex items-center space-x-2 mb-8">
        <div className="bg-teal-500 p-2 rounded">
          <DollarSign className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold text-gray-800">FamilyFinance</h1>
      </div>
      
      <div className="flex-1">
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {state.currentUser && (
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold mr-3">
              {state.currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-800">{state.currentUser.name}</p>
              <p className="text-xs text-gray-500">{state.currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span className="mr-3"><LogOut size={20} /></span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
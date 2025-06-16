import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/firebase';
import { CURRENCIES } from '../utils/helpers';
import EmailIntegration from '../components/EmailIntegration';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    (currentUser as any)?.currency || CURRENCIES[0]
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error: unknown) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-gray-900">{currentUser?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="mt-1 text-gray-900">{(currentUser as any)?.name}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Default Currency
              </label>
              <div className="bg-white shadow rounded-lg p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Currency</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Set your preferred currency for all transactions
                  </p>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <EmailIntegration />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

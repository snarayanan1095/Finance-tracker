import React, { useState } from 'react';
import { LogOut, Share2, Download, Upload, AlertTriangle, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CURRENCIES } from '../utils/helpers';

const SettingsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [joinFamilyId, setJoinFamilyId] = useState('');
  const [showExportData, setShowExportData] = useState(false);
  const [exportedData, setExportedData] = useState('');
  
  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    navigate('/login');
  };
  
  const handleExportData = () => {
    const dataToExport = JSON.stringify(state, null, 2);
    setExportedData(dataToExport);
    setShowExportData(true);
  };
  
  const handleDownloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "family-finance-data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      localStorage.removeItem('expenseTrackerData');
      window.location.reload();
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = CURRENCIES.find(c => c.code === e.target.value);
    if (!newCurrency || !state.currentFamily) return;

    // Update family's default currency
    const updatedFamily = {
      ...state.currentFamily,
      defaultCurrency: newCurrency
    };
    dispatch({ type: 'EDIT_FAMILY', payload: updatedFamily });

    // Update all family members' currency
    state.currentFamily.members.forEach(member => {
      const updatedMember = {
        ...member,
        currency: newCurrency
      };
      dispatch({ type: 'EDIT_USER', payload: updatedMember });
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500">Manage your account and application settings</p>
      </div>
      
      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Your Name</p>
            <p className="text-gray-800 font-medium">{state.currentUser?.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="text-gray-800 font-medium">{state.currentUser?.email}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">Family</p>
            <p className="text-gray-800 font-medium">{state.currentFamily?.name}</p>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm text-gray-500 mb-1">
              Currency
            </label>
            <select
              id="currency"
              value={state.currentFamily?.defaultCurrency.code}
              onChange={handleCurrencyChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              This will update the currency for all family members
            </p>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Data Management */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Download size={18} className="text-teal-600" />
              <h3 className="font-medium text-gray-800">Export Data</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Export your family's financial data for backup or migration.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
              >
                View Data
              </button>
              <button
                onClick={handleDownloadData}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Download JSON
              </button>
            </div>
            
            {showExportData && (
              <div className="mt-3">
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto max-h-60">
                  {exportedData}
                </pre>
                <button
                  onClick={() => setShowExportData(false)}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Hide
                </button>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle size={18} className="text-red-600" />
              <h3 className="font-medium text-gray-800">Danger Zone</h3>
            </div>
            <p className="text-sm text-red-500 mb-3">
              These actions are irreversible. Please proceed with caution.
            </p>
            <button
              onClick={handleResetData}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

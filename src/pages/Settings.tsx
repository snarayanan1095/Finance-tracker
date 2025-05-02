import React, { useState } from 'react';
import { LogOut, Share2, Download, Upload, AlertTriangle, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CURRENCIES } from '../utils/helpers';

const SettingsPage: React.FC = () => {
  const { currentFamily } = useAppContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showExportData, setShowExportData] = useState(false);
  const [exportedData, setExportedData] = useState('');
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const handleExportData = async () => {
    if (!currentFamily || !currentUser) return;

    try {
      // Create an export record in Firestore
      const exportsRef = collection(db, 'exports');
      await addDoc(exportsRef, {
        familyId: currentFamily.id,
        userId: currentUser.uid,
        exportedAt: serverTimestamp(),
        data: {
          family: currentFamily,
          user: currentUser
        }
      });

      // Format data for display
      const dataToExport = JSON.stringify({
        family: currentFamily,
        user: currentUser
      }, null, 2);
      
      setExportedData(dataToExport);
      setShowExportData(true);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };
  
  const handleDownloadData = () => {
    if (!exportedData) return;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportedData);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "family-finance-data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{currentUser?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">{currentUser?.displayName || 'Anonymous'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Family Settings</h2>
          {currentFamily && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Family Name</label>
                <p className="mt-1 text-gray-900">{currentFamily.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Currency</label>
                <p className="mt-1 text-gray-900">
                  {currentFamily.defaultCurrency.name} ({currentFamily.defaultCurrency.symbol})
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Data Management</h2>
          <div className="space-y-4">
            <button
              onClick={handleExportData}
              className="flex items-center text-teal-600 hover:text-teal-700"
            >
              <Download size={20} className="mr-2" />
              Export Data
            </button>
            
            {showExportData && (
              <div className="mt-4">
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                  {exportedData}
                </pre>
                <button
                  onClick={handleDownloadData}
                  className="mt-2 text-sm text-teal-600 hover:text-teal-700"
                >
                  Download JSON
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Danger Zone</h2>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <LogOut size={20} className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

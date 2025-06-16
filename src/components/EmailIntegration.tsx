import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { emailService } from '../services/email';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';

export const EmailIntegration: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');

    try {
      const authUrl = await emailService.authenticate({
        id: currentUser.uid,
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        email: currentUser.email || '',
        isAdmin: false,
        familyId: '',
        currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to connect email');
    } finally {
      setLoading(false);
    }
  };

  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      try {
        await emailService.handleCallback(code, state);
        // Redirect to settings page
        navigate('/settings');
      } catch (err: any) {
        setError(err.message || 'Failed to authenticate email');
      }
    }
  };

  const getStatus = () => {
    if (!currentUser) return null;
    
    // This would typically be fetched from the user's document
    const emailIntegration = {
      enabled: false,
      lastSync: null
    };

    if (!emailIntegration.enabled) {
      return (
        <div className="flex items-center space-x-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>Not Connected</span>
        </div>
      );
    }

    if (emailIntegration.lastSync) {
      return (
        <div className="flex items-center space-x-2 text-green-500">
          <CheckCircle2 className="w-5 h-5" />
          <span>Last synced: {new Date(emailIntegration.lastSync).toLocaleString()}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-yellow-500">
        <Mail className="w-5 h-5" />
        <span>Connected</span>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Email Integration</h2>
        {getStatus()}
      </div>
      
      <p className="text-gray-600 mb-4">
        Connect your email to automatically import financial transactions from emails.
      </p>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Connecting...' : 'Connect Email'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default EmailIntegration;

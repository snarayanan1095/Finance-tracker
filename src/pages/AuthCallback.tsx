import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GmailService } from '../services/gmail';
import { db } from '../config/firebase';
import { User } from '../types';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const gmailService = new GmailService();

  React.useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code || !state) {
          throw new Error('Missing authentication parameters');
        }

        // Get the refresh token
        const refreshToken = await gmailService.handleCallback(code);

        // Store the refresh token in Firebase
        await db.collection('users').doc(state).update({
          emailIntegration: {
            enabled: true,
            lastSync: new Date(),
            refreshToken: refreshToken
          }
        });

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Gmail auth callback error:', error);
        navigate('/login', { 
          state: { error: 'Failed to authenticate with Gmail' }
        });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Gmail Authentication...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;

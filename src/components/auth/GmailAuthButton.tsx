import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GmailService } from '../../services/gmail';

const GmailAuthButton: React.FC = () => {
  const navigate = useNavigate();
  const gmailService = new GmailService();

  const handleGmailAuth = async () => {
    try {
      const authUrl = await gmailService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating Gmail auth:', error);
    }
  };

  return (
    <button
      onClick={handleGmailAuth}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      Connect with Gmail
    </button>
  );
};

export default GmailAuthButton;

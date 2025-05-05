import React from 'react';
import Sidebar from './Sidebar';

const MobileSidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40"
        onClick={onClose}
        aria-label="Close sidebar overlay"
      />
      {/* Sidebar panel */}
      <div className="relative w-64 bg-black h-full shadow-lg z-50 animate-slide-in">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-2xl p-2 focus:outline-none"
          aria-label="Close sidebar"
        >
          ×
        </button>
        <Sidebar onNavigate={onClose} />
      </div>
    </div>
  );
};

export default MobileSidebar; 
import React from 'react';

interface AffirmationProps {
  isOpen: boolean;
  onClose: () => void;
  animate?: boolean;
}

export default function Affirmation({ isOpen, onClose, animate }: AffirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Daily Affirmation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        <p className="text-gray-700 mb-4">
          Today is a new opportunity to grow and shine. You have the strength within you to overcome any challenge.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
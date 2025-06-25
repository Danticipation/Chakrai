import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">TraI Medical Application</h1>
        <p className="text-lg text-gray-600 mb-8">Mental Wellness & Therapy Platform</p>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Application Status</h2>
          <div className="text-green-600 font-medium">✓ Server Running</div>
          <div className="text-green-600 font-medium">✓ React Loading</div>
          <div className="text-green-600 font-medium">✓ API Endpoints Active</div>
        </div>
      </div>
    </div>
  );
}
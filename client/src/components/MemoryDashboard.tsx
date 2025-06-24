import React from 'react';

interface MemoryDashboardProps {
  userId: number;
}

export default function MemoryDashboard({ userId }: MemoryDashboardProps) {
  return (
    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-4">Memory Dashboard</h2>
      <div className="space-y-4">
        <div className="bg-white/10 p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Conversation Memory</h3>
          <p className="text-white/80 text-sm">Your AI companion remembers your preferences and conversation patterns.</p>
        </div>
        <div className="bg-white/10 p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Personality Insights</h3>
          <p className="text-white/80 text-sm">Building a personalized therapeutic relationship based on your interactions.</p>
        </div>
      </div>
    </div>
  );
}
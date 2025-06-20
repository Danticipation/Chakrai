import { useState } from 'react';
import { AlertTriangle, Phone, Heart, Clock, X } from 'lucide-react';

interface CrisisAnalysis {
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  supportMessage: string;
  immediateActions: string[];
  emergencyContacts: string[];
  confidenceScore: number;
  checkInScheduled: boolean;
}

interface CrisisAlertProps {
  crisisAnalysis: CrisisAnalysis;
  onClose: () => void;
  onGetHelp: () => void;
}

export default function CrisisAlert({ crisisAnalysis, onClose, onGetHelp }: CrisisAlertProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!crisisAnalysis || crisisAnalysis.riskLevel === 'none' || crisisAnalysis.riskLevel === 'low') {
    return null;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return '#DC2626'; // Red
      case 'high':
        return '#EA580C'; // Orange
      case 'medium':
        return '#D97706'; // Amber
      default:
        return '#6B7280'; // Gray
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'medium':
        return <Heart className="w-6 h-6 text-amber-600" />;
      default:
        return <Heart className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRiskTitle = (level: string) => {
    switch (level) {
      case 'critical':
        return 'Immediate Support Needed';
      case 'high':
        return 'Support Recommended';
      case 'medium':
        return 'Check-in Scheduled';
      default:
        return 'Wellness Check';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{ border: `3px solid ${getRiskColor(crisisAnalysis.riskLevel)}` }}
      >
        {/* Header */}
        <div 
          className="p-4 rounded-t-2xl text-white"
          style={{ backgroundColor: getRiskColor(crisisAnalysis.riskLevel) }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getRiskIcon(crisisAnalysis.riskLevel)}
              <h2 className="ml-3 text-lg font-bold">
                {getRiskTitle(crisisAnalysis.riskLevel)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Support Message */}
          <div className="text-center">
            <p className="text-gray-800 leading-relaxed">
              {crisisAnalysis.supportMessage}
            </p>
          </div>

          {/* Emergency Contacts for Critical/High Risk */}
          {(crisisAnalysis.riskLevel === 'critical' || crisisAnalysis.riskLevel === 'high') && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <Phone className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-800">Emergency Contacts</h3>
              </div>
              <div className="space-y-2">
                {crisisAnalysis.emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center text-sm text-red-700">
                    <span className="mr-2">•</span>
                    <span>{contact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Immediate Actions */}
          {crisisAnalysis.immediateActions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-800 mb-3">Recommended Actions</h3>
              <div className="space-y-2">
                {crisisAnalysis.immediateActions.slice(0, 3).map((action, index) => (
                  <div key={index} className="flex items-start text-sm text-blue-700">
                    <span className="mr-2 mt-1">•</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check-in Information */}
          {crisisAnalysis.checkInScheduled && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-purple-800">Follow-up Scheduled</h3>
              </div>
              <p className="text-sm text-purple-700">
                We'll check in with you again to see how you're doing. Your wellbeing is important to us.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            {crisisAnalysis.riskLevel === 'critical' && (
              <button
                onClick={() => window.open('tel:988', '_self')}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Crisis Lifeline (988)
              </button>
            )}
            
            <button
              onClick={onGetHelp}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Professional Help
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {/* Details Section */}
          {showDetails && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Risk Assessment</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Risk Level:</span>
                  <span 
                    className="font-medium capitalize px-2 py-1 rounded text-white"
                    style={{ backgroundColor: getRiskColor(crisisAnalysis.riskLevel) }}
                  >
                    {crisisAnalysis.riskLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-medium">
                    {Math.round(crisisAnalysis.confidenceScore * 100)}%
                  </span>
                </div>
              </div>
              
              {crisisAnalysis.indicators.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Detected Indicators</h4>
                  <div className="space-y-1">
                    {crisisAnalysis.indicators.slice(0, 3).map((indicator, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {indicator}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
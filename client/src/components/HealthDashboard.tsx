import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, 
  Activity, 
  Moon, 
  Watch, 
  TrendingUp, 
  BarChart3, 
  Plus, 
  RefreshCw,
  CheckCircle,
  Info,
  Trash2
} from 'lucide-react';

interface WearableDevice {
  id: number;
  deviceType: string;
  deviceName: string;
  deviceId: string;
  isActive: boolean;
  lastSyncAt: string | null;
  syncSettings: any;
  createdAt: string;
}

interface HealthMetric {
  id: number;
  metricType: string;
  value: number;
  unit: string;
  timestamp: string;
  confidence: number;
  metadata: any;
}

interface HealthCorrelation {
  id: number;
  emotionalMetric: string;
  physicalMetric: string;
  correlationScore: number;
  confidence: number;
  timeframe: string;
  insights: string[];
  recommendations: string[];
  analysisDate: string;
}

export default function HealthDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [correlationTimeframe, setCorrelationTimeframe] = useState('weekly');
  const queryClient = useQueryClient();

  // Get current user ID
  const userId = 1;

  // Fetch wearable devices
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: [`/api/wearable-devices/${userId}`],
  });

  // Fetch health metrics
  const { data: healthMetrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: [`/api/health-metrics/${userId}`],
  });

  // Fetch health correlations
  const { data: correlations = [], isLoading: correlationsLoading } = useQuery({
    queryKey: [`/api/health-correlations/${userId}`],
  });

  // Fetch health insights
  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: [`/api/health-insights/${userId}`],
  });

  // Analyze correlations mutation
  const analyzeCorrelations = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/health-correlations/${userId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe: correlationTimeframe })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/health-correlations/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/health-insights/${userId}`] });
    }
  });

  // Connect device mutation
  const connectDevice = useMutation({
    mutationFn: async (deviceData: any) => {
      const response = await fetch('/api/wearable-devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...deviceData, userId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wearable-devices/${userId}`] });
      setShowAddDevice(false);
    }
  });

  // Remove device mutation
  const removeDevice = useMutation({
    mutationFn: async (deviceId: number) => {
      const response = await fetch(`/api/wearable-devices/${deviceId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wearable-devices/${userId}`] });
    }
  });

  // Group health metrics by type
  const metricsByType = healthMetrics.reduce((acc: any, metric: HealthMetric) => {
    if (!acc[metric.metricType]) {
      acc[metric.metricType] = [];
    }
    acc[metric.metricType].push(metric);
    return acc;
  }, {});

  // Get latest metrics for display
  const latestMetrics = Object.entries(metricsByType).map(([type, metrics]: [string, any]) => {
    const latest = metrics.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    return { type, ...latest };
  });

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'heart_rate': return <Heart className="w-5 h-5 text-red-500" />;
      case 'steps': return <Activity className="w-5 h-5 text-blue-500" />;
      case 'sleep_duration': return <Moon className="w-5 h-5 text-purple-500" />;
      default: return <BarChart3 className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatMetricName = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getCorrelationColor = (score: number) => {
    const abs = Math.abs(score);
    if (abs > 0.7) return 'text-red-600 bg-red-50';
    if (abs > 0.5) return 'text-orange-600 bg-orange-50';
    if (abs > 0.3) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Dashboard</h1>
          <p className="text-gray-600 mt-1">Track physical health correlations with emotional wellness</p>
        </div>
        <button 
          onClick={() => setShowAddDevice(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Connect Device
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'devices', 'correlations', 'insights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Latest Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {latestMetrics.length > 0 ? latestMetrics.map((metric) => (
                  <div key={metric.type} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">
                        {formatMetricName(metric.type)}
                      </h3>
                      {getMetricIcon(metric.type)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {metric.value} {metric.unit}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(metric.timestamp).toLocaleDateString()}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${metric.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(metric.confidence * 100)}%
                    </p>
                  </div>
                )) : (
                  <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No health data yet</h3>
                    <p className="text-gray-600">Connect a device to start tracking your health metrics</p>
                  </div>
                )}
              </div>

              {/* Quick Insights */}
              {insightsData?.insights && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                    <Info className="w-5 h-5 text-blue-500" />
                    Health Insights
                  </h3>
                  <div className="space-y-3">
                    {insightsData.insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.length > 0 ? devices.map((device: WearableDevice) => (
                  <div key={device.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Watch className="w-8 h-8 text-gray-600" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{device.deviceName}</h3>
                          <p className="text-sm text-gray-600">{formatMetricName(device.deviceType)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          device.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {device.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => removeDevice.mutate(device.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Sync:</span>
                        <span>
                          {device.lastSyncAt 
                            ? new Date(device.lastSyncAt).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Device ID:</span>
                        <span className="font-mono text-xs">{device.deviceId}</span>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Sync Now
                    </button>
                  </div>
                )) : (
                  <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <Watch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No devices connected</h3>
                    <p className="text-gray-600 mb-4">
                      Connect your smartwatch or fitness tracker to start tracking health correlations
                    </p>
                    <button 
                      onClick={() => setShowAddDevice(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Connect Your First Device
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Correlations Tab */}
          {activeTab === 'correlations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Health-Emotion Correlations</h3>
                  <p className="text-gray-600 text-sm">Discover connections between physical and emotional patterns</p>
                </div>
                <div className="flex items-center gap-4">
                  <select 
                    value={correlationTimeframe} 
                    onChange={(e) => setCorrelationTimeframe(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <button 
                    onClick={() => analyzeCorrelations.mutate()}
                    disabled={analyzeCorrelations.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Analyze
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {correlations.length > 0 ? correlations.map((correlation: HealthCorrelation) => (
                  <div key={correlation.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatMetricName(correlation.physicalMetric)} ↔ {formatMetricName(correlation.emotionalMetric)}
                        </h3>
                        <p className="text-sm text-gray-600">{correlation.timeframe} analysis</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCorrelationColor(correlation.correlationScore)}`}>
                        {correlation.correlationScore > 0 ? '+' : ''}{correlation.correlationScore.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${correlation.confidence * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Confidence: {Math.round(correlation.confidence * 100)}%
                        </p>
                      </div>
                      
                      {correlation.insights && correlation.insights.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Key Insights:</h4>
                          <ul className="space-y-1">
                            {correlation.insights.slice(0, 2).map((insight, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {correlation.recommendations && correlation.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {correlation.recommendations.slice(0, 2).map((rec, index) => (
                              <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No correlations found</h3>
                    <p className="text-gray-600 mb-4">
                      Connect devices and track mood to discover health-emotion patterns
                    </p>
                    <button 
                      onClick={() => analyzeCorrelations.mutate()}
                      disabled={analyzeCorrelations.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Run Analysis
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {insightsData?.insights && insightsData.insights.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {insightsData.insights.map((insight: string, index: number) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Info className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Health Insight #{index + 1}</h3>
                          <p className="text-gray-700">{insight}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available yet</h3>
                  <p className="text-gray-600 mb-4">
                    Connect devices and track health data to receive personalized wellness insights
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Device Modal */}
      {showAddDevice && <AddDeviceModal onClose={() => setShowAddDevice(false)} onConnect={connectDevice.mutate} />}
    </div>
  );
}

function AddDeviceModal({ onClose, onConnect }: { onClose: () => void; onConnect: (data: any) => void }) {
  const [deviceType, setDeviceType] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceId, setDeviceId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect({
      deviceType,
      deviceName,
      deviceId,
      syncSettings: {}
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Connect Wearable Device</h3>
          <p className="text-sm text-gray-600 mt-1">Add a new smartwatch or fitness tracker to track health correlations</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
              <select 
                value={deviceType} 
                onChange={(e) => setDeviceType(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select device type</option>
                <option value="apple_watch">Apple Watch</option>
                <option value="fitbit">Fitbit</option>
                <option value="garmin">Garmin</option>
                <option value="samsung_health">Samsung Health</option>
                <option value="polar">Polar</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-2">Device Name</label>
              <input
                id="deviceName"
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="My Apple Watch"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700 mb-2">Device ID</label>
              <input
                id="deviceId"
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="Device serial number or ID"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect Device
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
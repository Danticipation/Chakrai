import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface SubscriptionData {
  status: 'free' | 'premium' | 'premium_device';
  expiresAt: Date | null;
  monthlyUsage: number;
  lastUsageReset: Date;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  isPremium: boolean;
  isLoading: boolean;
  monthlyUsage: number;
  canUseFeature: (feature: string) => boolean;
  incrementUsage: () => void;
  upgradeSubscription: () => void;
  checkUsageLimit: (feature: string) => { canUse: boolean; remaining: number; limit: number };
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// Feature limits for free users
const FEATURE_LIMITS = {
  chat_messages: 20,
  journal_entries: 5,
  voice_features: 3,
  personality_insights: 1,
  mood_tracking: 10,
  ai_analysis: 2,
  export_data: 0,
  advanced_analytics: 0,
  crisis_detection: 5,
  vr_therapy: 0,
  therapeutic_plans: 1
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyUsage, setMonthlyUsage] = useState(0);

  useEffect(() => {
    loadSubscriptionData();
  }, [user, isAuthenticated]);

  const loadSubscriptionData = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated && user) {
        // Load from server for authenticated users
        const response = await fetch('/api/subscription/status', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
          setMonthlyUsage(data.monthlyUsage || 0);
        }
      } else {
        // Load from localStorage for anonymous users
        const localSub = localStorage.getItem('subscription_status');
        const localUsage = localStorage.getItem('monthly_usage');
        const lastReset = localStorage.getItem('last_usage_reset');
        
        const now = new Date();
        const resetDate = lastReset ? new Date(lastReset) : now;
        
        // Reset usage if it's a new month
        if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
          localStorage.setItem('monthly_usage', '0');
          localStorage.setItem('last_usage_reset', now.toISOString());
          setMonthlyUsage(0);
        } else {
          setMonthlyUsage(parseInt(localUsage || '0'));
        }
        
        setSubscription({
          status: (localSub as any) || 'free',
          expiresAt: null,
          monthlyUsage: parseInt(localUsage || '0'),
          lastUsageReset: resetDate
        });
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      // Fallback to free tier
      setSubscription({
        status: 'free',
        expiresAt: null,
        monthlyUsage: 0,
        lastUsageReset: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = subscription?.status === 'premium' || subscription?.status === 'premium_device';

  const canUseFeature = (feature: string): boolean => {
    if (isPremium) return true;
    
    const limit = FEATURE_LIMITS[feature as keyof typeof FEATURE_LIMITS];
    if (limit === undefined) return true; // No limit defined, allow usage
    
    const currentUsage = getCurrentFeatureUsage(feature);
    return currentUsage < limit;
  };

  const getCurrentFeatureUsage = (feature: string): number => {
    const usageKey = `usage_${feature}`;
    const storedUsage = localStorage.getItem(usageKey);
    return parseInt(storedUsage || '0');
  };

  const incrementUsage = async () => {
    const newUsage = monthlyUsage + 1;
    setMonthlyUsage(newUsage);
    
    if (isAuthenticated) {
      // Update server for authenticated users
      try {
        await fetch('/api/subscription/usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ increment: 1 })
        });
      } catch (error) {
        console.error('Failed to update usage on server:', error);
      }
    } else {
      // Update localStorage for anonymous users
      localStorage.setItem('monthly_usage', newUsage.toString());
    }
  };

  const incrementFeatureUsage = (feature: string) => {
    const usageKey = `usage_${feature}`;
    const currentUsage = getCurrentFeatureUsage(feature);
    localStorage.setItem(usageKey, (currentUsage + 1).toString());
  };

  const checkUsageLimit = (feature: string) => {
    if (isPremium) {
      return { canUse: true, remaining: Infinity, limit: Infinity };
    }
    
    const limit = FEATURE_LIMITS[feature as keyof typeof FEATURE_LIMITS] || 0;
    const currentUsage = getCurrentFeatureUsage(feature);
    
    return {
      canUse: currentUsage < limit,
      remaining: Math.max(0, limit - currentUsage),
      limit
    };
  };

  const upgradeSubscription = () => {
    // This will trigger the payment flow
    window.dispatchEvent(new CustomEvent('show-upgrade-modal'));
  };

  const value: SubscriptionContextType = {
    subscription,
    isPremium,
    isLoading,
    monthlyUsage,
    canUseFeature,
    incrementUsage,
    upgradeSubscription,
    checkUsageLimit
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;
import { useState, useEffect } from 'react';
import { Brain, MessageCircle, Heart, Zap, Users, CheckCircle, ArrowRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TherapeuticAgent {
  id: number;
  name: string;
  type: string;
  description: string;
  specializations: string[];
  isActive: boolean;
}

interface AgentSession {
  id: number;
  userId: number;
  agentId: number;
  sessionType: string;
  objective: string;
  status: string;
  conversationHistory: any[];
  insights: any;
  recommendations: any;
}

interface AgentSystemProps {
  userId: number;
}

const agentIcons = {
  cbt: Brain,
  mindfulness: Heart,
  self_compassion: Users,
  anxiety: Zap,
};

const agentColors = {
  cbt: 'bg-blue-50 border-blue-200 text-blue-800',
  mindfulness: 'bg-green-50 border-green-200 text-green-800',
  self_compassion: 'bg-purple-50 border-purple-200 text-purple-800',
  anxiety: 'bg-orange-50 border-orange-200 text-orange-800',
};

function AgentSystem({ userId }: AgentSystemProps) {
  const [agents, setAgents] = useState<TherapeuticAgent[]>([]);
  const [activeSession, setActiveSession] = useState<AgentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [objective, setObjective] = useState('');
  const [showAgentSelection, setShowAgentSelection] = useState(false);

  useEffect(() => {
    loadAgents();
    checkActiveSession();
  }, [userId]);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkActiveSession = async () => {
    try {
      const response = await fetch(`/api/agents/session/${userId}`);
      const data = await response.json();
      if (data.hasActiveSession) {
        setActiveSession(data.session);
      }
    } catch (error) {
      console.error('Failed to check active session:', error);
    }
  };

  const startAgentSession = async (agentType: string, sessionObjective: string) => {
    setSessionLoading(true);
    try {
      const response = await fetch('/api/agents/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          agentType,
          objective: sessionObjective
        })
      });

      const data = await response.json();
      if (data.success) {
        setActiveSession(data.session);
        setShowAgentSelection(false);
        setSelectedAgent(null);
        setObjective('');
      }
    } catch (error) {
      console.error('Failed to start agent session:', error);
    } finally {
      setSessionLoading(false);
    }
  };

  const endSession = async () => {
    try {
      await fetch('/api/agents/end-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      setActiveSession(null);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleAgentSelection = (agentType: string) => {
    setSelectedAgent(agentType);
    
    // Set default objectives based on agent type
    const defaultObjectives = {
      cbt: 'identifying and working through negative thought patterns',
      mindfulness: 'learning stress reduction and grounding techniques',
      self_compassion: 'developing a kinder inner dialogue',
      anxiety: 'managing worry and developing coping strategies'
    };
    
    setObjective(defaultObjectives[agentType as keyof typeof defaultObjectives] || '');
  };

  const getAgentIcon = (type: string) => {
    const IconComponent = agentIcons[type as keyof typeof agentIcons] || Brain;
    return <IconComponent className="w-6 h-6" />;
  };

  const getAgentColorClass = (type: string) => {
    return agentColors[type as keyof typeof agentColors] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 theme-background min-h-screen">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold theme-text">Therapeutic Agent System</h2>
        <p className="theme-text-secondary text-sm">
          Connect with specialized AI agents for targeted therapeutic support
        </p>
      </div>

      {/* Active Session Display */}
      {activeSession && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getAgentIcon(activeSession.sessionType)}
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Active Session: {agents.find(a => a.type === activeSession.sessionType)?.name}
                  </h3>
                  <p className="text-sm text-blue-700">
                    Working on: {activeSession.objective}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={endSession}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <X className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </div>
            <div className="text-sm text-blue-800 bg-blue-100 p-3 rounded-lg">
              <p className="font-medium mb-2">Session Status: Active</p>
              <p>Continue your conversation in the main chat to work with this specialist.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Selection */}
      {!activeSession && (
        <>
          <div className="text-center">
            <Button 
              onClick={() => setShowAgentSelection(true)}
              className="theme-primary hover:theme-accent theme-text px-8 py-3"
            >
              <Brain className="w-5 h-5 mr-2" />
              Connect with Specialist
            </Button>
          </div>

          {showAgentSelection && (
            <Card className="theme-card border-[var(--theme-accent)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="theme-text">Choose Your Therapeutic Specialist</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAgentSelection(false)}
                    className="theme-text hover:theme-secondary border-[var(--theme-accent)]"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {agents.map((agent) => (
                    <Card 
                      key={agent.id}
                      className={`cursor-pointer transition-all theme-card border-2 ${
                        selectedAgent === agent.type 
                          ? 'ring-2 ring-[var(--theme-accent)] border-[var(--theme-accent)]' 
                          : 'border-[var(--theme-surface)] hover:border-[var(--theme-secondary)]'
                      }`}
                      onClick={() => handleAgentSelection(agent.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${getAgentColorClass(agent.type)}`}>
                            {getAgentIcon(agent.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold theme-text mb-1">
                              {agent.name}
                            </h3>
                            <p className="text-sm theme-text-secondary mb-3">
                              {agent.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {agent.specializations.map((spec, index) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary" 
                                  className="text-xs theme-surface theme-text border-[var(--theme-accent)]"
                                >
                                  {spec.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {selectedAgent === agent.type && (
                            <CheckCircle className="w-6 h-6 text-[var(--theme-accent)]" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedAgent && (
                  <div className="space-y-4 pt-4 border-t border-[var(--theme-accent)]/30">
                    <div>
                      <label className="block text-sm font-medium theme-text mb-2">
                        What would you like to work on?
                      </label>
                      <textarea
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        placeholder="Describe what you'd like to focus on in this session..."
                        className="w-full p-3 border border-silver hover:border-2 hover:animate-shimmer rounded-lg resize-none h-20 theme-surface theme-text placeholder:theme-text-secondary focus:outline-none focus:ring-2 focus:ring-[var(--theme-secondary)]"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedAgent(null)}
                        className="theme-text border-[var(--theme-accent)] hover:theme-secondary-light"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={() => startAgentSession(selectedAgent, objective)}
                        disabled={!objective.trim() || sessionLoading}
                        className="theme-primary hover:theme-accent theme-text"
                      >
                        {sessionLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <ArrowRight className="w-4 h-4 mr-2" />
                        )}
                        Start Session
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Available Agents Overview */}
      {!activeSession && !showAgentSelection && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold theme-text">Available Specialists</h3>
          <div className="grid gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="theme-card border-[var(--theme-accent)]">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${getAgentColorClass(agent.type)}`}>
                      {getAgentIcon(agent.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold theme-text mb-1">
                        {agent.name}
                      </h4>
                      <p className="text-sm theme-text-secondary mb-3">
                        {agent.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {agent.specializations.slice(0, 3).map((spec, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs theme-surface theme-text border-[var(--theme-accent)]"
                          >
                            {spec.replace('_', ' ')}
                          </Badge>
                        ))}
                        {agent.specializations.length > 3 && (
                          <Badge variant="secondary" className="text-xs theme-surface theme-text border-[var(--theme-accent)]">
                            +{agent.specializations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      {!activeSession && (
        <Card className="theme-card border-[var(--theme-accent)]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold theme-text mb-4">How the Agent System Works</h3>
            <div className="space-y-3 text-sm theme-text-secondary">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full theme-primary theme-text flex items-center justify-center text-xs font-bold">1</div>
                <p>The main bot analyzes your messages and suggests connecting with specialists when beneficial</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full theme-primary theme-text flex items-center justify-center text-xs font-bold">2</div>
                <p>Choose a specialist based on your needs (CBT, mindfulness, self-compassion, or anxiety)</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full theme-primary theme-text flex items-center justify-center text-xs font-bold">3</div>
                <p>Work one-on-one with the specialist through focused therapeutic conversations</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full theme-primary theme-text flex items-center justify-center text-xs font-bold">4</div>
                <p>The specialist automatically transfers you back to the main bot when objectives are met</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AgentSystem;
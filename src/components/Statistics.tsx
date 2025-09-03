import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import statisticsApiService from '../api_services/statistics.js';

interface StatisticData {
  id: string;
  name: string;
  pipeline: string;
  timelapse: { timestamp: string; value: number }[];
  is_polling: boolean;
  current_value: number;
  polling_frequency: number; // in seconds
}

interface PollingSettings {
  global_frequency: number; // in seconds
  auto_polling_enabled: boolean;
}

const pollingFrequencyOptions = [
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 900, label: '15 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 7200, label: '2 hours' },
  { value: 21600, label: '6 hours' },
  { value: 43200, label: '12 hours' },
  { value: 86400, label: '24 hours' },
];

const mockStatistics: StatisticData[] = [
  {
    id: '1',
    name: 'Active Users',
    pipeline: '[ { "$match": { "status": "active" } }, { "$count": "active_users" } ]',
    timelapse: [
      { timestamp: '2024-01-01T00:00:00Z', value: 1250 },
      { timestamp: '2024-01-02T00:00:00Z', value: 1340 },
      { timestamp: '2024-01-03T00:00:00Z', value: 1420 },
      { timestamp: '2024-01-04T00:00:00Z', value: 1380 },
      { timestamp: '2024-01-05T00:00:00Z', value: 1560 },
      { timestamp: '2024-01-06T00:00:00Z', value: 1620 },
      { timestamp: '2024-01-07T00:00:00Z', value: 1580 },
    ],
    is_polling: true,
    current_value: 1580,
    polling_frequency: 300 // 5 minutes
  },
  {
    id: '2',
    name: 'New Registrations',
    pipeline: '[ { "$match": { "created_at": { "$gte": "2024-01-01" } } }, { "$count": "new_registrations" } ]',
    timelapse: [
      { timestamp: '2024-01-01T00:00:00Z', value: 45 },
      { timestamp: '2024-01-02T00:00:00Z', value: 67 },
      { timestamp: '2024-01-03T00:00:00Z', value: 52 },
      { timestamp: '2024-01-04T00:00:00Z', value: 78 },
      { timestamp: '2024-01-05T00:00:00Z', value: 89 },
      { timestamp: '2024-01-06T00:00:00Z', value: 34 },
      { timestamp: '2024-01-07T00:00:00Z', value: 56 },
    ],
    is_polling: false,
    current_value: 56,
    polling_frequency: 1800 // 30 minutes
  },
  {
    id: '3',
    name: 'Daily Revenue',
    pipeline: '[ { "$match": { "type": "purchase", "date": { "$gte": "2024-01-01" } } }, { "$group": { "_id": null, "total": { "$sum": "$amount" } } } ]',
    timelapse: [
      { timestamp: '2024-01-01T00:00:00Z', value: 2450 },
      { timestamp: '2024-01-02T00:00:00Z', value: 3200 },
      { timestamp: '2024-01-03T00:00:00Z', value: 2800 },
      { timestamp: '2024-01-04T00:00:00Z', value: 3500 },
      { timestamp: '2024-01-05T00:00:00Z', value: 4100 },
      { timestamp: '2024-01-06T00:00:00Z', value: 2900 },
      { timestamp: '2024-01-07T00:00:00Z', value: 3800 },
    ],
    is_polling: true,
    current_value: 3800,
    polling_frequency: 600 // 10 minutes
  },
  {
    id: '4',
    name: 'Conversion Rate',
    pipeline: '[ { "$facet": { "total_visitors": [{ "$count": "count" }], "conversions": [{ "$match": { "converted": true } }, { "$count": "count" }] } }, { "$project": { "rate": { "$multiply": [{ "$divide": [{ "$arrayElemAt": ["$conversions.count", 0] }, { "$arrayElemAt": ["$total_visitors.count", 0] }] }, 100] } } } ]',
    timelapse: [
      { timestamp: '2024-01-01T00:00:00Z', value: 3.2 },
      { timestamp: '2024-01-02T00:00:00Z', value: 4.1 },
      { timestamp: '2024-01-03T00:00:00Z', value: 3.8 },
      { timestamp: '2024-01-04T00:00:00Z', value: 4.5 },
      { timestamp: '2024-01-05T00:00:00Z', value: 5.2 },
      { timestamp: '2024-01-06T00:00:00Z', value: 4.8 },
      { timestamp: '2024-01-07T00:00:00Z', value: 5.1 },
    ],
    is_polling: false,
    current_value: 5.1,
    polling_frequency: 3600 // 1 hour
  }
];

export function Statistics() {
  const [statistics, setStatistics] = useState<StatisticData[]>([]);
  const [expandedGraph, setExpandedGraph] = useState<string | null>(null);
  const [isCreatingStats, setIsCreatingStats] = useState(false);
  const [newStatsData, setNewStatsData] = useState({
    name: '',
    pipeline: '',
    polling_frequency: 300
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Pipeline editing state
  const [editingPipeline, setEditingPipeline] = useState<string | null>(null);
  const [editPipelineValue, setEditPipelineValue] = useState('');

  // Polling settings
  const [pollingSettings, setPollingSettings] = useState<PollingSettings>({
    global_frequency: 300, // 5 minutes default
    auto_polling_enabled: true
  });

  // Polling timers
  const [pollingTimers, setPollingTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Load initial data
  useEffect(() => {
    loadInitialData();
    // Clear existing timers when component unmounts
    return () => {
      pollingTimers.forEach(timer => clearInterval(timer));
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Loading initial statistics data...');
      const response = await statisticsApiService.get_all_statistics();
      console.log('✅ Initial statistics data loaded:', response);
      
      if (response.code === 200 && response.data && response.data.statistics) {
        setStatistics(response.data.statistics || []);
        
        // Load polling settings
        const pollingResponse = await statisticsApiService.get_polling_frequency();
        if (pollingResponse.code === 200 && pollingResponse.data) {
          setPollingSettings({
            global_frequency: pollingResponse.data.global_frequency || 300,
            auto_polling_enabled: pollingResponse.data.auto_polling_enabled ?? true
          });
        }
      } else {
        setError('Failed to load statistics data');
      }
    } catch (err) {
      console.error('❌ Error loading statistics data:', err);
      setError('Error loading statistics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Update polling timers when settings change
    if (pollingSettings.auto_polling_enabled) {
      setupPollingTimers();
    } else {
      clearAllPollingTimers();
    }
  }, [pollingSettings, statistics]);

  const setupPollingTimers = () => {
    // Clear existing timers
    clearAllPollingTimers();
    
    const newTimers = new Map();
    
    // Add null check to prevent forEach error when statistics is undefined
    if (statistics && Array.isArray(statistics)) {
      statistics.forEach(stat => {
        if (stat.is_polling) {
          const frequency = stat.polling_frequency * 1000; // Convert to milliseconds
          const timer = setInterval(() => {
            console.log(`Polling data for ${stat.name} every ${stat.polling_frequency} seconds`);
            // In a real app, this would fetch new data from the MongoDB pipeline
            simulateDataFetch(stat.id);
          }, frequency);
          
          newTimers.set(stat.id, timer);
        }
      });
    }
    
    setPollingTimers(newTimers);
  };

  const clearAllPollingTimers = () => {
    pollingTimers.forEach(timer => clearInterval(timer));
    setPollingTimers(new Map());
  };

  const simulateDataFetch = (statId: string) => {
    setStatistics(prev => prev.map(stat => {
      if (stat.id === statId) {
        // Simulate new data point
        const newValue = stat.current_value + (Math.random() - 0.5) * (stat.current_value * 0.1);
        const roundedValue = Math.round(newValue * 100) / 100;
        
        const newDataPoint = {
          timestamp: new Date().toISOString(),
          value: roundedValue
        };
        
        return {
          ...stat,
          current_value: roundedValue,
          timelapse: [...stat.timelapse.slice(-6), newDataPoint] // Keep last 7 points
        };
      }
      return stat;
    }));
  };

  const handleTogglePolling = (id: string) => {
    setStatistics(prev => 
      prev.map(stat => 
        stat.id === id 
          ? { ...stat, is_polling: !stat.is_polling }
          : stat
      )
    );
    console.log(`Toggled polling for statistic ${id}`);
  };

  const handleUpdatePollingFrequency = (id: string, frequency: number) => {
    setStatistics(prev => 
      prev.map(stat => 
        stat.id === id 
          ? { ...stat, polling_frequency: frequency }
          : stat
      )
    );
    console.log(`Updated polling frequency for statistic ${id} to ${frequency} seconds`);
  };

  const handleDeleteStats = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this statistic?')) {
      try {
        setSaving(true);
        setError(null);
        
        console.log('🚀 Deleting statistic:', id);
        const response = await statisticsApiService.delete_custom_metric(id);
        console.log('✅ Statistic deleted:', response);
        
        if (response.code === 200) {
          setStatistics(prev => prev.filter(stat => stat.id !== id));
        } else {
          setError('Failed to delete statistic');
        }
      } catch (err) {
        console.error('❌ Error deleting statistic:', err);
        setError('Error deleting statistic');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleExpandGraph = (id: string) => {
    setExpandedGraph(expandedGraph === id ? null : id);
  };

  const handleStartCreateStats = () => {
    setIsCreatingStats(true);
    setNewStatsData({ name: '', pipeline: '', polling_frequency: pollingSettings.global_frequency });
    setDialogOpen(true);
  };

  const handleCancelCreateStats = () => {
    setIsCreatingStats(false);
    setNewStatsData({ name: '', pipeline: '', polling_frequency: pollingSettings.global_frequency });
    setDialogOpen(false);
  };

  const handleUploadStats = async () => {
    if (!newStatsData.name.trim() || !newStatsData.pipeline.trim()) {
      alert('Please fill in both name and pipeline fields');
      return;
    }

    // Validate JSON pipeline format
    try {
      JSON.parse(newStatsData.pipeline);
    } catch (error) {
      alert('Invalid JSON format in pipeline. Please check your syntax.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const newStats = {
        name: newStatsData.name.trim(),
        pipeline: newStatsData.pipeline.trim(),
        is_polling: false,
        polling_frequency: newStatsData.polling_frequency
      };
      
      console.log('🚀 Creating new statistic:', newStats);
      const response = await statisticsApiService.create_custom_metric(newStats);
      console.log('✅ New statistic created:', response);
      
      if (response.code === 200) {
        setStatistics(prev => [...prev, response.data.statistic]);
        setIsCreatingStats(false);
        setNewStatsData({ name: '', pipeline: '', polling_frequency: pollingSettings.global_frequency });
        setDialogOpen(false);
      } else {
        setError('Failed to create statistic');
      }
    } catch (err) {
      console.error('❌ Error creating statistic:', err);
      setError('Error creating statistic');
    } finally {
      setSaving(false);
    }
  };

  // Pipeline editing handlers
  const handleStartEditPipeline = (id: string, currentPipeline: string) => {
    setEditingPipeline(id);
    setEditPipelineValue(currentPipeline);
  };

  const handleSavePipeline = () => {
    if (!editingPipeline) return;

    // Validate JSON format
    try {
      JSON.parse(editPipelineValue);
    } catch (error) {
      alert('Invalid JSON format in pipeline. Please check your syntax.');
      return;
    }

    setStatistics(prev => 
      prev.map(stat => 
        stat.id === editingPipeline 
          ? { ...stat, pipeline: editPipelineValue.trim() }
          : stat
      )
    );
    
    setEditingPipeline(null);
    setEditPipelineValue('');
    console.log(`Updated pipeline for statistic ${editingPipeline}`);
  };

  const handleCancelEditPipeline = () => {
    setEditingPipeline(null);
    setEditPipelineValue('');
  };

  const formatValue = (value: number, name: string) => {
    if (name.toLowerCase().includes('revenue')) {
      return `$${value.toLocaleString()}`;
    }
    if (name.toLowerCase().includes('rate')) {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getFrequencyLabel = (seconds: number) => {
    const option = pollingFrequencyOptions.find(opt => opt.value === seconds);
    return option ? option.label : `${seconds}s`;
  };

  const renderStatsCard = (stat: StatisticData) => {
    return (
      <Card key={stat.id} className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{stat.name}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Polling</span>
                <Switch
                  checked={stat.is_polling}
                  onCheckedChange={() => handleTogglePolling(stat.id)}
                  disabled={!pollingSettings.auto_polling_enabled}
                />
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteStats(stat.id)}
                title="Delete statistic"
              >
                <span className="text-base">🗑️</span>
              </Button>
            </div>
          </div>
          
          {/* Polling Frequency Control */}
          {stat.is_polling && (
            <div className="flex items-center gap-2 mt-2">
              <Label className="text-xs text-muted-foreground">Frequency:</Label>
              <Select
                value={stat.polling_frequency.toString()}
                onValueChange={(value) => handleUpdatePollingFrequency(stat.id, parseInt(value))}
                disabled={!pollingSettings.auto_polling_enabled}
              >
                <SelectTrigger className="w-32 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pollingFrequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Value Display */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {formatValue(stat.current_value, stat.name)}
            </div>
            <div className="text-sm text-muted-foreground">Current Value</div>
            {stat.is_polling && pollingSettings.auto_polling_enabled && (
              <div className="text-xs text-muted-foreground mt-1">
                Updates every {getFrequencyLabel(stat.polling_frequency)}
              </div>
            )}
          </div>

          {/* Mini Graph - with visible dots */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stat.timelapse}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTimestamp}
                  fontSize={10}
                />
                <YAxis fontSize={10} />
                <Tooltip 
                  labelFormatter={(value) => formatTimestamp(value)}
                  formatter={(value: number) => [formatValue(value, stat.name), 'Value']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 1, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Expand Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExpandGraph(stat.id)}
            className="w-full"
          >
            <span className="text-base mr-2">📈</span>
            {expandedGraph === stat.id ? 'Collapse Graph' : 'Expand Graph'}
          </Button>

          {/* Expanded Graph */}
          {expandedGraph === stat.id && (
            <div className="mt-4 p-4 border rounded-lg bg-card">
              <h4 className="font-medium mb-3">Detailed Timelapse - {stat.name}</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stat.timelapse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTimestamp}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                      formatter={(value: number) => [formatValue(value, stat.name), 'Value']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Pipeline Display with Edit Functionality */}
              <div className="mt-4 p-3 bg-muted rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">MongoDB Pipeline:</div>
                  {editingPipeline !== stat.id && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStartEditPipeline(stat.id, stat.pipeline)}
                    >
                      <span className="text-base mr-1">✏️</span>
                      Edit
                    </Button>
                  )}
                </div>
                
                {editingPipeline === stat.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editPipelineValue}
                      onChange={(e) => setEditPipelineValue(e.target.value)}
                      className="min-h-32 font-mono text-sm"
                      rows={8}
                      placeholder="Enter MongoDB pipeline as JSON array"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSavePipeline}>
                        <span className="text-base mr-1">💾</span>
                        Save Pipeline
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEditPipeline}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(JSON.parse(stat.pipeline), null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderAddStatsCard = () => {
    return (
      <Card className="h-fit border-2 border-dashed border-muted-foreground/50 hover:border-muted-foreground/80 transition-colors cursor-pointer" onClick={handleStartCreateStats}>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="text-6xl text-muted-foreground mb-4">+</div>
          <p className="text-sm text-muted-foreground text-center">Add New Stats</p>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-muted-foreground">Loading statistics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2">❌</div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadInitialData}>
              <span className="text-base mr-2">🔄</span>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Additional safety check - don't render if still loading or no data ready
  if (loading || !statistics || !Array.isArray(statistics)) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-muted-foreground">Preparing statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium">Statistics Dashboard</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-base">📊</span>
            {(statistics || []).filter(s => s.is_polling).length} of {(statistics || []).length} stats actively polling
          </div>
          <Button onClick={loadInitialData} variant="outline" size="sm">
            <span className="text-base mr-1">🔄</span>
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <span className="text-base mr-1">⚙️</span>
            Polling Settings
          </Button>
        </div>
      </div>
      
      {/* Global Polling Status */}
      {!pollingSettings.auto_polling_enabled && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-base">⚠️</span>
            <span>Auto-polling is disabled. Enable it in Polling Settings to start automatic data updates.</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4">
        {(statistics || []).map(renderStatsCard)}
        {renderAddStatsCard()}
      </div>

      {/* Create New Stats Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Statistic</DialogTitle>
            <DialogDescription>
              Define a MongoDB pipeline to create a new statistic. The pipeline should return a numerical value.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label>Statistic Name</Label>
              <Input
                value={newStatsData.name}
                onChange={(e) => setNewStatsData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Active Users, Daily Revenue"
                className="w-full"
              />
            </div>

            {/* Polling Frequency Field */}
            <div className="space-y-2">
              <Label>Default Polling Frequency</Label>
              <Select
                value={newStatsData.polling_frequency.toString()}
                onValueChange={(value) => setNewStatsData(prev => ({ ...prev, polling_frequency: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pollingFrequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pipeline Field */}
            <div className="space-y-2">
              <Label>MongoDB Pipeline (JSON Array)</Label>
              <Textarea
                value={newStatsData.pipeline}
                onChange={(e) => setNewStatsData(prev => ({ ...prev, pipeline: e.target.value }))}
                placeholder='[{"$match": {"status": "active"}}, {"$count": "total"}]'
                className="min-h-32 font-mono text-sm"
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Enter a valid MongoDB aggregation pipeline as a JSON array. The pipeline should return a numerical result.
              </p>
            </div>

            {/* Pipeline Examples */}
            <div className="p-3 bg-muted rounded">
              <div className="text-sm font-medium mb-2">Example Pipelines:</div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>
                  <strong>Count documents:</strong><br/>
                  <code>[{`{"$count": "total"}`}]</code>
                </div>
                <div>
                  <strong>Sum values:</strong><br/>
                  <code>[{`{"$group": {"_id": null, "total": {"$sum": "$amount"}}}`}]</code>
                </div>
                <div>
                  <strong>Average calculation:</strong><br/>
                  <code>[{`{"$group": {"_id": null, "avg": {"$avg": "$score"}}}`}]</code>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleUploadStats} className="flex-1">
                <span className="text-base mr-2">📤</span>
                Upload
              </Button>
              <Button variant="outline" onClick={handleCancelCreateStats} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Polling Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-base">⚙️</span>
              Polling Settings
            </DialogTitle>
            <DialogDescription>
              Configure global polling behavior for all statistics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Auto Polling Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Enable Auto-Polling</Label>
                <Switch
                  checked={pollingSettings.auto_polling_enabled}
                  onCheckedChange={(checked) => setPollingSettings(prev => ({ ...prev, auto_polling_enabled: checked }))}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, statistics will automatically fetch new data at their configured intervals.
              </p>
            </div>

            {/* Global Default Frequency */}
            <div className="space-y-3">
              <Label>Default Polling Frequency</Label>
              <Select
                value={pollingSettings.global_frequency.toString()}
                onValueChange={(value) => setPollingSettings(prev => ({ ...prev, global_frequency: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pollingFrequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This frequency will be used as the default for new statistics.
              </p>
            </div>

            {/* Current Polling Status */}
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Current Status</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Auto-polling: {pollingSettings.auto_polling_enabled ? 'Enabled' : 'Disabled'}</p>
                <p>Default frequency: {getFrequencyLabel(pollingSettings.global_frequency)}</p>
                <p>Active polls: {statistics.filter(s => s.is_polling).length}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => setSettingsOpen(false)} className="flex-1">
                <span className="text-base mr-2">💾</span>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import settingsApiService from '../api_services/settings.js';

interface Settings {
  id: string;
  name: string;
  description?: string;
  coin_config: {
    initial_free_coins: number;
  };
  message_config: {
    cost_per_message: number;
    initial_free_messages: number;
  };
  match_config: {
    cost_per_match: number;
    initial_free_matches: number;
    daily_free_matches: number;
  };
  is_active: boolean;
  is_default: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface NewSettingsData {
  name: string;
  description?: string;
  coin_config: {
    initial_free_coins: number;
  };
  message_config: {
    cost_per_message: number;
    initial_free_messages: number;
  };
  match_config: {
    cost_per_match: number;
    initial_free_matches: number;
    daily_free_matches: number;
  };
  metadata?: Record<string, any>;
}

export function Settings() {
  const [settingsList, setSettingsList] = useState<Settings[]>([]);
  const [selectedSettingsId, setSelectedSettingsId] = useState<string | null>(null);
  const [activeSettings, setActiveSettings] = useState<Settings | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
  const [newSettings, setNewSettings] = useState<NewSettingsData>({
    name: '',
    description: '',
    coin_config: {
      initial_free_coins: 100
    },
    message_config: {
      cost_per_message: 10,
      initial_free_messages: 0
    },
    match_config: {
      cost_per_match: 5,
      initial_free_matches: 5,
      daily_free_matches: 1
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Get currently selected or active settings
  const currentSettings = selectedSettingsId 
    ? settingsList.find(s => s.id === selectedSettingsId) 
    : activeSettings;

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Loading settings data...');
      
      // Load all settings and active settings in parallel
      const [allSettingsResponse, activeSettingsResponse] = await Promise.all([
        settingsApiService.getAllSettings(50, 0), // Get first 50 settings
        settingsApiService.getActiveSettings().catch(() => null) // Don't fail if no active settings
      ]);
      
      console.log('✅ Settings data loaded:', { allSettingsResponse, activeSettingsResponse });
      
      if (allSettingsResponse.success && allSettingsResponse.data?.settings) {
        setSettingsList(allSettingsResponse.data.settings);
      }
      
      if (activeSettingsResponse?.success && activeSettingsResponse.data) {
        setActiveSettings(activeSettingsResponse.data);
        setSelectedSettingsId(activeSettingsResponse.data.id);
      } else if (allSettingsResponse.data?.settings?.length > 0) {
        // If no active settings, select the first one
        setSelectedSettingsId(allSettingsResponse.data.settings[0].id);
      }
    } catch (err) {
      console.error('❌ Error loading settings data:', err);
      setError('Error loading settings data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(typeof currentValue === 'string' ? currentValue : currentValue.toString());
  };

  const handleEditSave = async () => {
    if (!editingField || !currentSettings) return;

    try {
      setSaving(true);
      
      let processedValue: any = editValue;
      
      // Handle nested field paths (e.g., "coin_config.initial_free_coins")
      if (editingField.includes('.')) {
        const [parent, child] = editingField.split('.');
        if (['coin_config', 'message_config', 'match_config'].includes(parent)) {
          const numericValue = parseInt(editValue);
          if (isNaN(numericValue) || numericValue < 0) {
            alert('Please enter a valid positive number');
            return;
          }
          processedValue = numericValue;
          
          // Create the nested update structure
          const updateData = {
            [parent]: {
              ...currentSettings[parent as keyof Settings],
              [child]: processedValue
            }
          };
          
          const response = await settingsApiService.updateSettings(currentSettings.id, updateData);
          
          if (response.success) {
            await loadInitialData();
            setEditingField(null);
            setEditValue('');
            alert('Setting updated successfully!');
          } else {
            setError('Failed to update setting');
          }
          return;
        }
      }
      
      // Handle simple fields (name, description, etc.)
      const updateData = { [editingField]: processedValue };
      const response = await settingsApiService.updateSettings(currentSettings.id, updateData);
      
      if (response.success) {
        await loadInitialData();
        setEditingField(null);
        setEditValue('');
        alert('Setting updated successfully!');
      } else {
        setError('Failed to update setting');
      }
    } catch (err) {
      console.error('❌ Error updating setting:', err);
      setError('Error updating setting');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleCreateSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (!newSettings.name.trim()) {
        alert('Please enter a settings name');
        return;
      }
      
      console.log('🚀 Creating new settings:', newSettings);
      const response = await settingsApiService.createSettings(newSettings);
      console.log('✅ Settings created:', response);
      
      if (response.success && response.data) {
        // Ask if user wants to activate immediately
        const shouldActivate = window.confirm('Settings created successfully! Do you want to activate it now?');
        
        if (shouldActivate) {
          await settingsApiService.activateSettings(response.data.id);
          alert('Settings created and activated successfully!');
        } else {
          alert('Settings created successfully!');
        }
        
        // Reset form and refresh data
        setNewSettings({
          name: '',
          description: '',
          coin_config: {
            initial_free_coins: 100
          },
          message_config: {
            cost_per_message: 10,
            initial_free_messages: 0
          },
          match_config: {
            cost_per_match: 5,
            initial_free_matches: 5,
            daily_free_matches: 1
          }
        });
        setMode('view');
        await loadInitialData();
      } else {
        setError('Failed to create settings');
      }
    } catch (err) {
      console.error('❌ Error creating settings:', err);
      setError('Error creating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleActivateSettings = async (settingsId: string) => {
    try {
      setSaving(true);
      setError(null);
      
      console.log('🚀 Activating settings:', settingsId);
      const response = await settingsApiService.activateSettings(settingsId);
      console.log('✅ Settings activated:', response);
      
      if (response.success) {
        alert('Settings activated successfully!');
        await loadInitialData();
      } else {
        setError('Failed to activate settings');
      }
    } catch (err) {
      console.error('❌ Error activating settings:', err);
      setError('Error activating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultSettings = async (settingsId: string) => {
    try {
      setSaving(true);
      setError(null);
      
      console.log('🚀 Setting default settings:', settingsId);
      const response = await settingsApiService.setDefaultSettings(settingsId);
      console.log('✅ Default settings set:', response);
      
      if (response.success) {
        alert('Default settings updated successfully!');
        await loadInitialData();
      } else {
        setError('Failed to set default settings');
      }
    } catch (err) {
      console.error('❌ Error setting default settings:', err);
      setError('Error setting default settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSettings = async (settingsId: string) => {
    if (window.confirm('Are you sure you want to delete these settings? This action cannot be undone.')) {
      try {
        setSaving(true);
        setError(null);
        
        console.log('🚀 Deleting settings:', settingsId);
        const response = await settingsApiService.deleteSettings(settingsId);
        console.log('✅ Settings deleted:', response);
        
        if (response.success) {
          alert('Settings deleted successfully!');
          await loadInitialData();
          if (selectedSettingsId === settingsId) {
            setSelectedSettingsId(null);
          }
        } else {
          setError('Failed to delete settings');
        }
      } catch (err) {
        console.error('❌ Error deleting settings:', err);
        setError('Error deleting settings');
      } finally {
        setSaving(false);
      }
    }
  };

  const getFieldDisplayValue = (field: string, value: any) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    switch (field) {
      case 'coin_config.initial_free_coins':
        return `${value} coins`;
      case 'message_config.cost_per_message':
        return `${value} coins per message`;
      case 'match_config.cost_per_match':
        return `${value} coins per match/swipe`;
      case 'match_config.initial_free_matches':
        return `${value} free matches`;
      case 'match_config.daily_free_matches':
        return `${value} matches per day`;
      case 'message_config.initial_free_messages':
        return `${value} free messages`;
      default:
        return value?.toString() || '';
    }
  };

  const renderEditableField = (
    field: string,
    label: string,
    value: any,
    description: string,
    icon: string,
    fieldType: 'number' | 'text' | 'textarea' = 'number'
  ) => {
    const isEditing = editingField === field;
    const isReadonly = ['id', 'created_at', 'updated_at', 'is_active', 'is_default'].includes(field);

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-xl">{icon}</span>
            {label}
            {field === 'is_active' && value && <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">ACTIVE</span>}
            {field === 'is_default' && value && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">DEFAULT</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{description}</p>
            
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3 flex-1">
                <Label className="text-sm font-medium min-w-fit">Current Value:</Label>
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    {fieldType === 'textarea' ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="min-w-48"
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="max-w-48"
                        type={fieldType}
                        min={fieldType === 'number' ? "0" : undefined}
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    )}
                    <Button size="sm" onClick={handleEditSave} disabled={saving}>
                      <span className="text-base mr-1">{saving ? '⏳' : '💾'}</span>
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleEditCancel}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-xl font-bold text-primary">
                      {getFieldDisplayValue(field, value)}
                    </span>
                    {!isReadonly && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditStart(field, value)}
                        className="ml-auto"
                        disabled={saving || !currentSettings}
                      >
                        <span className="text-base mr-1">✏️</span>
                        Edit
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
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
            <p className="text-muted-foreground">Loading app settings...</p>
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

  if (mode === 'create') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-medium">Create New Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure new application parameters
            </p>
          </div>
          <Button variant="outline" onClick={() => setMode('view')}>
            <span className="text-base mr-1">←</span>
            Back to Settings
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Settings Name *</Label>
                <Input
                  id="name"
                  value={newSettings.name}
                  onChange={(e) => setNewSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter settings name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSettings.description || ''}
                  onChange={(e) => setNewSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter settings description"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost_per_message">Cost Per Message (coins)</Label>
                  <Input
                    id="cost_per_message"
                    type="number"
                    min="0"
                    value={newSettings.message_config.cost_per_message}
                    onChange={(e) => setNewSettings(prev => ({ 
                      ...prev, 
                      message_config: {
                        ...prev.message_config,
                        cost_per_message: parseInt(e.target.value) || 0
                      }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cost_per_match">Cost Per Match/Swipe (coins)</Label>
                  <Input
                    id="cost_per_match"
                    type="number"
                    min="0"
                    value={newSettings.match_config.cost_per_match}
                    onChange={(e) => setNewSettings(prev => ({ 
                      ...prev, 
                      match_config: {
                        ...prev.match_config,
                        cost_per_match: parseInt(e.target.value) || 0
                      }
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Free Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="initial_free_coins">Initial Free Coins</Label>
                  <Input
                    id="initial_free_coins"
                    type="number"
                    min="0"
                    value={newSettings.coin_config.initial_free_coins}
                    onChange={(e) => setNewSettings(prev => ({ 
                      ...prev, 
                      coin_config: {
                        ...prev.coin_config,
                        initial_free_coins: parseInt(e.target.value) || 0
                      }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="initial_free_matches">Initial Free Matches</Label>
                  <Input
                    id="initial_free_matches"
                    type="number"
                    min="0"
                    value={newSettings.match_config.initial_free_matches}
                    onChange={(e) => setNewSettings(prev => ({ 
                      ...prev, 
                      match_config: {
                        ...prev.match_config,
                        initial_free_matches: parseInt(e.target.value) || 0
                      }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="initial_free_messages">Initial Free Messages</Label>
                  <Input
                    id="initial_free_messages"
                    type="number"
                    min="0"
                    value={newSettings.message_config.initial_free_messages}
                    onChange={(e) => setNewSettings(prev => ({ 
                      ...prev, 
                      message_config: {
                        ...prev.message_config,
                        initial_free_messages: parseInt(e.target.value) || 0
                      }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="daily_free_matches">Daily Free Matches</Label>
                  <Input
                    id="daily_free_matches"
                    type="number"
                    min="0"
                    value={newSettings.match_config.daily_free_matches}
                    onChange={(e) => setNewSettings(prev => ({ 
                      ...prev, 
                      match_config: {
                        ...prev.match_config,
                        daily_free_matches: parseInt(e.target.value) || 0
                      }
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleCreateSettings} disabled={saving || !newSettings.name.trim()}>
              <span className="text-base mr-2">{saving ? '⏳' : '💾'}</span>
              {saving ? 'Creating...' : 'Create Settings'}
            </Button>
            <Button variant="outline" onClick={() => setMode('view')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-medium">App Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure application parameters and pricing
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => setMode('create')}>
            <span className="text-base mr-1">➕</span>
            Create New Settings
          </Button>
        </div>
      </div>
      
      {/* Settings Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            Settings Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="settings-select">Choose Settings to View/Edit:</Label>
              <Select value={selectedSettingsId || ''} onValueChange={setSelectedSettingsId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select settings configuration" />
                </SelectTrigger>
                <SelectContent>
                  {settingsList.map((settings) => (
                    <SelectItem key={settings.id} value={settings.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{settings.name}</span>
                        <div className="flex gap-1 ml-2">
                          {settings.is_active && <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">ACTIVE</span>}
                          {settings.is_default && <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">DEFAULT</span>}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {currentSettings && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => handleActivateSettings(currentSettings.id)}
                  disabled={currentSettings.is_active || saving}
                >
                  <span className="text-base mr-1">🟢</span>
                  {currentSettings.is_active ? 'Already Active' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSetDefaultSettings(currentSettings.id)}
                  disabled={currentSettings.is_default || saving}
                >
                  <span className="text-base mr-1">⭐</span>
                  {currentSettings.is_default ? 'Already Default' : 'Set as Default'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteSettings(currentSettings.id)}
                  disabled={currentSettings.is_active || saving}
                >
                  <span className="text-base mr-1">🗑️</span>
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {currentSettings ? (
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="text-xl">📝</span>
              Basic Information
            </h3>
            
            {renderEditableField(
              'name',
              'Settings Name',
              currentSettings.name,
              'A descriptive name for this settings configuration.',
              '🏷️',
              'text'
            )}
            
            {renderEditableField(
              'description',
              'Description',
              currentSettings.description || '',
              'Optional description explaining when to use these settings.',
              '📄',
              'textarea'
            )}
          </div>

          {/* Status Fields */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span>
              Status Information
            </h3>
            
            {renderEditableField(
              'is_active',
              'Active Status',
              currentSettings.is_active,
              'Whether this settings configuration is currently active and being used.',
              '🟢'
            )}
            
            {renderEditableField(
              'is_default',
              'Default Status',
              currentSettings.is_default,
              'Whether this is the default settings configuration for new instances.',
              '⭐'
            )}
          </div>

          {/* Coin Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="text-xl">🪙</span>
              Coin Economy Settings
            </h3>
            
            {renderEditableField(
              'coin_config.initial_free_coins',
              'Initial Free Coins',
              currentSettings.coin_config.initial_free_coins,
              'Number of free coins given to new users when they sign up for the first time.',
              '🎁'
            )}

            {renderEditableField(
              'match_config.cost_per_match',
              'Cost Per Match/Swipe',
              currentSettings.match_config.cost_per_match,
              'Number of coins users spend to create a new match or perform a swipe action.',
              '💝'
            )}
          </div>

          {/* Pricing Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="text-xl">💰</span>
              Message Pricing
            </h3>
            
            {renderEditableField(
              'message_config.cost_per_message',
              'Cost Per Message',
              currentSettings.message_config.cost_per_message,
              'Number of coins users spend to send one message to their matches.',
              '💬'
            )}
          </div>

          {/* Match Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="text-xl">💕</span>
              Matching & Free Resources
            </h3>
            
            {renderEditableField(
              'match_config.initial_free_matches',
              'Initial Free Matches',
              currentSettings.match_config.initial_free_matches,
              'Number of free matches/swipes given to new users when they first sign up.',
              '🎁'
            )}

            {renderEditableField(
              'match_config.daily_free_matches',
              'Daily Free Matches',
              currentSettings.match_config.daily_free_matches,
              'Number of free matches/swipes users receive every day to keep them engaged.',
              '📅'
            )}
            
            {renderEditableField(
              'message_config.initial_free_messages',
              'Initial Free Messages',
              currentSettings.message_config.initial_free_messages,
              'Number of free messages given to new users when they first sign up.',
              '💌'
            )}
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="text-xl">⏰</span>
              Timestamps
            </h3>
            
            {renderEditableField(
              'created_at',
              'Created At',
              new Date(currentSettings.created_at).toLocaleString(),
              'When this settings configuration was created.',
              '📅'
            )}
            
            {renderEditableField(
              'updated_at',
              'Last Updated',
              new Date(currentSettings.updated_at).toLocaleString(),
              'When this settings configuration was last modified.',
              '🔄'
            )}
          </div>

          {/* Current Settings Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                Settings Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentSettings.coin_config.initial_free_coins}</div>
                  <div className="text-sm text-muted-foreground">Initial Free Coins</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentSettings.match_config.cost_per_match}</div>
                  <div className="text-sm text-muted-foreground">Coins per Match/Swipe</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentSettings.message_config.cost_per_message}</div>
                  <div className="text-sm text-muted-foreground">Coins per Message</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentSettings.match_config.initial_free_matches}</div>
                  <div className="text-sm text-muted-foreground">Initial Free Matches</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentSettings.match_config.daily_free_matches}</div>
                  <div className="text-sm text-muted-foreground">Daily Free Matches</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">{currentSettings.message_config.initial_free_messages}</div>
                  <div className="text-sm text-muted-foreground">Initial Free Messages</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={loadInitialData}
              disabled={saving}
            >
              <span className="text-base mr-1">🔄</span>
              Refresh
            </Button>
          </div>

          {/* Settings Information */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="text-base">ℹ️</span>
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Changes to settings will affect all users immediately after activation</p>
                <p>• Use "Activate" to make a settings configuration active for all users</p>
                <p>• Use "Set as Default" to make settings the default for new app instances</p>
                <p>• Active settings cannot be deleted - deactivate first if needed</p>
                <p>• Coin costs control the app's monetization and user spending patterns</p>
                <p>• Free resources (coins, matches, messages) impact user onboarding and retention</p>
                <p>• Match/swipe costs create engagement friction and encourage thoughtful interactions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No settings selected</p>
          <p className="text-sm text-muted-foreground">
            {settingsList.length === 0 
              ? 'No settings configurations found. Create your first one above.' 
              : 'Please select a settings configuration from the dropdown above.'}
          </p>
        </div>
      )}
    </div>
  );
}
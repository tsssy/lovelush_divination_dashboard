import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import campaignApiService from '../api_services/campaign.js';

interface CountdownConfig {
  show: boolean;
  time: string;
  position: 'top' | 'bottom' | 'center';
}

interface ButtonAction {
  type: 'pay' | 'navigate' | 'close' | 'external';
  value: string;
}

interface ButtonStyle {
  color: string;
  textStyle: 'normal' | 'bold' | 'italic';
  textSize: string;
}

interface ButtonConfig {
  text: string;
  position: 'top' | 'bottom' | 'center';
  action: ButtonAction;
  style: ButtonStyle;
}

interface DisplayProperties {
  backgroundImageUrl: string;
  closeOnOutsideClick: boolean;
  cancelButtonPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  countdown: CountdownConfig;
  button: ButtonConfig;
}

interface RangeFilter {
  lower_bound: number | null;
  upper_bound: number | null;
}

interface UserFilter {
  number_of_messages?: RangeFilter;
  paid_amount_stars?: RangeFilter;
}

interface Campaign {
  campaign_id: string;
  is_active: boolean;
  description: string;
  number_of_impression: number;
  number_of_clicks: number;
  number_of_payment: number;
  user_filter: UserFilter;
  page_to_push: string;
  telegram_schedule_time?: string;
  display_properties: DisplayProperties;
}

const pageToPushOptions = [
  { value: '1', label: 'New Match' },
  { value: '2', label: 'Messages' },
  { value: '3', label: 'Shop' },
  { value: '4', label: 'Chatscreen' },
  { value: '5', label: 'Profile' },
  { value: '6', label: 'Telegram notification' },
];

const mockCampaigns: Campaign[] = [
  {
    campaign_id: "flash_sale_01",
    is_active: true,
    description: "Limited time flash sale with 50% discount on premium features",
    number_of_impression: 12847,
    number_of_clicks: 1562,
    number_of_payment: 234,
    user_filter: {
      number_of_messages: {
        lower_bound: 50,
        upper_bound: 500
      },
      paid_amount_stars: {
        lower_bound: null,
        upper_bound: 100
      }
    },
    page_to_push: "3",
    display_properties: {
      backgroundImageUrl: "https://images.unsplash.com/photo-1607703703520-bb638e84caf2?w=400",
      closeOnOutsideClick: true,
      cancelButtonPosition: "top-right",
      countdown: {
        show: true,
        time: "2025-08-25T21:00:00Z",
        position: "top"
      },
      button: {
        text: "Buy Now!",
        position: "bottom",
        action: {
          type: "pay",
          value: "product_12345"
        },
        style: {
          color: "#E53935",
          textStyle: "bold",
          textSize: "18px"
        }
      }
    }
  },
  {
    campaign_id: "valentine_special_02",
    is_active: true,
    description: "Valentine's Day special campaign with romantic boost packages",
    number_of_impression: 8934,
    number_of_clicks: 892,
    number_of_payment: 156,
    user_filter: {
      number_of_messages: {
        lower_bound: null,
        upper_bound: 10
      }
    },
    page_to_push: "1",
    display_properties: {
      backgroundImageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400",
      closeOnOutsideClick: false,
      cancelButtonPosition: "top-left",
      countdown: {
        show: true,
        time: "2025-02-14T23:59:59Z",
        position: "center"
      },
      button: {
        text: "Find Love ❤️",
        position: "bottom",
        action: {
          type: "navigate",
          value: "/boost-packages"
        },
        style: {
          color: "#E91E63",
          textStyle: "bold",
          textSize: "16px"
        }
      }
    }
  },
  {
    campaign_id: "telegram_reminder_03",
    is_active: false,
    description: "Daily reminder via Telegram to check new matches",
    number_of_impression: 5672,
    number_of_clicks: 423,
    number_of_payment: 89,
    user_filter: {
      paid_amount_stars: {
        lower_bound: 500,
        upper_bound: null
      }
    },
    page_to_push: "6",
    telegram_schedule_time: "09:00",
    display_properties: {
      backgroundImageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
      closeOnOutsideClick: true,
      cancelButtonPosition: "top-right",
      countdown: {
        show: false,
        time: "",
        position: "top"
      },
      button: {
        text: "Check Matches",
        position: "center",
        action: {
          type: "external",
          value: "https://t.me/your_bot"
        },
        style: {
          color: "#1976D2",
          textStyle: "normal",
          textSize: "16px"
        }
      }
    }
  }
];

export function InappCampaign() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Campaign>({
    campaign_id: '',
    is_active: true,
    description: '',
    number_of_impression: 0,
    number_of_clicks: 0,
    number_of_payment: 0,
    user_filter: {},
    page_to_push: '1',
    display_properties: {
      backgroundImageUrl: '',
      closeOnOutsideClick: true,
      cancelButtonPosition: 'top-right',
      countdown: {
        show: false,
        time: '',
        position: 'top'
      },
      button: {
        text: 'Click Here',
        position: 'bottom',
        action: {
          type: 'navigate',
          value: ''
        },
        style: {
          color: '#1976D2',
          textStyle: 'bold',
          textSize: '16px'
        }
      }
    }
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      setCampaigns([]); // Clear campaigns immediately when starting to load
      
      console.log('🚀 Loading initial campaigns data...');
      const response = await campaignApiService.get_all_campaigns();
      console.log('✅ Initial campaigns data loaded:', response);
      
      if (response.code === 200 && response.data && response.data.campaigns) {
        setCampaigns(response.data.campaigns);
      } else {
        setError('Failed to load campaigns data - Invalid response format');
        setCampaigns([]); // Set empty array on failure
      }
    } catch (err) {
      console.error('❌ Error loading campaigns data:', err);
      setError('Error loading campaigns data');
      setCampaigns([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = (campaignId: string, field: string, value: any) => {
    setCampaigns(campaigns.map(c => {
      if (c.campaign_id === campaignId) {
        // Handle nested display_properties updates
        if (field.startsWith('display_properties.')) {
          const propertyPath = field.replace('display_properties.', '');
          const pathParts = propertyPath.split('.');
          
          let updatedDisplayProperties = { ...c.display_properties };
          
          if (pathParts.length === 1) {
            (updatedDisplayProperties as any)[pathParts[0]] = value;
          } else if (pathParts.length === 2) {
            (updatedDisplayProperties as any)[pathParts[0]] = {
              ...(updatedDisplayProperties as any)[pathParts[0]],
              [pathParts[1]]: value
            };
          } else if (pathParts.length === 3) {
            (updatedDisplayProperties as any)[pathParts[0]] = {
              ...(updatedDisplayProperties as any)[pathParts[0]],
              [pathParts[1]]: {
                ...((updatedDisplayProperties as any)[pathParts[0]][pathParts[1]]),
                [pathParts[2]]: value
              }
            };
          }
          
          return { ...c, display_properties: updatedDisplayProperties };
        }
        
        // Handle user_filter updates
        if (field.startsWith('user_filter.')) {
          const propertyPath = field.replace('user_filter.', '');
          const pathParts = propertyPath.split('.');
          
          let updatedUserFilter = { ...c.user_filter };
          
          if (pathParts.length === 2) {
            const [filterType, filterProperty] = pathParts;
            if (!updatedUserFilter[filterType as keyof UserFilter]) {
              (updatedUserFilter as any)[filterType] = {};
            }
            
            // Handle null values for bounds
            let processedValue = value;
            if (value === '' || value === undefined) {
              processedValue = null;
            } else if (typeof value === 'string') {
              const numValue = parseFloat(value);
              processedValue = isNaN(numValue) ? null : numValue;
            }
            
            (updatedUserFilter as any)[filterType][filterProperty] = processedValue;
          }
          
          return { ...c, user_filter: updatedUserFilter };
        }
        
        // Handle page_to_push change - clear telegram time if not telegram
        if (field === 'page_to_push') {
          const updatedCampaign = { ...c, [field]: value };
          if (value !== '6') {
            delete updatedCampaign.telegram_schedule_time;
          }
          return updatedCampaign;
        }
        
        return { ...c, [field]: value };
      }
      return c;
    }));
  };

  const toggleUserFilter = (campaignId: string, filterType: 'number_of_messages' | 'paid_amount_stars', enabled: boolean) => {
    setCampaigns(campaigns.map(c => {
      if (c.campaign_id === campaignId) {
        const updatedUserFilter = { ...c.user_filter };
        if (enabled) {
          (updatedUserFilter as any)[filterType] = {
            lower_bound: null,
            upper_bound: null
          };
        } else {
          delete (updatedUserFilter as any)[filterType];
        }
        return { ...c, user_filter: updatedUserFilter };
      }
      return c;
    }));
  };

  const moveCampaign = (campaignId: string, direction: 'up' | 'down') => {
    const currentIndex = campaigns.findIndex(c => c.campaign_id === campaignId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= campaigns.length) return;

    const newCampaigns = [...campaigns];
    [newCampaigns[currentIndex], newCampaigns[newIndex]] = [newCampaigns[newIndex], newCampaigns[currentIndex]];
    setCampaigns(newCampaigns);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      console.log('🚀 Saving campaigns:', campaigns);
      const response = await campaignApiService.bulk_update_campaigns(campaigns);
      console.log('✅ Campaigns saved:', response);
      
      if (response.code === 200) {
        alert('Campaigns saved successfully!');
      } else {
        setError('Failed to save campaigns');
      }
    } catch (err) {
      console.error('❌ Error saving campaigns:', err);
      setError('Error saving campaigns');
    } finally {
      setSaving(false);
    }
  };

  const toggleExpanded = (campaignId: string) => {
    setExpandedCampaignId(expandedCampaignId === campaignId ? null : campaignId);
  };

  const updateNewCampaign = (field: string, value: any) => {
    setCampaigns(prev => prev); // Keep existing campaigns unchanged
    
    // Handle nested display_properties updates
    if (field.startsWith('display_properties.')) {
      const propertyPath = field.replace('display_properties.', '');
      const pathParts = propertyPath.split('.');
      
      let updatedDisplayProperties = { ...newCampaign.display_properties };
      
      if (pathParts.length === 1) {
        (updatedDisplayProperties as any)[pathParts[0]] = value;
      } else if (pathParts.length === 2) {
        (updatedDisplayProperties as any)[pathParts[0]] = {
          ...(updatedDisplayProperties as any)[pathParts[0]],
          [pathParts[1]]: value
        };
      } else if (pathParts.length === 3) {
        (updatedDisplayProperties as any)[pathParts[0]] = {
          ...(updatedDisplayProperties as any)[pathParts[0]],
          [pathParts[1]]: {
            ...((updatedDisplayProperties as any)[pathParts[0]][pathParts[1]]),
            [pathParts[2]]: value
          }
        };
      }
      
      setNewCampaign(prev => ({ ...prev, display_properties: updatedDisplayProperties }));
      return;
    }
    
    // Handle user_filter updates
    if (field.startsWith('user_filter.')) {
      const propertyPath = field.replace('user_filter.', '');
      const pathParts = propertyPath.split('.');
      
      let updatedUserFilter = { ...newCampaign.user_filter };
      
      if (pathParts.length === 2) {
        const [filterType, filterProperty] = pathParts;
        if (!updatedUserFilter[filterType as keyof UserFilter]) {
          (updatedUserFilter as any)[filterType] = {};
        }
        
        let processedValue = value;
        if (value === '' || value === undefined) {
          processedValue = null;
        } else if (typeof value === 'string') {
          const numValue = parseFloat(value);
          processedValue = isNaN(numValue) ? null : numValue;
        }
        
        (updatedUserFilter as any)[filterType][filterProperty] = processedValue;
      }
      
      setNewCampaign(prev => ({ ...prev, user_filter: updatedUserFilter }));
      return;
    }
    
    // Handle page_to_push change - clear telegram time if not telegram
    if (field === 'page_to_push') {
      const updatedCampaign = { ...newCampaign, [field]: value };
      if (value !== '6') {
        delete updatedCampaign.telegram_schedule_time;
      }
      setNewCampaign(updatedCampaign);
      return;
    }
    
    setNewCampaign(prev => ({ ...prev, [field]: value }));
  };

  const toggleNewCampaignUserFilter = (filterType: 'number_of_messages' | 'paid_amount_stars', enabled: boolean) => {
    const updatedUserFilter = { ...newCampaign.user_filter };
    if (enabled) {
      (updatedUserFilter as any)[filterType] = {
        lower_bound: null,
        upper_bound: null
      };
    } else {
      delete (updatedUserFilter as any)[filterType];
    }
    setNewCampaign(prev => ({ ...prev, user_filter: updatedUserFilter }));
  };

  const handleUploadNewCampaign = async () => {
    try {
      setUploading(true);
      setError(null);

      // Use provided ID or generate a temporary ID for the new campaign
      const campaignId = newCampaign.campaign_id.trim() || `campaign_${Date.now()}`;
      const campaignWithId = { ...newCampaign, campaign_id: campaignId };
      
      console.log('🚀 Uploading new campaign:', campaignWithId);
      const response = await campaignApiService.bulk_update_campaigns([campaignWithId]);
      console.log('✅ New campaign uploaded:', response);
      
      if (response.code === 200) {
        alert('New campaign uploaded successfully!');
        // Reset form and hide it
        setNewCampaign({
          campaign_id: '',
          is_active: true,
          description: '',
          number_of_impression: 0,
          number_of_clicks: 0,
          number_of_payment: 0,
          user_filter: {},
          page_to_push: '1',
          display_properties: {
            backgroundImageUrl: '',
            closeOnOutsideClick: true,
            cancelButtonPosition: 'top-right',
            countdown: {
              show: false,
              time: '',
              position: 'top'
            },
            button: {
              text: 'Click Here',
              position: 'bottom',
              action: {
                type: 'navigate',
                value: ''
              },
              style: {
                color: '#1976D2',
                textStyle: 'bold',
                textSize: '16px'
              }
            }
          }
        });
        setShowNewCampaignForm(false);
        // Reload campaigns to show the new one
        loadInitialData();
      } else {
        setError('Failed to upload new campaign');
      }
    } catch (err) {
      console.error('❌ Error uploading new campaign:', err);
      setError('Error uploading new campaign');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelNewCampaign = () => {
    setShowNewCampaignForm(false);
    setNewCampaign({
      campaign_id: '',
      is_active: true,
      description: '',
      number_of_impression: 0,
      number_of_clicks: 0,
      number_of_payment: 0,
      user_filter: {},
      page_to_push: '1',
      display_properties: {
        backgroundImageUrl: '',
        closeOnOutsideClick: true,
        cancelButtonPosition: 'top-right',
        countdown: {
          show: false,
          time: '',
          position: 'top'
        },
        button: {
          text: 'Click Here',
          position: 'bottom',
          action: {
            type: 'navigate',
            value: ''
          },
          style: {
            color: '#1976D2',
            textStyle: 'bold',
            textSize: '16px'
          }
        }
      }
    });
  };

  const getConversionRate = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
  };

  const getPaymentRate = (payments: number, clicks: number) => {
    return clicks > 0 ? ((payments / clicks) * 100).toFixed(2) : '0.00';
  };

  const getPageToPushLabel = (value: string) => {
    const option = pageToPushOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const formatRangeText = (lowerBound: number | null, upperBound: number | null, unit: string) => {
    const lower = lowerBound ?? 0;
    const upper = upperBound ? upperBound.toString() : '∞';
    return `${lower} ≤ ${unit} ≤ ${upper}`;
  };

  const getFilterSummary = (userFilter: UserFilter) => {
    const filters = [];
    
    if (userFilter.number_of_messages) {
      const { lower_bound, upper_bound } = userFilter.number_of_messages;
      filters.push(formatRangeText(lower_bound, upper_bound, 'Messages'));
    }
    
    if (userFilter.paid_amount_stars) {
      const { lower_bound, upper_bound } = userFilter.paid_amount_stars;
      filters.push(formatRangeText(lower_bound, upper_bound, 'Stars'));
    }
    
    return filters.length > 0 ? filters.join(' & ') : 'All users';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-muted-foreground">Loading campaigns data...</p>
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
  if (loading || !campaigns || !Array.isArray(campaigns)) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-muted-foreground">Preparing campaigns...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex gap-6 h-full">
      {/* Campaigns List */}
      <div className="w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2>In-app Campaigns</h2>
          <div className="text-sm text-muted-foreground">
            {campaigns.filter(c => c.is_active).length} active campaigns
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-3 pr-4">
            {campaigns.map((campaign, index) => {
              const isExpanded = expandedCampaignId === campaign.campaign_id;
              const isTelegramNotification = campaign.page_to_push === '6';
              
              return (
                <Card key={`${campaign.campaign_id}-${index}`} className="transition-all duration-200">
                  <CardContent className="p-4">
                    {/* Campaign Header */}
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleExpanded(campaign.campaign_id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {isExpanded ? '🔽' : '▶️'}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3>{campaign.campaign_id}</h3>
                              <div className="flex gap-2">
                                <Badge variant={campaign.is_active ? "default" : "secondary"}>
                                  {campaign.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">
                                  {getPageToPushLabel(campaign.page_to_push)}
                                </Badge>
                                {isTelegramNotification && campaign.telegram_schedule_time && (
                                  <Badge variant="outline" className="text-xs">
                                    <span className="text-base mr-1">⏰</span>
                                    {campaign.telegram_schedule_time}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{campaign.description}</p>
                            <div className="text-xs text-muted-foreground mb-3">
                              <span className="text-base mr-1">🎯</span>
                              Target: {campaign.user_filter ? getFilterSummary(campaign.user_filter) : 'All users'}
                            </div>
                            
                            {/* Analytics Summary */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-medium">👁️ {(campaign.number_of_impression || 0).toLocaleString()}</div>
                                <div className="text-muted-foreground">Impressions</div>
                              </div>
                              <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-medium">👆 {(campaign.number_of_clicks || 0).toLocaleString()}</div>
                                <div className="text-muted-foreground">Clicks ({getConversionRate(campaign.number_of_clicks || 0, campaign.number_of_impression || 0)}%)</div>
                              </div>
                              <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-medium">💰 {(campaign.number_of_payment || 0).toLocaleString()}</div>
                                <div className="text-muted-foreground">Payments ({getPaymentRate(campaign.number_of_payment || 0, campaign.number_of_clicks || 0)}%)</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Controls */}
                      <div className="flex flex-col gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveCampaign(campaign.campaign_id, 'up')}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <span className="text-xs">⬆️</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveCampaign(campaign.campaign_id, 'down')}
                          disabled={index === campaigns.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <span className="text-xs">⬇️</span>
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Edit Form */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2">
                            <span className="text-base">📋</span>
                            Basic Information
                          </h4>
                          
                          <div>
                            <Label>Campaign ID</Label>
                            <Input 
                              value={campaign.campaign_id}
                              onChange={(e) => updateCampaign(campaign.campaign_id, 'campaign_id', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={campaign.description}
                              onChange={(e) => updateCampaign(campaign.campaign_id, 'description', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>Page to Push</Label>
                            <Select 
                              value={campaign.page_to_push}
                              onValueChange={(value) => updateCampaign(campaign.campaign_id, 'page_to_push', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {pageToPushOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Telegram Schedule Time - only show when Telegram notification is selected */}
                          {campaign.page_to_push === '6' && (
                            <div>
                              <Label className="flex items-center gap-2">
                                <span className="text-base">⏰</span>
                                Daily Telegram Push Time
                              </Label>
                              <Input
                                type="time"
                                value={campaign.telegram_schedule_time || '09:00'}
                                onChange={(e) => updateCampaign(campaign.campaign_id, 'telegram_schedule_time', e.target.value)}
                                placeholder="09:00"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Time when the Telegram notification will be sent daily (24-hour format)
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={campaign.is_active}
                              onCheckedChange={(checked) => updateCampaign(campaign.campaign_id, 'is_active', checked)}
                            />
                            <Label>Active Campaign</Label>
                          </div>
                        </div>

                        {/* User Filter Configuration */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2">
                            <span className="text-base">🎯</span>
                            User Targeting Filters
                          </h4>
                          
                          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                            {/* Number of Messages Filter */}
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={!!(campaign.user_filter?.number_of_messages)}
                                  onCheckedChange={(checked) => toggleUserFilter(campaign.campaign_id, 'number_of_messages', checked)}
                                />
                                <Label className="flex items-center gap-2">
                                  <span className="text-base">💬</span>
                                  Filter by Number of Messages
                                </Label>
                              </div>
                              
                              {campaign.user_filter?.number_of_messages && (
                                <div className="ml-6 space-y-3">
                                  <div className="text-sm text-muted-foreground">
                                    Range: [Lower Bound] ≤ Messages ≤ [Upper Bound]
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-sm">Lower Bound</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        value={campaign.user_filter?.number_of_messages?.lower_bound ?? ''}
                                        onChange={(e) => updateCampaign(campaign.campaign_id, 'user_filter.number_of_messages.lower_bound', e.target.value)}
                                        placeholder="0 (leave empty for 0)"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm">Upper Bound</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        value={campaign.user_filter?.number_of_messages?.upper_bound ?? ''}
                                        onChange={(e) => updateCampaign(campaign.campaign_id, 'user_filter.number_of_messages.upper_bound', e.target.value)}
                                        placeholder="∞ (leave empty for no limit)"
                                      />
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                    Current range: {formatRangeText(
                                      campaign.user_filter?.number_of_messages?.lower_bound,
                                      campaign.user_filter?.number_of_messages?.upper_bound,
                                      'Messages'
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Paid Amount (Stars) Filter */}
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={!!(campaign.user_filter?.paid_amount_stars)}
                                  onCheckedChange={(checked) => toggleUserFilter(campaign.campaign_id, 'paid_amount_stars', checked)}
                                />
                                <Label className="flex items-center gap-2">
                                  <span className="text-base">⭐</span>
                                  Filter by Paid Amount (Telegram Stars)
                                </Label>
                              </div>
                              
                              {campaign.user_filter?.paid_amount_stars && (
                                <div className="ml-6 space-y-3">
                                  <div className="text-sm text-muted-foreground">
                                    Range: [Lower Bound] ≤ Telegram Stars ≤ [Upper Bound]
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-sm">Lower Bound</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={campaign.user_filter?.paid_amount_stars?.lower_bound ?? ''}
                                        onChange={(e) => updateCampaign(campaign.campaign_id, 'user_filter.paid_amount_stars.lower_bound', e.target.value)}
                                        placeholder="0 (leave empty for 0)"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm">Upper Bound</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={campaign.user_filter?.paid_amount_stars?.upper_bound ?? ''}
                                        onChange={(e) => updateCampaign(campaign.campaign_id, 'user_filter.paid_amount_stars.upper_bound', e.target.value)}
                                        placeholder="∞ (leave empty for no limit)"
                                      />
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                    Current range: {formatRangeText(
                                      campaign.user_filter?.paid_amount_stars?.lower_bound,
                                      campaign.user_filter?.paid_amount_stars?.upper_bound,
                                      'Stars'
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Filter Summary */}
                            <div className="pt-2 border-t">
                              <Label className="text-sm">Current Filter Summary:</Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {getFilterSummary(campaign.user_filter || {})}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Analytics (Read-only) */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2">
                            <span className="text-base">📊</span>
                            Analytics (Read-only)
                          </h4>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Impressions</Label>
                              <Input value={(campaign.number_of_impression || 0).toLocaleString()} disabled />
                            </div>
                            <div>
                              <Label>Clicks</Label>
                              <Input value={(campaign.number_of_clicks || 0).toLocaleString()} disabled />
                            </div>
                            <div>
                              <Label>Payments</Label>
                              <Input value={(campaign.number_of_payment || 0).toLocaleString()} disabled />
                            </div>
                          </div>
                        </div>

                        {/* Display Properties - only show for non-Telegram campaigns */}
                        {campaign.page_to_push !== '6' && (
                          <>
                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2">
                                <span className="text-base">🎨</span>
                                Display Properties
                              </h4>
                              
                              <div>
                                <Label>Background Image URL</Label>
                                <Input
                                  value={campaign.display_properties.backgroundImageUrl}
                                  onChange={(e) => updateCampaign(campaign.campaign_id, 'display_properties.backgroundImageUrl', e.target.value)}
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={campaign.display_properties.closeOnOutsideClick}
                                    onCheckedChange={(checked) => updateCampaign(campaign.campaign_id, 'display_properties.closeOnOutsideClick', checked)}
                                  />
                                  <Label>Close on Outside Click</Label>
                                </div>
                                
                                <div>
                                  <Label>Cancel Button Position</Label>
                                  <Select 
                                    value={campaign.display_properties.cancelButtonPosition}
                                    onValueChange={(value) => updateCampaign(campaign.campaign_id, 'display_properties.cancelButtonPosition', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="top-left">Top Left</SelectItem>
                                      <SelectItem value="top-right">Top Right</SelectItem>
                                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Countdown Configuration */}
                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2">
                                <span className="text-base">⏰</span>
                                Countdown Configuration
                              </h4>
                              
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={campaign.display_properties.countdown.show}
                                  onCheckedChange={(checked) => updateCampaign(campaign.campaign_id, 'display_properties.countdown.show', checked)}
                                />
                                <Label>Show Countdown</Label>
                              </div>
                              
                              {campaign.display_properties.countdown.show && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Countdown End Time</Label>
                                    <Input
                                      type="datetime-local"
                                      value={campaign.display_properties.countdown.time ? new Date(campaign.display_properties.countdown.time).toISOString().slice(0, 16) : ''}
                                      onChange={(e) => updateCampaign(campaign.campaign_id, 'display_properties.countdown.time', new Date(e.target.value).toISOString())}
                                    />
                                  </div>
                                  <div>
                                    <Label>Countdown Position</Label>
                                    <Select 
                                      value={campaign.display_properties.countdown.position}
                                      onValueChange={(value) => updateCampaign(campaign.campaign_id, 'display_properties.countdown.position', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="top">Top</SelectItem>
                                        <SelectItem value="center">Center</SelectItem>
                                        <SelectItem value="bottom">Bottom</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Button Configuration */}
                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2">
                                <span className="text-base">🔘</span>
                                Button Configuration
                              </h4>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Button Text</Label>
                                  <Input
                                    value={campaign.display_properties.button.text}
                                    onChange={(e) => updateCampaign(campaign.campaign_id, 'display_properties.button.text', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Button Position</Label>
                                  <Select 
                                    value={campaign.display_properties.button.position}
                                    onValueChange={(value) => updateCampaign(campaign.campaign_id, 'display_properties.button.position', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="top">Top</SelectItem>
                                      <SelectItem value="center">Center</SelectItem>
                                      <SelectItem value="bottom">Bottom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Action Type</Label>
                                  <Select 
                                    value={campaign.display_properties.button.action.type}
                                    onValueChange={(value) => updateCampaign(campaign.campaign_id, 'display_properties.button.action.type', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pay">Payment</SelectItem>
                                      <SelectItem value="navigate">Navigate</SelectItem>
                                      <SelectItem value="close">Close</SelectItem>
                                      <SelectItem value="external">External Link</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Action Value</Label>
                                  <Input
                                    value={campaign.display_properties.button.action.value}
                                    onChange={(e) => updateCampaign(campaign.campaign_id, 'display_properties.button.action.value', e.target.value)}
                                    placeholder="product_id, URL, or action"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label>Button Color</Label>
                                  <Input
                                    type="color"
                                    value={campaign.display_properties.button.style.color}
                                    onChange={(e) => updateCampaign(campaign.campaign_id, 'display_properties.button.style.color', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>Text Style</Label>
                                  <Select 
                                    value={campaign.display_properties.button.style.textStyle}
                                    onValueChange={(value) => updateCampaign(campaign.campaign_id, 'display_properties.button.style.textStyle', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="normal">Normal</SelectItem>
                                      <SelectItem value="bold">Bold</SelectItem>
                                      <SelectItem value="italic">Italic</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Text Size</Label>
                                  <Input
                                    value={campaign.display_properties.button.style.textSize}
                                    onChange={(e) => updateCampaign(campaign.campaign_id, 'display_properties.button.style.textSize', e.target.value)}
                                    placeholder="16px, 1rem, etc."
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Telegram-specific information */}
                        {campaign.page_to_push === '6' && (
                          <div className="space-y-4">
                            <h4 className="flex items-center gap-2">
                              <span className="text-base">📱</span>
                              Telegram Notification Settings
                            </h4>
                            
                            <div className="p-4 bg-muted/30 rounded-lg">
                              <div className="text-sm space-y-2">
                                <p><strong>Notification Type:</strong> Daily push notification via Telegram</p>
                                <p><strong>Schedule:</strong> Every day at {campaign.telegram_schedule_time || '09:00'}</p>
                                <p><strong>Target:</strong> {getFilterSummary(campaign.user_filter || {})}</p>
                                <p className="text-muted-foreground text-xs mt-2">
                                  Users will receive a Telegram notification at the scheduled time with the campaign message.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Add New Campaign Card */}
            <Card className="transition-all duration-200 border-dashed border-2">
              <CardContent className="p-4">
                {!showNewCampaignForm ? (
                  <div 
                    className="flex items-center justify-center p-8 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setShowNewCampaignForm(true)}
                  >
                    <div className="text-center text-muted-foreground">
                      <span className="text-4xl block mb-2">➕</span>
                      <p className="font-medium">Add New Campaign</p>
                      <p className="text-sm">Click to create a new campaign</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <span className="text-xl">➕</span>
                        Add New Campaign
                      </h3>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2">
                        <span className="text-base">📋</span>
                        Basic Information
                      </h4>
                      
                      <div>
                        <Label>Campaign ID</Label>
                        <Input 
                          value={newCampaign.campaign_id}
                          onChange={(e) => updateNewCampaign('campaign_id', e.target.value)}
                          placeholder="Enter custom campaign ID (optional - will auto-generate if empty)"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty to auto-generate ID, or provide a custom ID (e.g., flash_sale_2024)
                        </p>
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newCampaign.description}
                          onChange={(e) => updateNewCampaign('description', e.target.value)}
                          placeholder="Enter campaign description"
                        />
                      </div>
                      
                      <div>
                        <Label>Page to Push</Label>
                        <Select 
                          value={newCampaign.page_to_push}
                          onValueChange={(value) => updateNewCampaign('page_to_push', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {pageToPushOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Telegram Schedule Time - only show when Telegram notification is selected */}
                      {newCampaign.page_to_push === '6' && (
                        <div>
                          <Label className="flex items-center gap-2">
                            <span className="text-base">⏰</span>
                            Daily Telegram Push Time
                          </Label>
                          <Input
                            type="time"
                            value={newCampaign.telegram_schedule_time || '09:00'}
                            onChange={(e) => updateNewCampaign('telegram_schedule_time', e.target.value)}
                            placeholder="09:00"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Time when the Telegram notification will be sent daily (24-hour format)
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newCampaign.is_active}
                          onCheckedChange={(checked) => updateNewCampaign('is_active', checked)}
                        />
                        <Label>Active Campaign</Label>
                      </div>
                    </div>

                    {/* User Filter Configuration */}
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2">
                        <span className="text-base">🎯</span>
                        User Targeting Filters
                      </h4>
                      
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                        {/* Number of Messages Filter */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={!!(newCampaign.user_filter?.number_of_messages)}
                              onCheckedChange={(checked) => toggleNewCampaignUserFilter('number_of_messages', checked)}
                            />
                            <Label className="flex items-center gap-2">
                              <span className="text-base">💬</span>
                              Filter by Number of Messages
                            </Label>
                          </div>
                          
                          {newCampaign.user_filter?.number_of_messages && (
                            <div className="ml-6 grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm">Lower Bound</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={newCampaign.user_filter?.number_of_messages?.lower_bound ?? ''}
                                  onChange={(e) => updateNewCampaign('user_filter.number_of_messages.lower_bound', e.target.value)}
                                  placeholder="0 (leave empty for 0)"
                                />
                              </div>
                              <div>
                                <Label className="text-sm">Upper Bound</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={newCampaign.user_filter?.number_of_messages?.upper_bound ?? ''}
                                  onChange={(e) => updateNewCampaign('user_filter.number_of_messages.upper_bound', e.target.value)}
                                  placeholder="∞ (leave empty for no limit)"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Paid Amount (Stars) Filter */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={!!(newCampaign.user_filter?.paid_amount_stars)}
                              onCheckedChange={(checked) => toggleNewCampaignUserFilter('paid_amount_stars', checked)}
                            />
                            <Label className="flex items-center gap-2">
                              <span className="text-base">⭐</span>
                              Filter by Paid Amount (Telegram Stars)
                            </Label>
                          </div>
                          
                          {newCampaign.user_filter?.paid_amount_stars && (
                            <div className="ml-6 grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm">Lower Bound</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={newCampaign.user_filter?.paid_amount_stars?.lower_bound ?? ''}
                                  onChange={(e) => updateNewCampaign('user_filter.paid_amount_stars.lower_bound', e.target.value)}
                                  placeholder="0 (leave empty for 0)"
                                />
                              </div>
                              <div>
                                <Label className="text-sm">Upper Bound</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={newCampaign.user_filter?.paid_amount_stars?.upper_bound ?? ''}
                                  onChange={(e) => updateNewCampaign('user_filter.paid_amount_stars.upper_bound', e.target.value)}
                                  placeholder="∞ (leave empty for no limit)"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Display Properties - only show for non-Telegram campaigns */}
                    {newCampaign.page_to_push !== '6' && (
                      <>
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2">
                            <span className="text-base">🎨</span>
                            Display Properties
                          </h4>
                          
                          <div>
                            <Label>Background Image URL</Label>
                            <Input
                              value={newCampaign.display_properties.backgroundImageUrl}
                              onChange={(e) => updateNewCampaign('display_properties.backgroundImageUrl', e.target.value)}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={newCampaign.display_properties.closeOnOutsideClick}
                                onCheckedChange={(checked) => updateNewCampaign('display_properties.closeOnOutsideClick', checked)}
                              />
                              <Label>Close on Outside Click</Label>
                            </div>
                            
                            <div>
                              <Label>Cancel Button Position</Label>
                              <Select 
                                value={newCampaign.display_properties.cancelButtonPosition}
                                onValueChange={(value) => updateNewCampaign('display_properties.cancelButtonPosition', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="top-left">Top Left</SelectItem>
                                  <SelectItem value="top-right">Top Right</SelectItem>
                                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Countdown Configuration */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2">
                            <span className="text-base">⏰</span>
                            Countdown Configuration
                          </h4>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={newCampaign.display_properties.countdown.show}
                              onCheckedChange={(checked) => updateNewCampaign('display_properties.countdown.show', checked)}
                            />
                            <Label>Show Countdown</Label>
                          </div>
                          
                          {newCampaign.display_properties.countdown.show && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Countdown End Time</Label>
                                <Input
                                  type="datetime-local"
                                  value={newCampaign.display_properties.countdown.time ? new Date(newCampaign.display_properties.countdown.time).toISOString().slice(0, 16) : ''}
                                  onChange={(e) => updateNewCampaign('display_properties.countdown.time', new Date(e.target.value).toISOString())}
                                />
                              </div>
                              <div>
                                <Label>Countdown Position</Label>
                                <Select 
                                  value={newCampaign.display_properties.countdown.position}
                                  onValueChange={(value) => updateNewCampaign('display_properties.countdown.position', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="top">Top</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="bottom">Bottom</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Button Configuration */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2">
                            <span className="text-base">🔘</span>
                            Button Configuration
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Button Text</Label>
                              <Input
                                value={newCampaign.display_properties.button.text}
                                onChange={(e) => updateNewCampaign('display_properties.button.text', e.target.value)}
                                placeholder="Click Here"
                              />
                            </div>
                            <div>
                              <Label>Button Position</Label>
                              <Select 
                                value={newCampaign.display_properties.button.position}
                                onValueChange={(value) => updateNewCampaign('display_properties.button.position', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="top">Top</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="bottom">Bottom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Action Type</Label>
                              <Select 
                                value={newCampaign.display_properties.button.action.type}
                                onValueChange={(value) => updateNewCampaign('display_properties.button.action.type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pay">Payment</SelectItem>
                                  <SelectItem value="navigate">Navigate</SelectItem>
                                  <SelectItem value="close">Close</SelectItem>
                                  <SelectItem value="external">External Link</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Action Value</Label>
                              <Input
                                value={newCampaign.display_properties.button.action.value}
                                onChange={(e) => updateNewCampaign('display_properties.button.action.value', e.target.value)}
                                placeholder="product_id, URL, or action"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Button Color</Label>
                              <Input
                                type="color"
                                value={newCampaign.display_properties.button.style.color}
                                onChange={(e) => updateNewCampaign('display_properties.button.style.color', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Text Style</Label>
                              <Select 
                                value={newCampaign.display_properties.button.style.textStyle}
                                onValueChange={(value) => updateNewCampaign('display_properties.button.style.textStyle', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="bold">Bold</SelectItem>
                                  <SelectItem value="italic">Italic</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Text Size</Label>
                              <Input
                                value={newCampaign.display_properties.button.style.textSize}
                                onChange={(e) => updateNewCampaign('display_properties.button.style.textSize', e.target.value)}
                                placeholder="16px, 1rem, etc."
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Telegram-specific information */}
                    {newCampaign.page_to_push === '6' && (
                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2">
                          <span className="text-base">📱</span>
                          Telegram Notification Settings
                        </h4>
                        
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="text-sm space-y-2">
                            <p><strong>Notification Type:</strong> Daily push notification via Telegram</p>
                            <p><strong>Schedule:</strong> Every day at {newCampaign.telegram_schedule_time || '09:00'}</p>
                            <p><strong>Target:</strong> {getFilterSummary(newCampaign.user_filter || {})}</p>
                            <p className="text-muted-foreground text-xs mt-2">
                              Users will receive a Telegram notification at the scheduled time with the campaign message.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button 
                        onClick={handleUploadNewCampaign}
                        disabled={uploading || !newCampaign.description}
                        className="flex-1"
                      >
                        <span className="text-base mr-2">{uploading ? '⏳' : '📤'}</span>
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={handleCancelNewCampaign}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} className="flex-1" disabled={saving}>
            <span className="text-base mr-2">{saving ? '⏳' : '💾'}</span>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button onClick={loadInitialData} variant="outline">
            <span className="text-base mr-1">🔄</span>
            Refresh
          </Button>
        </div>
      </div>

      {/* App Preview */}
      <div className="w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h3>Campaign Preview</h3>
          <div className="text-sm text-muted-foreground">
            Live campaign preview
          </div>
        </div>
        
        <div className="mt-4">
          <Card className="h-[calc(100vh-200px)]">
            <CardContent className="p-8 h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Campaign preview component will be rendered here</p>
                <p className="text-xs mt-2">This will use the actual app's campaign display component</p>
                <div className="mt-4 p-4 bg-muted rounded-lg max-w-sm">
                  <p className="text-xs mb-2">Preview will show:</p>
                  <ul className="text-xs space-y-1 text-left">
                    <li>• Range-based user filtering</li>
                    <li>• Message count ranges</li>
                    <li>• Telegram Stars ranges</li>
                    <li>• Page push destination</li>
                    <li>• Background image layout</li>
                    <li>• Button styling and position</li>
                    <li>• Countdown timer (if enabled)</li>
                    <li>• Telegram scheduling (if applicable)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
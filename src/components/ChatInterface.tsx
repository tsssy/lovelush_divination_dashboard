import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import CONFIG from '../config.js';
import authApiService from '../api_services/auth.js';
import subAccountsApiService from '../api_services/subaccounts.js';
import { toast } from 'sonner';
import { PhotoUploadModal } from './PhotoUploadModal';
import { AvatarUploadModal } from './AvatarUploadModal';

interface Message {
  id: string;
  chatroom_id: string;
  sender_id: string;
  sender_type: 'user' | 'subaccount';
  message: string;
  message_type: string;
  metadata: any;
  is_edited: boolean;
  is_deleted: boolean;
  edited_at: string | null;
  read_by: string[];
  created_at: string;
  updated_at: string;
  sender_details?: {
    username?: string;
    avatar_url?: string;
  };
}

interface MessagesData {
  items: Message[];
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

interface Chatroom {
  id: string;
  status: string;
  created_at: string;
  last_activity_at?: string;
  metadata?: {
    participants?: {
      user?: {
        username?: string;
        full_name?: string;
      }
    }
  };
  // New fields for real-time updates
  hasUnreadMessages?: boolean;
  latestMessagePreview?: string;
  latestMessageTimestamp?: string;
  latestMessageUsername?: string;
  latestMessageUserId?: string;
}

interface SubAccount {
  id: string;
  agent_id: string;
  name: string;
  display_name: string;
  status: 'available' | 'busy' | 'offline' | 'suspended';
  avatar_url?: string;
  bio: string;
  age: number;
  location: string;
  gender: 'male' | 'female' | 'not_specified';
  photo_urls: string[];
  tags: string[];
  max_concurrent_chats: number;
  current_active_chats: number;
  is_active: boolean;
  current_chat_count: number;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
  chatrooms?: Chatroom[];
}

interface ChatInterfaceProps {
  authState: {
    isAuthenticated: boolean;
    userSession: any;
    subAccounts: SubAccount[];
    isPusherConnected: boolean;
  };
}

export function ChatInterface({ authState }: ChatInterfaceProps) {
  const [subAccountsWithChatrooms, setSubAccountsWithChatrooms] = useState<SubAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChatroom, setExpandedChatroom] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  
  // New subaccount form state
  const [showNewSubaccountForm, setShowNewSubaccountForm] = useState(false);
  const [newSubaccountData, setNewSubaccountData] = useState({
    name: '',
    display_name: '',
    avatar_url: '',
    bio: '',
    age: 18,
    location: '',
    gender: 'not_specified' as 'male' | 'female' | 'not_specified',
    photo_urls: [''] as string[],
    tags: '',
    password: '',
    max_concurrent_chats: 5
  });
  const [creatingSubaccount, setCreatingSubaccount] = useState(false);
  
  // Message-related state
  const [chatroomMessages, setChatroomMessages] = useState<{[chatroomId: string]: MessagesData}>({});
  const [loadingMessages, setLoadingMessages] = useState<{[chatroomId: string]: boolean}>({});
  const [currentSubAccountForChatroom, setCurrentSubAccountForChatroom] = useState<{[chatroomId: string]: string}>({});
  const [failedMessages, setFailedMessages] = useState<{[tempId: string]: {message: string, chatroomId: string, subAccountId: string}}>({});
  
  // Editing state for subaccounts
  const [editingSubAccountId, setEditingSubAccountId] = useState<string | null>(null);
  const [editingSubAccountData, setEditingSubAccountData] = useState<Partial<SubAccount>>({});
  const [updatingSubAccount, setUpdatingSubAccount] = useState(false);
  
  // Scroll refs for each chatroom
  const [scrollRefs, setScrollRefs] = useState<{[chatroomId: string]: React.RefObject<HTMLDivElement>}>({});
  
  // Track subscribed chatrooms
  const [subscribedChatrooms, setSubscribedChatrooms] = useState<Set<string>>(new Set());
  
  // Track connection status for UI
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    isConnecting: false,
    lastConnectedAt: null as Date | null,
    reconnectAttempts: 0
  });

  // Photo upload modal state
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Avatar upload modal state
  const [showAvatarUploadModal, setShowAvatarUploadModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Pagination helper functions
  const totalItems = Math.max(1, subAccountsWithChatrooms.length + 1); // Always at least 1 to show "add new" card
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Get current subaccounts and determine if we should show the "add new" card
  const currentSubAccounts = subAccountsWithChatrooms.slice(startIndex, endIndex);
  // Always show "add new" card if no subaccounts exist, or if there's space on current page
  const showAddNewCard = subAccountsWithChatrooms.length === 0 || (startIndex + currentSubAccounts.length < totalItems);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // 📨 从 Toast 通知展开聊天室（使用统一逻辑）
  const handleExpandChatroomFromToast = async (chatroomId: string, subAccountId: string) => {
    console.log(`📨 Expanding chatroom ${chatroomId} from toast notification`);
    
    // 记录子账户映射关系
    setCurrentSubAccountForChatroom(prev => ({ ...prev, [chatroomId]: subAccountId }));
    
    // 清除未读消息标记
    setSubAccountsWithChatrooms(prevSubAccounts => 
      prevSubAccounts.map(subAccount => 
        subAccount.id === subAccountId 
          ? {
              ...subAccount,
              chatrooms: subAccount.chatrooms?.map(chatroom => 
                chatroom.id === chatroomId 
                  ? { ...chatroom, hasUnreadMessages: false }
                  : chatroom
              )
            }
          : subAccount
      )
    );
    
    // 使用统一的展开逻辑，传递 subAccountId 以避免查找失败
    await handleChatroomExpand(chatroomId, subAccountId);
  };

  const handleRefresh = async () => {
    setCurrentPage(1);
    if (CONFIG.chat.auto_load_chatrooms_on_login) {
      await refreshSubAccountsAndChatrooms();
    } else {
      await refreshSubAccountsOnly();
    }
  };

  const refreshSubAccountsAndChatrooms = async () => {
    if (!authState.userSession?.access_token) {
      setError('No authentication token available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Refreshing sub-accounts list...');
      
      // First, get updated list of sub-accounts
      const subAccountsResponse = await subAccountsApiService.get_all_subaccounts();
      
      if (subAccountsResponse.code === 200 && subAccountsResponse.data?.sub_accounts) {
        const updatedSubAccounts = subAccountsResponse.data.sub_accounts;
        console.log(`✅ Found ${updatedSubAccounts.length} sub-accounts`);
        
        // Then load chatrooms for each updated sub-account
        await loadChatroomsForSubAccounts(updatedSubAccounts);
        
        console.log('✅ Sub-accounts and chatrooms refreshed (on-demand subscription enabled)');
      } else {
        console.warn('⚠️ Failed to refresh sub-accounts:', subAccountsResponse.msg || 'Unknown error');
        setError('Failed to refresh sub-accounts');
      }
    } catch (err) {
      console.error('❌ Error refreshing sub-accounts:', err);
      setError('Error refreshing sub-accounts');
    } finally {
      setLoading(false);
    }
  };

  const refreshSubAccountsOnly = async () => {
    if (!authState.userSession?.access_token) {
      setError('No authentication token available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Refreshing sub-accounts only (chatrooms disabled by config)...');
      
      // Only get sub-accounts, no chatrooms
      const subAccountsResponse = await subAccountsApiService.get_all_subaccounts();
      
      if (subAccountsResponse.code === 200 && subAccountsResponse.data?.sub_accounts) {
        const updatedSubAccounts = subAccountsResponse.data.sub_accounts.map(subAccount => ({
          ...subAccount,
          chatrooms: [] // Set empty chatrooms when auto-load is disabled
        }));
        
        console.log(`✅ Found ${updatedSubAccounts.length} sub-accounts (chatrooms not loaded)`);
        setSubAccountsWithChatrooms(updatedSubAccounts);
      } else {
        console.warn('⚠️ Failed to refresh sub-accounts:', subAccountsResponse.msg || 'Unknown error');
        setError('Failed to refresh sub-accounts');
      }
    } catch (err) {
      console.error('❌ Error refreshing sub-accounts:', err);
      setError('Error refreshing sub-accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadChatroomsForSubAccounts = async (subAccounts: SubAccount[]) => {
    if (!authState.userSession?.access_token) {
      setError('No authentication token available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const subAccountsWithChatroomsData: SubAccount[] = [];
      
      // Load chatrooms for each sub-account
      for (const subAccount of subAccounts) {
        try {
          console.log(`📋 Loading chatrooms for sub-account: ${subAccount.display_name} (${subAccount.id})`);
          
          const response = await fetch(`${CONFIG.api.base_url}/api/v1/agent/chatrooms/?sub_account_id=${subAccount.id}`, {
            headers: {
              'Authorization': `Bearer ${authState.userSession.access_token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const result = await response.json();
          
          if (response.ok && result.data) {
            const chatrooms = result.data || [];
            console.log(`✅ Found ${chatrooms.length} chatrooms for ${subAccount.display_name}`);
            
            subAccountsWithChatroomsData.push({
              ...subAccount,
              chatrooms: chatrooms
            });
          } else {
            console.warn(`⚠️ Failed to load chatrooms for sub-account ${subAccount.id}:`, result.msg || result.detail || 'Unknown error');
            // Still add the sub-account but with empty chatrooms
            subAccountsWithChatroomsData.push({
              ...subAccount,
              chatrooms: []
            });
          }
        } catch (error) {
          console.error(`❌ Error loading chatrooms for sub-account ${subAccount.id}:`, error);
          // Still add the sub-account but with empty chatrooms
          subAccountsWithChatroomsData.push({
            ...subAccount,
            chatrooms: []
          });
        }
      }
      
      setSubAccountsWithChatrooms(subAccountsWithChatroomsData);
      console.log(`✅ Completed loading chatrooms for all ${subAccountsWithChatroomsData.length} sub-accounts`);
      
    } catch (err) {
      console.error('❌ Error loading chatrooms:', err);
      setError('Failed to load chatrooms');
    } finally {
      setLoading(false);
    }
  };

  const loadChatroomsForSingleSubAccount = async (subAccountId: string) => {
    if (!authState.userSession?.access_token) {
      setError('No authentication token available');
      return;
    }

    try {
      const subAccount = subAccountsWithChatrooms.find(sa => sa.id === subAccountId);
      if (!subAccount) {
        setError('Sub-account not found');
        return;
      }

      console.log(`📋 Loading chatrooms for individual sub-account: ${subAccount.display_name} (${subAccount.id})`);
      
      const response = await fetch(`${CONFIG.api.base_url}/api/v1/agent/chatrooms/?sub_account_id=${subAccount.id}`, {
        headers: {
          'Authorization': `Bearer ${authState.userSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.data) {
        const chatrooms = result.data || [];
        console.log(`✅ Found ${chatrooms.length} chatrooms for ${subAccount.display_name}`);
        
        // Update only this specific sub-account
        setSubAccountsWithChatrooms(prev => 
          prev.map(sa => 
            sa.id === subAccountId 
              ? { ...sa, chatrooms: chatrooms }
              : sa
          )
        );
      } else {
        console.warn(`⚠️ Failed to load chatrooms for sub-account ${subAccount.id}:`, result.msg || result.detail || 'Unknown error');
        setError('Failed to load chatrooms for this sub-account');
      }
    } catch (error) {
      console.error(`❌ Error loading chatrooms for sub-account ${subAccountId}:`, error);
      setError('Error loading chatrooms for this sub-account');
    }
  };

  const resetNewSubaccountForm = () => {
    setNewSubaccountData({
      name: '',
      display_name: '',
      avatar_url: '',
      bio: '',
      age: 18,
      location: '',
      gender: 'not_specified' as 'male' | 'female' | 'not_specified',
      photo_urls: [''],
      tags: '',
      password: '',
      max_concurrent_chats: 5
    });
    setShowNewSubaccountForm(false);
  };

  const handleCreateSubaccount = async () => {
    if (!newSubaccountData.name.trim() || !newSubaccountData.display_name.trim()) {
      setError('Name and display name are required');
      return;
    }

    try {
      setCreatingSubaccount(true);
      setError(null);

      // Prepare data for API
      const createData = {
        name: newSubaccountData.name,
        display_name: newSubaccountData.display_name,
        avatar_url: newSubaccountData.avatar_url || undefined,
        bio: newSubaccountData.bio,
        age: newSubaccountData.age,
        location: newSubaccountData.location,
        gender: newSubaccountData.gender === 'not_specified' ? undefined : newSubaccountData.gender,
        photo_urls: newSubaccountData.photo_urls.filter(url => url.trim()),
        tags: newSubaccountData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        password: newSubaccountData.password || undefined,
        max_concurrent_chats: newSubaccountData.max_concurrent_chats
      };

      const response = await subAccountsApiService.create_subaccount(createData);
      
      if (response.code === 201) {
        console.log('✅ Subaccount created successfully');
        resetNewSubaccountForm();
        // Refresh the subaccounts list with updated data
        await refreshSubAccountsAndChatrooms();
      } else {
        setError('Failed to create subaccount');
      }
    } catch (err) {
      console.error('❌ Error creating subaccount:', err);
      setError('Error creating subaccount');
    } finally {
      setCreatingSubaccount(false);
    }
  };

  // Photo URL management functions
  const addPhotoUrl = () => {
    setNewSubaccountData(prev => ({
      ...prev,
      photo_urls: [...prev.photo_urls, '']
    }));
  };

  const removePhotoUrl = (index: number) => {
    setNewSubaccountData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.filter((_, i) => i !== index)
    }));
  };

  const updatePhotoUrl = (index: number, url: string) => {
    setNewSubaccountData(prev => ({
      ...prev,
      photo_urls: prev.photo_urls.map((existingUrl, i) => i === index ? url : existingUrl)
    }));
  };

  const movePhotoUrl = (fromIndex: number, toIndex: number) => {
    setNewSubaccountData(prev => {
      const newPhotoUrls = [...prev.photo_urls];
      const [removed] = newPhotoUrls.splice(fromIndex, 1);
      newPhotoUrls.splice(toIndex, 0, removed);
      return { ...prev, photo_urls: newPhotoUrls };
    });
  };

  // Subaccount editing functions
  const startEditingSubAccount = (subAccount: SubAccount) => {
    setEditingSubAccountId(subAccount.id);
    setEditingSubAccountData({
      name: subAccount.name,
      display_name: subAccount.display_name,
      avatar_url: subAccount.avatar_url || '',
      bio: subAccount.bio,
      age: subAccount.age,
      location: subAccount.location,
      gender: subAccount.gender,
      photo_urls: subAccount.photo_urls.length > 0 ? subAccount.photo_urls : [''],
      tags: subAccount.tags.join(', '),
      max_concurrent_chats: subAccount.max_concurrent_chats
    });
  };

  const cancelEditingSubAccount = () => {
    setEditingSubAccountId(null);
    setEditingSubAccountData({});
  };

  const updateEditingSubAccountField = (field: string, value: any) => {
    setEditingSubAccountData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUploadComplete = (photoUrl: string) => {
    // Add the new photo URL to the editing data
    const newPhotoUrls = [...(editingSubAccountData.photo_urls || ['']), photoUrl];
    updateEditingSubAccountField('photo_urls', newPhotoUrls.filter(url => url.trim()));
  };

  const handleAvatarUploadComplete = (avatarUrl: string) => {
    // Update the avatar URL in the editing data
    updateEditingSubAccountField('avatar_url', avatarUrl);
  };

  const handleShowPhotoUploadModal = () => {
    if (editingSubAccountId) {
      setShowPhotoUploadModal(true);
    } else {
      toast.error('No subaccount selected for editing');
    }
  };

  const handleShowAvatarUploadModal = () => {
    if (editingSubAccountId) {
      setShowAvatarUploadModal(true);
    } else {
      toast.error('No subaccount selected for editing');
    }
  };

  const saveSubAccountChanges = async () => {
    if (!editingSubAccountId || !editingSubAccountData.name?.trim() || !editingSubAccountData.display_name?.trim()) {
      setError('Name and display name are required');
      return;
    }

    try {
      setUpdatingSubAccount(true);
      setError(null);

      // Prepare data for API
      const updateData = {
        name: editingSubAccountData.name,
        display_name: editingSubAccountData.display_name,
        avatar_url: editingSubAccountData.avatar_url || undefined,
        bio: editingSubAccountData.bio || '',
        age: editingSubAccountData.age || 18,
        location: editingSubAccountData.location || '',
        gender: editingSubAccountData.gender === 'not_specified' ? undefined : editingSubAccountData.gender,
        photo_urls: editingSubAccountData.photo_urls?.filter(url => url.trim()) || [],
        tags: editingSubAccountData.tags ? editingSubAccountData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        max_concurrent_chats: editingSubAccountData.max_concurrent_chats || 5
      };

      const response = await subAccountsApiService.update_subaccount(editingSubAccountId, updateData);
      
      if (response.code === 200) {
        console.log('✅ Subaccount updated successfully');
        cancelEditingSubAccount();
        // Refresh the subaccounts list with updated data
        await refreshSubAccountsAndChatrooms();
      } else {
        setError('Failed to update subaccount');
      }
    } catch (err) {
      console.error('❌ Error updating subaccount:', err);
      setError('Error updating subaccount');
    } finally {
      setUpdatingSubAccount(false);
    }
  };

  // Helper function to scroll to bottom
  const scrollToBottom = (chatroomId: string) => {
    const scrollRef = scrollRefs[chatroomId];
    if (scrollRef?.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // Create scroll ref for chatroom if it doesn't exist
  const getOrCreateScrollRef = (chatroomId: string) => {
    if (!scrollRefs[chatroomId]) {
      const newRef = React.createRef<HTMLDivElement>();
      setScrollRefs(prev => ({ ...prev, [chatroomId]: newRef }));
      return newRef;
    }
    return scrollRefs[chatroomId];
  };

  // Auto-scroll when messages change
  useEffect(() => {
    Object.keys(chatroomMessages).forEach(chatroomId => {
      if (expandedChatroom === chatroomId) {
        setTimeout(() => scrollToBottom(chatroomId), 100); // Small delay to ensure DOM update
      }
    });
  }, [chatroomMessages, expandedChatroom]);

  // Load chatrooms when component mounts - respect config setting
  useEffect(() => {
    if (authState.isAuthenticated) {
      if (CONFIG.chat.auto_load_chatrooms_on_login) {
        // Auto-load: refresh from API with chatrooms
        console.log('🔧 Config: auto_load_chatrooms_on_login is enabled');
        refreshSubAccountsAndChatrooms();
      } else {
        // Manual load: only load sub-accounts without chatrooms
        console.log('🔧 Config: auto_load_chatrooms_on_login is disabled - loading sub-accounts only');
        refreshSubAccountsOnly();
      }
    }
  }, [authState.isAuthenticated]);

  // Cleanup: unsubscribe from all chatrooms when component unmounts or user logs out
  useEffect(() => {
    return () => {
      // Unsubscribe from all currently subscribed chatrooms
      subscribedChatrooms.forEach(async (chatroomId) => {
        try {
          await authApiService.unsubscribeFromChatroom(chatroomId);
          console.log(`🔕 Cleanup: Unsubscribed from chatroom ${chatroomId}`);
        } catch (error) {
          console.error(`❌ Cleanup error unsubscribing from ${chatroomId}:`, error);
        }
      });
    };
  }, [subscribedChatrooms]);

  // Set up Pusher message handling and connection monitoring
  useEffect(() => {
    if (authState.isPusherConnected) {
      const pusherService = authApiService.getPusherService();
      
      console.log('🔧 Setting up Pusher message handlers. Current auth state:', {
        isAuthenticated: authState.isAuthenticated,
        isPusherConnected: authState.isPusherConnected,
        userSession: authState.userSession ? 'Present' : 'Missing',
        agentId: authState.userSession?.agent_id || 'N/A'
      });
      
      // Update initial connection status
      const initialState = pusherService.getConnectionState();
      setConnectionStatus({
        isConnected: initialState.isConnected,
        isConnecting: initialState.isConnecting,
        lastConnectedAt: initialState.isConnected ? new Date() : null,
        reconnectAttempts: initialState.connectionAttempts || 0
      });
      
      // Listen for connection events
      const handleConnectionSuccess = () => {
        console.log('🔄 Connection restored in ChatInterface');
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          lastConnectedAt: new Date(),
          reconnectAttempts: 0
        }));
      };
      
      const handleConnectionDisconnected = () => {
        console.log('⚠️ Connection lost in ChatInterface');
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }));
      };
      
      const handleConnectionError = (data) => {
        console.log('❌ Connection error in ChatInterface:', data);
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }));
      };
      
      const handleConnectionFailed = () => {
        console.log('❌ Connection failed in ChatInterface');
        setConnectionStatus(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          reconnectAttempts: prev.reconnectAttempts + 1
        }));
      };
      
      // Listen for general message events from Pusher service
      const handleGeneralMessage = (messageData: any) => {
        console.log('📨 Received general Pusher message:', messageData);
        
        // Debug: Show ALL private-agent-{agent_id} messages
        if (messageData.channelName && messageData.channelName.startsWith('private-agent-')) {
          console.log('🔍 DEBUG - Private Agent Channel Message:', {
            channelName: messageData.channelName,
            eventName: messageData.eventName,
            data: messageData.data,
            fullMessage: messageData
          });
        }
        
        // Handle new_in_chatroom events (new chatrooms or updates to existing ones)
        if (messageData.eventName === 'message.new_in_chatroom' && messageData.data) {
          console.log('🔔 Processing message.new_in_chatroom event:', messageData);
          
          const parsedData = typeof messageData.data === 'string' ? JSON.parse(messageData.data) : messageData.data;
          
          // Extract data from the root level (not from metadata) based on your network data
          const {
            chatroom_id,
            target_sub_account_id,
            target_sub_account_name,
            message_preview,
            username,
            user_id,
            timestamp
          } = parsedData;

          // Also try to get from metadata as fallback
          const metadataVals = parsedData.metadata || {};
          const actualData = {
            chatroom_id: chatroom_id || metadataVals.chatroom_id,
            target_sub_account_id: target_sub_account_id || metadataVals.target_sub_account_id,
            target_sub_account_name: target_sub_account_name || metadataVals.target_sub_account_name,
            message_preview: message_preview || metadataVals.message_preview,
            username: username || metadataVals.username,
            user_id: user_id || metadataVals.user_id,
            timestamp: timestamp || metadataVals.timestamp
          };

          console.log('🔍 Extracted event data:', {
            ...actualData,
            currentSubAccounts: subAccountsWithChatrooms.map(sa => ({ id: sa.id, name: sa.display_name })),
            originalParsedData: parsedData
          });

          // Use the extracted actual data
          const { 
            chatroom_id: finalChatroomId,
            target_sub_account_id: finalSubAccountId,
            target_sub_account_name: finalSubAccountName,
            message_preview: finalMessagePreview,
            username: finalUsername,
            user_id: finalUserId,
            timestamp: finalTimestamp
          } = actualData;

          // Show Sonner toast notification
          toast(`New message from ${finalUsername || 'Unknown User'}`, {
            description: finalMessagePreview || 'New message received',
            action: {
              label: 'View Chat',
              onClick: () => handleExpandChatroomFromToast(finalChatroomId, finalSubAccountId)
            },
            duration: 5000,
          });

          // Update or create chatroom in the sub-account
          setSubAccountsWithChatrooms(prevSubAccounts => {
            console.log('📝 Updating sub-accounts state. Before update:', {
              totalSubAccounts: prevSubAccounts.length,
              targetSubAccountExists: prevSubAccounts.some(sa => sa.id === finalSubAccountId),
              targetSubAccountChatrooms: prevSubAccounts.find(sa => sa.id === finalSubAccountId)?.chatrooms?.length || 0
            });
            
            const updatedSubAccounts = prevSubAccounts.map(subAccount => {
              if (subAccount.id === finalSubAccountId) {
                console.log('🎯 Found matching sub-account:', subAccount.display_name);
                
                const existingChatroomIndex = subAccount.chatrooms?.findIndex(c => c.id === finalChatroomId) ?? -1;
                
                if (existingChatroomIndex >= 0) {
                  console.log('✏️ Updating existing chatroom at index:', existingChatroomIndex);
                  
                  // Update existing chatroom
                  const updatedChatrooms = [...(subAccount.chatrooms || [])];
                  updatedChatrooms[existingChatroomIndex] = {
                    ...updatedChatrooms[existingChatroomIndex],
                    hasUnreadMessages: true,
                    latestMessagePreview: finalMessagePreview,
                    latestMessageTimestamp: finalTimestamp,
                    latestMessageUsername: finalUsername,
                    latestMessageUserId: finalUserId,
                    last_activity_at: finalTimestamp
                  };
                  
                  // Move to top
                  const chatroomToMove = updatedChatrooms.splice(existingChatroomIndex, 1)[0];
                  updatedChatrooms.unshift(chatroomToMove);
                  
                  return {
                    ...subAccount,
                    chatrooms: updatedChatrooms
                  };
                } else {
                  console.log('➕ Creating new chatroom');
                  
                  // Create new chatroom
                  const newChatroom: Chatroom = {
                    id: finalChatroomId,
                    status: 'active',
                    created_at: finalTimestamp,
                    last_activity_at: finalTimestamp,
                    hasUnreadMessages: true,
                    latestMessagePreview: finalMessagePreview,
                    latestMessageTimestamp: finalTimestamp,
                    latestMessageUsername: finalUsername,
                    latestMessageUserId: finalUserId,
                    metadata: {
                      participants: {
                        user: {
                          username: finalUsername
                        }
                      }
                    }
                  };
                  
                  // Add to top of chatrooms list
                  return {
                    ...subAccount,
                    chatrooms: [newChatroom, ...(subAccount.chatrooms || [])]
                  };
                }
              }
              return subAccount;
            });
            
            console.log('✅ Sub-accounts state updated. After update:', {
              totalSubAccounts: updatedSubAccounts.length,
              targetSubAccountChatrooms: updatedSubAccounts.find(sa => sa.id === finalSubAccountId)?.chatrooms?.length || 0
            });
            
            return updatedSubAccounts;
          });
        }
        
        // Check if this is a new_message event for a chatroom (existing logic)
        else if (messageData.eventName === 'new_message' && messageData.data?.chatroom_id) {
          const chatroomId = messageData.data.chatroom_id;
          console.log('🔍 Processing new_message for chatroom:', chatroomId);
          
          // Only add message if we have this chatroom loaded
          setChatroomMessages(prev => {
            const existingData = prev[chatroomId];
            console.log('📊 Existing chatroom data:', existingData ? `${existingData.items.length} messages` : 'No data found');
            console.log('📊 Current expanded chatroom:', expandedChatroom);
            console.log('📊 All loaded chatrooms:', Object.keys(prev));
            
            if (existingData) {
              // Check if this message already exists (to avoid duplicates from our own sends)
              const messageExists = existingData.items.some(item => 
                item.id === messageData.data.id || 
                (item.message === messageData.data.message && 
                 item.sender_id === messageData.data.sender_id &&
                 Math.abs(new Date(item.created_at).getTime() - new Date(messageData.data.timestamp).getTime()) < 5000) // Within 5 seconds
              );
              
              if (messageExists) {
                console.log('⚠️ Message already exists, skipping duplicate from Pusher');
                return prev;
              }
              
              const newMessage: Message = {
                id: messageData.data.id,
                chatroom_id: messageData.data.chatroom_id,
                sender_id: messageData.data.sender_id,
                sender_type: messageData.data.sender_type,
                message: messageData.data.message,
                message_type: messageData.data.message_type,
                metadata: messageData.data.metadata || {},
                is_edited: false,
                is_deleted: false,
                edited_at: null,
                read_by: [],
                created_at: messageData.data.timestamp,
                updated_at: messageData.data.timestamp,
                sender_details: messageData.data.sender_details
              };
              
              console.log('✅ Adding new message to chatroom:', chatroomId, newMessage);
              
              return {
                ...prev,
                [chatroomId]: {
                  ...existingData,
                  items: [...existingData.items, newMessage],
                  total_items: existingData.total_items + 1
                }
              };
            }
            console.log('⚠️ Chatroom not loaded, ignoring message for:', chatroomId);
            return prev;
          });
        }
      };
      
      // Add event listeners
      pusherService.addEventListener('connection:success', handleConnectionSuccess);
      pusherService.addEventListener('connection:disconnected', handleConnectionDisconnected);
      pusherService.addEventListener('connection:error', handleConnectionError);
      pusherService.addEventListener('connection:failed', handleConnectionFailed);
      pusherService.addEventListener('message:any', handleGeneralMessage);
      
      // Cleanup function
      return () => {
        pusherService.removeEventListener('connection:success', handleConnectionSuccess);
        pusherService.removeEventListener('connection:disconnected', handleConnectionDisconnected);
        pusherService.removeEventListener('connection:error', handleConnectionError);
        pusherService.removeEventListener('connection:failed', handleConnectionFailed);
        pusherService.removeEventListener('message:any', handleGeneralMessage);
      };
    }
  }, [authState.isPusherConnected]);

  const loadChatroomsForAllSubAccounts = async () => {
    // Use the existing subAccounts from authState for initial load
    await loadChatroomsForSubAccounts(authState.subAccounts);
  };

  // Note: Chatroom subscriptions are now handled on-demand when chatrooms are clicked
  // This function is kept for reference but no longer used
  const subscribeToAllChatrooms = async () => {
    console.log('ℹ️ subscribeToAllChatrooms is deprecated - using on-demand subscription instead');
    return;
  };

  const loadMessagesForChatroom = async (chatroomId: string, subAccountId: string, page: number = 1, loadAll: boolean = false) => {
    if (!authState.userSession?.access_token) {
      setError('No authentication token available');
      return;
    }

    try {
      setLoadingMessages(prev => ({ ...prev, [chatroomId]: true }));
      setError(null);
      
      console.log(`🚀 Loading messages for chatroom ${chatroomId}, sub-account ${subAccountId}, page ${page}`);
      
      const response = await fetch(`${CONFIG.api.base_url}/api/v1/agent/chatrooms/${chatroomId}/messages?sub_account_id=${subAccountId}&page=${page}&page_size=20`, {
        headers: {
          'Authorization': `Bearer ${authState.userSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.data) {
        const messagesData: MessagesData = result.data;
        console.log(`✅ Loaded ${messagesData.items.length} messages for chatroom ${chatroomId}, page ${page}/${messagesData.total_pages}`);
        console.log(`📊 Pagination info: has_previous=${messagesData.has_previous}, has_next=${messagesData.has_next}, current_page=${messagesData.current_page}`);
        
        if (loadAll && messagesData.has_next) {
          // 🔄 递归加载所有页面的消息
          console.log(`🔄 Loading all pages... Current: ${page}/${messagesData.total_pages}`);
          
          // 先存储当前页面的消息
          setChatroomMessages(prev => {
            const existingData = prev[chatroomId];
            if (page === 1 || !existingData) {
              return { 
                ...prev, 
                [chatroomId]: {
                  ...messagesData,
                  items: [...messagesData.items].reverse()
                }
              };
            } else {
              return {
                ...prev,
                [chatroomId]: {
                  ...existingData,
                  items: [...messagesData.items.reverse(), ...existingData.items],
                  total_items: messagesData.total_items,
                  current_page: messagesData.current_page,
                  has_previous: messagesData.has_previous,
                  has_next: messagesData.has_next
                }
              };
            }
          });
          
          // 递归加载下一页
          await loadMessagesForChatroom(chatroomId, subAccountId, page + 1, true);
        } else {
          // 🎯 正常的分页加载或最后一页
          setChatroomMessages(prev => {
            const existingData = prev[chatroomId];
            if (page === 1 || !existingData) {
              // First page or no existing data - reverse the array to show oldest first
              return { 
                ...prev, 
                [chatroomId]: {
                  ...messagesData,
                  items: [...messagesData.items].reverse()
                }
              };
            } else {
              // Append older messages at the top (don't reverse existing messages)
              // Keep the original pagination info but update has_previous based on new data
              return {
                ...prev,
                [chatroomId]: {
                  ...existingData,
                  items: [...messagesData.items.reverse(), ...existingData.items],
                  total_items: messagesData.total_items,
                  current_page: messagesData.current_page,
                  has_previous: messagesData.has_previous,
                  has_next: messagesData.has_next
                }
              };
            }
          });
          
          if (loadAll) {
            console.log(`✅ Finished loading all messages for chatroom ${chatroomId}`);
          }
        }
        
        // Store which sub-account this chatroom belongs to
        setCurrentSubAccountForChatroom(prev => ({ ...prev, [chatroomId]: subAccountId }));
        
        // Mark chatroom as read when messages are loaded for the first time (page 1)
        if (page === 1) {
          setSubAccountsWithChatrooms(prevSubAccounts => 
            prevSubAccounts.map(subAccount => 
              subAccount.id === subAccountId 
                ? {
                    ...subAccount,
                    chatrooms: subAccount.chatrooms?.map(chatroom => 
                      chatroom.id === chatroomId 
                        ? { ...chatroom, hasUnreadMessages: false }
                        : chatroom
                    )
                  }
                : subAccount
            )
          );
        }
      } else {
        console.warn(`⚠️ Failed to load messages for chatroom ${chatroomId}:`, result.msg || result.detail || 'Unknown error');
        setError('Failed to load messages');
      }
    } catch (error) {
      console.error(`❌ Error loading messages for chatroom ${chatroomId}:`, error);
      setError('Error loading messages');
    } finally {
      setLoadingMessages(prev => ({ ...prev, [chatroomId]: false }));
    }
  };

  // 🎯 统一的子账户信息获取函数
  const getSubAccountInfo = (subAccountId: string) => {
    const subAccount = subAccountsWithChatrooms.find(sa => sa.id === subAccountId);
    return {
      id: subAccountId,
      name: subAccount?.display_name || subAccount?.name || subAccountId, // 优先使用display_name
      subAccount: subAccount
    };
  };

  // 🎯 统一的聊天室展开逻辑
  const handleChatroomExpand = async (chatroomId: string, providedSubAccountId?: string) => {
    // 查找当前聊天室对应的子账户ID，优先使用提供的参数
    const subAccountId = providedSubAccountId || 
      currentSubAccountForChatroom[chatroomId] || 
      subAccountsWithChatrooms.find(sa => 
        sa.chatrooms?.some(room => room.id === chatroomId)
      )?.id;
    
    if (!subAccountId) {
      console.error(`❌ Cannot find sub-account for chatroom ${chatroomId}`);
      toast.error('Cannot find sub-account for chatroom');
      return;
    }

    const { name: subAccountName } = getSubAccountInfo(subAccountId);
    console.log(`🔔 Expanding chatroom ${chatroomId}, subscribing...`);
    
    try {
      // 订阅聊天室
      await authApiService.subscribeToChatroom(chatroomId, subAccountName);
      setSubscribedChatrooms(prev => new Set(prev).add(chatroomId));
      
      // 设置展开状态
      setExpandedChatroom(chatroomId);
      
      // 记录子账户映射关系
      setCurrentSubAccountForChatroom(prev => ({ ...prev, [chatroomId]: subAccountId }));
      
      // 加载第一页最新消息
      console.log(`🔄 Loading latest messages for chatroom ${chatroomId}`);
      await loadMessagesForChatroom(chatroomId, subAccountId, 1, false); // 只加载第一页
      
      // 滚动到底部显示最新消息
      setTimeout(() => scrollToBottom(chatroomId), 200);
      
      console.log(`✅ Successfully expanded chatroom ${chatroomId}`);
    } catch (error) {
      console.error(`❌ Failed to expand chatroom ${chatroomId}:`, error);
      toast.error('展开聊天室失败，请重试');
    }
  };

  // 🎯 统一的聊天室收缩逻辑  
  const handleChatroomCollapse = async (chatroomId: string) => {
    const subAccountId = currentSubAccountForChatroom[chatroomId];
    if (!subAccountId) {
      console.error(`❌ Cannot find sub-account for chatroom ${chatroomId} during collapse`);
      setExpandedChatroom(null); // 仍然执行UI收缩
      return;
    }

    const { name: subAccountName } = getSubAccountInfo(subAccountId);
    console.log(`🔕 Collapsing chatroom ${chatroomId}, unsubscribing...`);
    
    try {
      // 取消订阅聊天室
      await authApiService.unsubscribeFromChatroom(chatroomId, subAccountName);
      setSubscribedChatrooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatroomId);
        return newSet;
      });
      
      console.log(`✅ Successfully collapsed chatroom ${chatroomId}`);
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from chatroom ${chatroomId}:`, error);
      toast.error('取消订阅失败，但聊天室已收缩');
    } finally {
      // 无论是否成功，都执行UI收缩
      setExpandedChatroom(null);
    }
  };

  // 🎯 统一的展开/收缩切换逻辑
  const handleChatroomToggle = async (chatroomId: string) => {
    if (expandedChatroom === chatroomId) {
      await handleChatroomCollapse(chatroomId);
    } else {
      await handleChatroomExpand(chatroomId);
    }
  };

  const loadMoreMessages = (chatroomId: string) => {
    const messagesData = chatroomMessages[chatroomId];
    const subAccountId = currentSubAccountForChatroom[chatroomId];
    
    console.log(`🔍 Load More check for ${chatroomId}:`, {
      hasData: !!messagesData,
      hasSubAccount: !!subAccountId,
      has_previous: messagesData?.has_previous,
      has_next: messagesData?.has_next,
      current_page: messagesData?.current_page,
      total_pages: messagesData?.total_pages,
      isLoading: loadingMessages[chatroomId]
    });
    
    if (messagesData && subAccountId && messagesData.has_next && !loadingMessages[chatroomId]) {
      const nextPage = messagesData.current_page + 1;
      console.log(`📄 Loading more messages: page ${nextPage}`);
      loadMessagesForChatroom(chatroomId, subAccountId, nextPage, false); // 分页加载，不加载全部
    } else {
      console.log(`❌ Cannot load more messages - conditions not met`);
    }
  };

  const handleSendMessage = async (subAccountId: string) => {
    if (!newMessage.trim() || !expandedChatroom) return;

    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    
    // Clear input immediately
    setNewMessage('');

    try {
      setSendingMessage(true);
      setError(null);

      // Prepare message data - API expects 'message' field, not 'content'
      const messageData = {
        message: messageContent,
        message_type: 'text',
        sender_type: 'subaccount'
      };

      console.log('🚀 Sending message to chatroom:', expandedChatroom, 'from sub-account:', subAccountId, messageData);
      
      // API requires sub_account_id as query parameter
      const response = await fetch(`${CONFIG.api.base_url}/api/v1/agent/chatrooms/${expandedChatroom}/messages?sub_account_id=${subAccountId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.userSession.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      const result = await response.json();
      console.log('✅ Message sent response:', result);

      if (response.ok) {
        console.log('✅ Message sent successfully');
      } else {
        // Store failed message for retry
        setFailedMessages(prev => ({
          ...prev,
          [tempId]: {
            message: messageContent,
            chatroomId: expandedChatroom,
            subAccountId: subAccountId
          }
        }));

        setError('Failed to send message');
        console.error('❌ Failed to send message:', result);
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      
      // Store failed message for retry
      setFailedMessages(prev => ({
        ...prev,
        [tempId]: {
          message: messageContent,
          chatroomId: expandedChatroom,
          subAccountId: subAccountId
        }
      }));

      setError('Error sending message');
    } finally {
      setSendingMessage(false);
    }
  };

  const retryFailedMessage = async (tempId: string) => {
    const failedMsg = failedMessages[tempId];
    if (!failedMsg) return;

    // Remove from failed messages
    setFailedMessages(prev => {
      const newFailed = { ...prev };
      delete newFailed[tempId];
      return newFailed;
    });

    // Set the message content and retry
    setNewMessage(failedMsg.message);
    await handleSendMessage(failedMsg.subAccountId);
  };

  // Handle manual reconnection attempt
  const handleReconnect = async () => {
    if (connectionStatus.isConnecting || !authState.userSession?.access_token) {
      console.log('⚠️ Already connecting or no auth session available');
      return;
    }

    try {
      console.log('🔄 Manual reconnection attempt...');
      setConnectionStatus(prev => ({ ...prev, isConnecting: true }));
      
      // Attempt to reinitialize Pusher connection
      await authApiService.initializePusherConnection();
      
      console.log('✅ Manual reconnection successful');
      
    } catch (error) {
      console.error('❌ Manual reconnection failed:', error);
      setConnectionStatus(prev => ({ 
        ...prev, 
        isConnecting: false,
        reconnectAttempts: prev.reconnectAttempts + 1
      }));
    }
  };

  // Early return if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">
              Please authenticate to access the chat interface.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Connection Status Bar */}
      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Connected & Authenticated
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>🔑 JWT: Active</span>
            <span>🔐 Authenticated: Yes</span>
            <span>📊 Sub-Accounts: {authState.subAccounts.length}</span>
            <span>🔔 Pusher: {authState.isPusherConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-muted-foreground">Loading chatrooms...</p>
          </div>
        </div>
      ) : (
        // Sub-Accounts and Chatrooms Display
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium">Chat Management</h2>
            <div className="flex items-center gap-2">
              {/* Load All Chatrooms button when auto-load is disabled */}
              {!CONFIG.chat.auto_load_chatrooms_on_login && (
                <Button 
                  onClick={async () => {
                    if (subAccountsWithChatrooms.length > 0) {
                      await loadChatroomsForSubAccounts(subAccountsWithChatrooms);
                    }
                  }} 
                  variant="outline" 
                  size="sm"
                  disabled={loading || subAccountsWithChatrooms.length === 0}
                >
                  <span className="text-base mr-2">📋</span>
                  Load All Chatrooms
                </Button>
              )}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <>
                  <Button 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 1}
                    variant="outline" 
                    size="sm"
                  >
                    ← Prev
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages}
                    variant="outline" 
                    size="sm"
                  >
                    Next →
                  </Button>
                </>
              )}
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <span className="text-base mr-2">🔄</span>
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="flex flex-row gap-4 flex-1">
            {currentSubAccounts.map((subAccount) => {
              const isEditing = editingSubAccountId === subAccount.id;
              
              return (
                <Card key={subAccount.id} className="h-full flex-1 flex flex-col">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{subAccount.display_name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={subAccount.is_active ? "default" : "secondary"}>
                          {subAccount.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {!isEditing ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditingSubAccount(subAccount)}
                            className="text-xs h-6 px-2"
                          >
                            ✏️ Edit
                          </Button>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={saveSubAccountChanges}
                              disabled={updatingSubAccount}
                              className="text-xs h-6 px-2"
                            >
                              {updatingSubAccount ? '⏳' : '💾'} Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditingSubAccount}
                              disabled={updatingSubAccount}
                              className="text-xs h-6 px-2"
                            >
                              ❌ Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Age: {subAccount.age} • {subAccount.location}</p>
                      <p>Active Chats: {subAccount.current_active_chats}/{subAccount.max_concurrent_chats}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col overflow-hidden">
                    {/* Sub-Account Info - Show all fields */}
                    <div className="space-y-3 pb-3 border-b flex-shrink-0">
                      {isEditing ? (
                        // Edit mode
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium">Name *</label>
                            <Input
                              value={editingSubAccountData.name || ''}
                              onChange={(e) => updateEditingSubAccountField('name', e.target.value)}
                              className="text-xs h-7"
                            />
                          </div>
                          
                          <div>
                            <label className="text-xs font-medium">Display Name *</label>
                            <Input
                              value={editingSubAccountData.display_name || ''}
                              onChange={(e) => updateEditingSubAccountField('display_name', e.target.value)}
                              className="text-xs h-7"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium">Avatar URL</label>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  value={editingSubAccountData.avatar_url || ''}
                                  onChange={(e) => updateEditingSubAccountField('avatar_url', e.target.value)}
                                  className="text-xs h-7 flex-1"
                                  placeholder="Enter avatar image URL"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={handleShowAvatarUploadModal}
                                  disabled={uploadingAvatar}
                                  className="text-xs h-7 px-2"
                                >
                                  {uploadingAvatar ? '⏳' : '📷'} Upload
                                </Button>
                              </div>
                              {editingSubAccountData.avatar_url && (
                                <div className="flex justify-center">
                                  <div className="w-16 h-16 rounded-full border overflow-hidden">
                                    <img 
                                      src={editingSubAccountData.avatar_url} 
                                      alt="Avatar preview" 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOUM5Q0EwIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzLjk3IDggMTUuMzQgOCAxOFYyMEgxNlYxOEMxNiAxNS4zNCAxNC42NyAxMy45NyAxMiAxNFoiIGZpbGw9IiM5QzlDQTAiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiLz4KPHN2Zz4=';
                                      }}
                                      title="Avatar preview"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs font-medium">Bio</label>
                            <Textarea
                              value={editingSubAccountData.bio || ''}
                              onChange={(e) => updateEditingSubAccountField('bio', e.target.value)}
                              className="text-xs"
                              rows={2}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs font-medium">Age</label>
                              <Input
                                type="number"
                                min="18"
                                max="100"
                                value={editingSubAccountData.age || 18}
                                onChange={(e) => updateEditingSubAccountField('age', parseInt(e.target.value) || 18)}
                                className="text-xs h-7"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium">Max Chats</label>
                              <Input
                                type="number"
                                min="1"
                                max="50"
                                value={editingSubAccountData.max_concurrent_chats || 5}
                                onChange={(e) => updateEditingSubAccountField('max_concurrent_chats', parseInt(e.target.value) || 5)}
                                className="text-xs h-7"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-xs font-medium">Location</label>
                            <Input
                              value={editingSubAccountData.location || ''}
                              onChange={(e) => updateEditingSubAccountField('location', e.target.value)}
                              className="text-xs h-7"
                            />
                          </div>
                          
                          <div>
                            <label className="text-xs font-medium">Gender</label>
                            <Select 
                              value={editingSubAccountData.gender || 'not_specified'}
                              onValueChange={(value) => updateEditingSubAccountField('gender', value)}
                            >
                              <SelectTrigger className="text-xs h-7">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_specified">Not specified</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="text-xs font-medium">Tags</label>
                            <Input
                              value={editingSubAccountData.tags || ''}
                              onChange={(e) => updateEditingSubAccountField('tags', e.target.value)}
                              placeholder="friendly, caring, professional"
                              className="text-xs h-7"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium">Photo URLs</label>
                            <div className="space-y-2">
                              {(editingSubAccountData.photo_urls || ['']).map((url, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex gap-2 items-center">
                                    <Input
                                      placeholder={`Photo URL ${index + 1}`}
                                      value={url}
                                      onChange={(e) => {
                                        const newPhotoUrls = [...(editingSubAccountData.photo_urls || [''])];
                                        newPhotoUrls[index] = e.target.value;
                                        updateEditingSubAccountField('photo_urls', newPhotoUrls);
                                      }}
                                      className="flex-1 text-xs h-7"
                                    />
                                    <div className="flex flex-col gap-1">
                                      {index > 0 && (
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            const newPhotoUrls = [...(editingSubAccountData.photo_urls || [''])];
                                            [newPhotoUrls[index], newPhotoUrls[index - 1]] = [newPhotoUrls[index - 1], newPhotoUrls[index]];
                                            updateEditingSubAccountField('photo_urls', newPhotoUrls);
                                          }}
                                          className="h-4 w-4 p-0 text-xs"
                                        >
                                          ↑
                                        </Button>
                                      )}
                                      {index < (editingSubAccountData.photo_urls || ['']).length - 1 && (
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            const newPhotoUrls = [...(editingSubAccountData.photo_urls || [''])];
                                            [newPhotoUrls[index], newPhotoUrls[index + 1]] = [newPhotoUrls[index + 1], newPhotoUrls[index]];
                                            updateEditingSubAccountField('photo_urls', newPhotoUrls);
                                          }}
                                          className="h-4 w-4 p-0 text-xs"
                                        >
                                          ↓
                                        </Button>
                                      )}
                                    </div>
                                    {(editingSubAccountData.photo_urls || ['']).length > 1 && (
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          const newPhotoUrls = (editingSubAccountData.photo_urls || ['']).filter((_, i) => i !== index);
                                          updateEditingSubAccountField('photo_urls', newPhotoUrls.length > 0 ? newPhotoUrls : ['']);
                                        }}
                                        className="h-6 w-6 p-0 text-red-500 text-xs"
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                  {url && (
                                    <div className="flex justify-center">
                                      <div className="w-16 h-16 rounded border overflow-hidden relative group">
                                        <img 
                                          src={url} 
                                          alt={`Photo ${index + 1} preview`}
                                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                          onError={(e) => {
                                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAyMEMxNy42NTY5IDIwIDE5IDE4LjY1NjkgMTkgMTdDMTkgMTUuMzQzMSAxNy42NTY5IDE0IDE2IDE0QzE0LjM0MzEgMTQgMTMgMTUuMzQzMSAxMyAxN0MxMyAxOC42NTY5IDE0LjM0MzEgMjAgMTYgMjBaIiBmaWxsPSIjOUM5Q0EwIi8+CjxwYXRoIGQ9Ik0xMCAzMkw0MCAzMkw0MCAyNkwzNCAyMEwyNiAyOEwxNiAyMkwxMCAzMloiIGZpbGw9IiM5QzlDQTAiLz4KPHN2Zz4=';
                                          }}
                                          title={`Photo ${index + 1}: ${url}`}
                                        />
                                        {/* Delete button overlay */}
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => {
                                            const newPhotoUrls = [...(editingSubAccountData.photo_urls || [''])];
                                            newPhotoUrls[index] = ''; // Clear this URL
                                            updateEditingSubAccountField('photo_urls', newPhotoUrls);
                                          }}
                                          className="absolute top-0 right-0 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Delete this photo"
                                        >
                                          ×
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={handleShowPhotoUploadModal}
                                  disabled={uploadingPhoto}
                                  className="flex-1 h-6 text-xs"
                                >
                                  {uploadingPhoto ? '⏳ Uploading...' : '📷 + Add Photo'}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const newPhotoUrls = [...(editingSubAccountData.photo_urls || ['']), ''];
                                    updateEditingSubAccountField('photo_urls', newPhotoUrls);
                                  }}
                                  className="flex-1 h-6 text-xs"
                                >
                                  🔗 + Add Photo URL
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // View mode - show all fields
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Name:</span>
                            <span className="text-xs text-muted-foreground">{subAccount.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Display Name:</span>
                            <span className="text-xs text-muted-foreground">{subAccount.display_name}</span>
                          </div>

                          {subAccount.avatar_url && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">Avatar:</span>
                              <div className="w-12 h-12 rounded-full border overflow-hidden flex-shrink-0">
                                <img 
                                  src={subAccount.avatar_url} 
                                  alt="Avatar" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOUM5Q0EwIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzLjk3IDggMTUuMzQgOCAxOFYyMEgxNlYxOEMxNiAxNS4zNCAxNC42NyAxMy45NyAxMiAxNFoiIGZpbGw9IiM5QzlDQTAiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiLz4KPHN2Zz4=';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Bio:</span>
                            <span className="text-xs text-muted-foreground">{subAccount.bio || 'No bio provided'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Age:</span>
                            <span className="text-xs text-muted-foreground">{subAccount.age} years old</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Location:</span>
                            <span className="text-xs text-muted-foreground">{subAccount.location || 'Not specified'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Gender:</span>
                            <span className="text-xs text-muted-foreground">
                              {subAccount.gender === 'male' ? 'Male' : 
                               subAccount.gender === 'female' ? 'Female' : 'Not specified'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Max Chats:</span>
                            <span className="text-xs text-muted-foreground">{subAccount.max_concurrent_chats}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Status:</span>
                            <Badge variant={subAccount.status === 'available' ? "default" : "secondary"} className="text-xs">
                              {subAccount.status}
                            </Badge>
                          </div>
                          
                          {subAccount.tags.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">Tags:</span>
                              <div className="flex gap-1 flex-wrap">
                                {subAccount.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {subAccount.photo_urls.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">Photos:</span>
                              <div className="flex gap-1 flex-wrap">
                                {subAccount.photo_urls.slice(0, 5).map((url, index) => (
                                  <div key={index} className="w-12 h-12 rounded border overflow-hidden flex-shrink-0">
                                    <img 
                                      src={url} 
                                      alt={`Photo ${index + 1}`} 
                                      className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAyMEMxNy42NTY5IDIwIDE5IDE4LjY1NjkgMTkgMTdDMTkgMTUuMzQzMSAxNy42NTY5IDE0IDE2IDE0QzE0LjM0MzEgMTQgMTMgMTUuMzQzMSAxMyAxN0MxMyAxOC42NTY5IDE0LjM0MzEgMjAgMTYgMjBaIiBmaWxsPSIjOUM5Q0EwIi8+CjxwYXRoIGQ9Ik0xMCAzMkw0MCAzMkw0MCAyNkwzNCAyMEwyNiAyOEwxNiAyMkwxMCAzMloiIGZpbGw9IiM5QzlDQTAiLz4KPHN2Zz4=';
                                      }}
                                      title={`Photo ${index + 1}: ${url}`}
                                    />
                                  </div>
                                ))}
                                {subAccount.photo_urls.length > 5 && (
                                  <div className="w-12 h-12 rounded border flex items-center justify-center bg-muted text-xs text-muted-foreground">
                                    +{subAccount.photo_urls.length - 5}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {subAccount.last_activity_at && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">Last Activity:</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(subAccount.last_activity_at).toLocaleString()}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Created:</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(subAccount.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chatrooms Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex items-center justify-between mb-2 flex-shrink-0">
                        <h4 className="text-sm font-medium">Chatrooms</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {subAccount.chatrooms?.length || 0} total
                          </span>
                          {/* Show load button when auto-load is disabled and no chatrooms loaded */}
                          {!CONFIG.chat.auto_load_chatrooms_on_login && (!subAccount.chatrooms || subAccount.chatrooms.length === 0) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadChatroomsForSingleSubAccount(subAccount.id)}
                              className="text-xs h-6 px-2"
                            >
                              📋 Load Chatrooms
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Auto-load disabled notice */}
                      {!CONFIG.chat.auto_load_chatrooms_on_login && (!subAccount.chatrooms || subAccount.chatrooms.length === 0) && (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                          <div className="text-center p-4">
                            <div className="text-xl mb-2">📋</div>
                            <p className="text-xs mb-2">Auto-load disabled</p>
                            <p className="text-xs">Click "Load Chatrooms" to fetch</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Normal chatrooms display */}
                      {subAccount.chatrooms && subAccount.chatrooms.length > 0 ? (
                        <div className="flex-1 overflow-y-scroll">
                          {subAccount.chatrooms.map((chatroom) => (
                            <div key={chatroom.id} className="mb-2">
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left h-auto p-3"
                                onClick={() => handleChatroomToggle(chatroom.id)}
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-sm flex items-center gap-2">
                                    <span>Chatroom {chatroom.id.slice(0, 8)}...</span>
                                    {subscribedChatrooms.has(chatroom.id) && (
                                      <span className="text-green-500 text-xs" title="Subscribed to real-time updates">
                                        🔔
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Status: {chatroom.status}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Created: {new Date(chatroom.created_at).toLocaleDateString()}
                                  </div>
                                  {chatroom.metadata?.participants?.user && (
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                      <span>
                                        User: {chatroom.metadata.participants.user.full_name || chatroom.metadata.participants.user.username}
                                      </span>
                                      {chatroom.hasUnreadMessages && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Unread messages"></div>
                                      )}
                                    </div>
                                  )}
                                  {chatroom.latestMessagePreview && (
                                    <div className="text-xs text-muted-foreground mt-1 truncate">
                                      <span className="font-medium">Latest:</span> {chatroom.latestMessagePreview}
                                    </div>
                                  )}
                                </div>
                                <span className="text-base ml-2">💬</span>
                              </Button>
                              
                              {expandedChatroom === chatroom.id && (
                                <Card className="mt-2 border-2">
                                  <CardHeader className="py-3">
                                    <div className="flex justify-between items-center">
                                      <CardTitle className="text-sm">Chat Messages</CardTitle>
                                      <div className="flex items-center gap-2">
                                        {/* Connection Status Indicators */}
                                        <div className="flex items-center gap-1 text-xs">
                                          <div className={`w-2 h-2 rounded-full ${
                                            connectionStatus.isConnecting ? 'bg-yellow-500 animate-pulse' : 
                                            connectionStatus.isConnected ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse'
                                          }`} title={
                                            connectionStatus.isConnecting ? 'Reconnecting...' : 
                                            connectionStatus.isConnected ? 'Connected' : 'Attempting reconnection'
                                          }></div>
                                          <span className={
                                            connectionStatus.isConnecting ? 'text-yellow-600' : 
                                            connectionStatus.isConnected ? 'text-green-600' : 'text-orange-600'
                                          }>
                                            {connectionStatus.isConnecting ? 'Reconnecting...' : 
                                             connectionStatus.isConnected ? 'Connected' : 'Reconnecting...'}
                                          </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 text-xs">
                                          <div className={`w-2 h-2 rounded-full ${expandedChatroom === chatroom.id ? 'bg-blue-500' : 'bg-gray-400'}`} title={expandedChatroom === chatroom.id ? 'Subscribed to chatroom' : 'Not subscribed'}></div>
                                          <span className={expandedChatroom === chatroom.id ? 'text-blue-600' : 'text-gray-500'}>
                                            {expandedChatroom === chatroom.id ? 'Subscribed' : 'Unsubscribed'}
                                          </span>
                                        </div>
                                        
                                        {/* Load All History Button */}
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => loadMessagesForChatroom(chatroom.id, subAccount.id, 1, true)}
                                          disabled={loadingMessages[chatroom.id]}
                                          className="text-xs"
                                          title="加载完整聊天历史（所有页面）"
                                        >
                                          {loadingMessages[chatroom.id] ? '⏳' : '📚'} Load All History
                                        </Button>
                                        
                                        {chatroomMessages[chatroom.id]?.has_next && (
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => loadMoreMessages(chatroom.id)}
                                            disabled={loadingMessages[chatroom.id]}
                                            className="text-xs"
                                          >
                                            {loadingMessages[chatroom.id] ? '⏳' : '📄'} Load More
                                          </Button>
                                        )}
                                        
                                        {/* Reconnect Button - show when not connected and not already connecting */}
                                        {!connectionStatus.isConnected && !connectionStatus.isConnecting && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleReconnect()}
                                            className="text-xs"
                                          >
                                            🔄 Reconnect
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Connection Details */}
                                    {(connectionStatus.isConnecting || connectionStatus.reconnectAttempts > 0) && (
                                      <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
                                        {connectionStatus.isConnecting && (
                                          <div className="flex items-center gap-1 text-yellow-600">
                                            <span>🔄</span>
                                            Attempting to reconnect...
                                          </div>
                                        )}
                                        {connectionStatus.reconnectAttempts > 0 && (
                                          <div className="flex items-center gap-1">
                                            <span>🔄</span>
                                            Reconnection attempts: {connectionStatus.reconnectAttempts}
                                          </div>
                                        )}
                                        {connectionStatus.lastConnectedAt && (
                                          <div className="flex items-center gap-1">
                                            <span>🕒</span>
                                            Last connected: {connectionStatus.lastConnectedAt.toLocaleTimeString()}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </CardHeader>
                                  <CardContent>
                                    <div 
                                      ref={getOrCreateScrollRef(chatroom.id)}
                                      className="h-64 mb-3 p-2 border rounded overflow-y-auto"
                                      style={{ scrollBehavior: 'smooth' }}
                                    >
                                      <div className="space-y-2">
                                        {/* Load More Messages Button - Always show at top */}
                                        <div className="text-center pb-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => loadMoreMessages(chatroom.id)}
                                            disabled={loadingMessages[chatroom.id] || !chatroomMessages[chatroom.id]?.has_next}
                                          >
                                            {loadingMessages[chatroom.id] ? '⏳ Loading...' : '📄 Load More Messages'}
                                          </Button>
                                          {chatroomMessages[chatroom.id] && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                              Page {chatroomMessages[chatroom.id].current_page || 1} of {chatroomMessages[chatroom.id].total_pages || 1}
                                              {!chatroomMessages[chatroom.id].has_next && ' (No more messages)'}
                                              <br/>
                                              <span className="text-blue-500">
                                                Debug: has_next={chatroomMessages[chatroom.id].has_next?.toString()}, has_previous={chatroomMessages[chatroom.id].has_previous?.toString()}, total_items={chatroomMessages[chatroom.id].total_items}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {/* Messages Display */}
                                        {loadingMessages[chatroom.id] && !chatroomMessages[chatroom.id] ? (
                                          <div className="text-center text-xs text-muted-foreground">
                                            <span className="text-base">⏳</span> Loading messages...
                                          </div>
                                        ) : chatroomMessages[chatroom.id]?.items.length ? (
                                          chatroomMessages[chatroom.id].items
                                            .filter(message => message.message_type !== 'system')
                                            .map((message) => (
                                            <div key={message.id} className={`flex ${message.sender_type === 'user' ? 'justify-start' : 'justify-end'}`}>
                                              <div className={`max-w-[70%] p-2 rounded-lg text-sm ${
                                                message.sender_type === 'user' 
                                                  ? 'bg-muted' 
                                                  : 'bg-primary text-primary-foreground'
                                              }`}>
                                                <div>{message.message}</div>
                                                <div className="text-xs opacity-70 mt-1">
                                                  {message.sender_details?.username || (message.sender_id ? message.sender_id.slice(0, 8) + '...' : 'Unknown')} • {new Date(message.created_at).toLocaleTimeString()}
                                                </div>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-center text-xs text-muted-foreground">
                                            No messages yet. Start the conversation!
                                          </div>
                                        )}
                                        
                                        {/* Failed Message Error */}
                                        {Object.entries(failedMessages).some(([, failed]) => (failed as {message: string, chatroomId: string, subAccountId: string}).chatroomId === chatroom.id) && (
                                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs text-red-600 dark:text-red-400">
                                                ❌ Message failed to send
                                              </span>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-6"
                                                onClick={() => {
                                                  const failedEntry = Object.entries(failedMessages).find(([, failed]) => (failed as {message: string, chatroomId: string, subAccountId: string}).chatroomId === chatroom.id);
                                                  if (failedEntry) retryFailedMessage(failedEntry[0]);
                                                }}
                                              >
                                                🔄 Retry
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !sendingMessage && handleSendMessage(subAccount.id)}
                                        className="flex-1"
                                        disabled={sendingMessage}
                                      />
                                      <Button size="sm" onClick={() => handleSendMessage(subAccount.id)} disabled={sendingMessage || !newMessage.trim()}>
                                        <span className="text-base">{sendingMessage ? '⏳' : '📤'}</span>
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <div className="text-2xl mb-2">💬</div>
                            <p className="text-sm">No chatrooms found</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Add New Subaccount Card */}
            {showAddNewCard && (
              <Card className="h-full flex-1 flex flex-col border-dashed border-2">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-base text-center">
                    {showNewSubaccountForm ? 'Create New Subaccount' : 'Add New Subaccount'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                  {!showNewSubaccountForm ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Button 
                        onClick={() => setShowNewSubaccountForm(true)}
                        variant="outline"
                        size="lg"
                        className="h-32 w-full border-dashed"
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">➕</div>
                          <p className="text-sm">Add New Subaccount</p>
                        </div>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1 overflow-y-auto">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Name *</label>
                          <Input
                            placeholder="Enter unique name"
                            value={newSubaccountData.name}
                            onChange={(e) => setNewSubaccountData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Display Name *</label>
                          <Input
                            placeholder="Enter display name"
                            value={newSubaccountData.display_name}
                            onChange={(e) => setNewSubaccountData(prev => ({ ...prev, display_name: e.target.value }))}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Avatar URL</label>
                          <div className="space-y-2">
                            <Input
                              placeholder="Enter avatar image URL"
                              value={newSubaccountData.avatar_url}
                              onChange={(e) => setNewSubaccountData(prev => ({ ...prev, avatar_url: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">
                              💡 Avatar upload will be available after creating the subaccount
                            </p>
                            {newSubaccountData.avatar_url && (
                              <div className="flex justify-center">
                                <img 
                                  src={newSubaccountData.avatar_url} 
                                  alt="Avatar preview" 
                                  className="w-16 h-16 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOUM5Q0EwIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzLjk3IDggMTUuMzQgOCAxOFYyMEgxNlYxOEMxNiAxNS4zNCAxNC42NyAxMy45NyAxMiAxNFoiIGZpbGw9IiM5QzlDQTAiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiLz4KPHN2Zz4=';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Bio</label>
                          <Textarea
                            placeholder="Enter bio"
                            value={newSubaccountData.bio}
                            onChange={(e) => setNewSubaccountData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Photo URLs</label>
                          <div className="space-y-2">
                            {newSubaccountData.photo_urls.map((url, index) => (
                              <div key={index} className="flex gap-2 items-center">
                                <Input
                                  placeholder={`Photo URL ${index + 1}`}
                                  value={url}
                                  onChange={(e) => updatePhotoUrl(index, e.target.value)}
                                  className="flex-1"
                                />
                                {url && (
                                  <div className="w-12 h-12 rounded border overflow-hidden flex-shrink-0">
                                    <img 
                                      src={url} 
                                      alt={`Photo ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAyMEMxNy42NTY5IDIwIDE5IDE4LjY1NjkgMTkgMTdDMTkgMTUuMzQzMSAxNy42NTY5IDE0IDE2IDE0QzE0LjM0MzEgMTQgMTMgMTUuMzQzMSAxMyAxN0MxMyAxOC42NTY5IDE0LjM0MzEgMjAgMTYgMjBaIiBmaWxsPSIjOUM5Q0EwIi8+CjxwYXRoIGQ9Ik0xMCAzMkw0MCAzMkw0MCAyNkwzNCAyMEwyNiAyOEwxNiAyMkwxMCAzMloiIGZpbGw9IiM5QzlDQTAiLz4KPHN2Zz4=';
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="flex flex-col gap-1">
                                  {index > 0 && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => movePhotoUrl(index, index - 1)}
                                      className="h-6 w-6 p-0"
                                    >
                                      ↑
                                    </Button>
                                  )}
                                  {index < newSubaccountData.photo_urls.length - 1 && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => movePhotoUrl(index, index + 1)}
                                      className="h-6 w-6 p-0"
                                    >
                                      ↓
                                    </Button>
                                  )}
                                </div>
                                {newSubaccountData.photo_urls.length > 1 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removePhotoUrl(index)}
                                    className="h-8 w-8 p-0 text-red-500"
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleShowPhotoUploadModal}
                                disabled={uploadingPhoto}
                                className="flex-1"
                              >
                                {uploadingPhoto ? '⏳ Uploading...' : '📷 + Add Photo'}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addPhotoUrl}
                                className="flex-1"
                              >
                                🔗 + Add Photo URL
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Tags</label>
                          <Input
                            placeholder="Enter tags separated by commas (e.g. friendly, caring, professional)"
                            value={newSubaccountData.tags}
                            onChange={(e) => setNewSubaccountData(prev => ({ ...prev, tags: e.target.value }))}
                          />
                          {newSubaccountData.tags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {newSubaccountData.tags.split(',').map(tag => tag.trim()).filter(tag => tag).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium">Password (Optional)</label>
                          <Input
                            type="password"
                            placeholder="Enter password for agent login (min 6 chars)"
                            value={newSubaccountData.password}
                            onChange={(e) => setNewSubaccountData(prev => ({ ...prev, password: e.target.value }))}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-sm font-medium">Age</label>
                            <Input
                              type="number"
                              min="18"
                              max="100"
                              value={newSubaccountData.age}
                              onChange={(e) => setNewSubaccountData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Max Chats</label>
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              value={newSubaccountData.max_concurrent_chats}
                              onChange={(e) => setNewSubaccountData(prev => ({ ...prev, max_concurrent_chats: parseInt(e.target.value) || 5 }))}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Location</label>
                          <Input
                            placeholder="Enter location"
                            value={newSubaccountData.location}
                            onChange={(e) => setNewSubaccountData(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Gender</label>
                          <Select 
                            value={newSubaccountData.gender}
                            onValueChange={(value) => setNewSubaccountData(prev => ({ ...prev, gender: value as 'male' | 'female' | 'not_specified' }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_specified">Not specified</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={resetNewSubaccountForm}
                          variant="outline"
                          disabled={creatingSubaccount}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateSubaccount}
                          disabled={creatingSubaccount || !newSubaccountData.name.trim() || !newSubaccountData.display_name.trim()}
                          className="flex-1"
                        >
                          {creatingSubaccount ? '⏳ Creating...' : '✅ Create'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          {currentSubAccounts.length === 0 && subAccountsWithChatrooms.length > 0 ? (
            <div className="text-center p-8">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium mb-2">No Sub-Accounts on This Page</h3>
              <p className="text-muted-foreground">
                Try going to a different page or refreshing the data.
              </p>
            </div>
          ) : null}
        </div>
      )}
      
      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showPhotoUploadModal}
        onClose={() => setShowPhotoUploadModal(false)}
        onUploadComplete={handlePhotoUploadComplete}
        subAccountId={editingSubAccountId || ''}
        userSession={authState.userSession}
        isUploading={uploadingPhoto}
      />
      
      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={showAvatarUploadModal}
        onClose={() => setShowAvatarUploadModal(false)}
        onUploadComplete={handleAvatarUploadComplete}
        subAccountId={editingSubAccountId || ''}
        userSession={authState.userSession}
        isUploading={uploadingAvatar}
      />
    </div>
  );
}
/**
 * ChatClient - Frontend service for handling chat functionality
 * Manages WebSocket connection and message state
 */

export interface ChatMessage {
    id?: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    message_type: 'text' | 'system' | 'game_invite';
    created_at?: string;
    is_read?: boolean;
}

export interface Conversation {
    user_id: number;
    username: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
    is_online: boolean;
}

export interface ChatUser {
    id: number;
    username: string;
    is_online: boolean;
    last_seen?: string;
}

type MessageCallback = (message: ChatMessage) => void;
type ConversationCallback = (conversations: Conversation[]) => void;
type TypingCallback = (userId: number, isTyping: boolean) => void;
type OnlineStatusCallback = (userId: number, isOnline: boolean) => void;

export class ChatClient {
    private ws: WebSocket | null = null;
    private reconnectTimeout: number | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 2000;
    
    private messageCallbacks: Set<MessageCallback> = new Set();
    private conversationCallbacks: Set<ConversationCallback> = new Set();
    private typingCallbacks: Set<TypingCallback> = new Set();
    private onlineStatusCallbacks: Set<OnlineStatusCallback> = new Set();
    
    private typingTimeouts: Map<number, number> = new Map();
    private messageQueue: any[] = [];
    private isConnected = false;

    constructor() {
        this.connect();
    }

    /**
     * Establish WebSocket connection
     */
    connect(): void {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws/chat`;

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('✅ Chat WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                // Send queued messages
                this.flushMessageQueue();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('❌ Chat WebSocket disconnected');
                this.isConnected = false;
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.attemptReconnect();
        }
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleMessage(data: any): void {
        switch (data.type) {
            case 'new_message':
            case 'message_sent':
                this.messageCallbacks.forEach(cb => cb(data.message));
                break;

            case 'user_typing':
                this.typingCallbacks.forEach(cb => cb(data.userId, true));
                
                // Auto-clear typing indicator after 3 seconds
                const existingTimeout = this.typingTimeouts.get(data.userId);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                }
                
                const timeout = window.setTimeout(() => {
                    this.typingCallbacks.forEach(cb => cb(data.userId, false));
                    this.typingTimeouts.delete(data.userId);
                }, 3000);
                
                this.typingTimeouts.set(data.userId, timeout);
                break;

            case 'user_stopped_typing':
                this.typingCallbacks.forEach(cb => cb(data.userId, false));
                
                const timeoutId = this.typingTimeouts.get(data.userId);
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    this.typingTimeouts.delete(data.userId);
                }
                break;

            case 'user_online':
                this.onlineStatusCallbacks.forEach(cb => cb(data.userId, true));
                break;

            case 'user_offline':
                this.onlineStatusCallbacks.forEach(cb => cb(data.userId, false));
                break;

            case 'messages_read':
                // Handle read receipts
                console.log('Messages read by user:', data.userId);
                break;

            case 'error':
                console.error('Chat error:', data.message);
                break;
        }
    }

    /**
     * Attempt to reconnect with exponential backoff
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        this.reconnectTimeout = window.setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Send queued messages after reconnection
     */
    private flushMessageQueue(): void {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.sendRaw(message);
        }
    }

    /**
     * Send raw message through WebSocket
     */
    private sendRaw(message: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            // Queue message for later
            this.messageQueue.push(message);
        }
    }

    /**
     * Validate message before sending
     */
    private validateMessage(message: string): { valid: boolean; error?: string } {
        if (!message || message.trim().length === 0) {
            return { valid: false, error: 'Message cannot be empty' };
        }

        if (message.length > 1000) {
            return { valid: false, error: 'Message is too long (max 1000 characters)' };
        }

        return { valid: true };
    }

    /**
     * Send a chat message
     */
    sendMessage(receiverId: number, message: string, messageType: 'text' | 'system' | 'game_invite' = 'text'): boolean {
        const validation = this.validateMessage(message);
        if (!validation.valid) {
            console.error('Message validation failed:', validation.error);
            return false;
        }

        this.sendRaw({
            type: 'send_message',
            data: {
                receiver_id: receiverId,
                message: message.trim(),
                message_type: messageType
            }
        });
        return true;
    }

    /**
     * Notify typing status
     */
    sendTyping(receiverId: number, isTyping: boolean): void {
        this.sendRaw({
            type: isTyping ? 'typing_start' : 'typing_stop',
            data: {
                receiver_id: receiverId
            }
        });
    }

    /**
     * Mark messages as read
     */
    markAsRead(senderId: number): void {
        this.sendRaw({
            type: 'mark_read',
            data: {
                sender_id: senderId
            }
        });
    }

    /**
     * Get all conversations
     */
    async getConversations(): Promise<Conversation[]> {
        try {
            const response = await fetch('/api/chat/conversations', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch conversations');
            }

            const data = await response.json();
            return data.conversations || [];
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    }

    /**
     * Get messages with a specific user
     */
    async getMessages(userId: number, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
        try {
            const response = await fetch(`/api/chat/messages/${userId}?limit=${limit}&offset=${offset}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            return data.messages || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    /**
     * Block a user
     */
    async blockUser(userId: number): Promise<boolean> {
        try {
            const response = await fetch('/api/chat/block', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ user_id: userId })
            });

            if (!response.ok) {
                throw new Error('Failed to block user');
            }

            return true;
        } catch (error) {
            console.error('Error blocking user:', error);
            return false;
        }
    }

    /**
     * Unblock a user
     */
    async unblockUser(userId: number): Promise<boolean> {
        try {
            const response = await fetch('/api/chat/unblock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ user_id: userId })
            });

            if (!response.ok) {
                throw new Error('Failed to unblock user');
            }

            return true;
        } catch (error) {
            console.error('Error unblocking user:', error);
            return false;
        }
    }

    /**
     * Get blocked users
     */
    async getBlockedUsers(): Promise<number[]> {
        try {
            const response = await fetch('/api/chat/blocked', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch blocked users');
            }

            const data = await response.json();
            return data.blocked_users || [];
        } catch (error) {
            console.error('Error fetching blocked users:', error);
            return [];
        }
    }

    /**
     * Get user online status
     */
    async getUserStatus(userId: number): Promise<{ is_online: boolean; last_seen: string | null }> {
        try {
            const response = await fetch(`/api/chat/status/${userId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user status');
            }

            const data = await response.json();
            return data.status || { is_online: false, last_seen: null };
        } catch (error) {
            console.error('Error fetching user status:', error);
            return { is_online: false, last_seen: null };
        }
    }

    /**
     * Register callback for new messages
     */
    onMessage(callback: MessageCallback): () => void {
        this.messageCallbacks.add(callback);
        return () => this.messageCallbacks.delete(callback);
    }

    /**
     * Register callback for conversation updates
     */
    onConversationUpdate(callback: ConversationCallback): () => void {
        this.conversationCallbacks.add(callback);
        return () => this.conversationCallbacks.delete(callback);
    }

    /**
     * Register callback for typing indicators
     */
    onTyping(callback: TypingCallback): () => void {
        this.typingCallbacks.add(callback);
        return () => this.typingCallbacks.delete(callback);
    }

    /**
     * Register callback for online status changes
     */
    onOnlineStatus(callback: OnlineStatusCallback): () => void {
        this.onlineStatusCallbacks.add(callback);
        return () => this.onlineStatusCallbacks.delete(callback);
    }

    /**
     * Disconnect WebSocket
     */
    disconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.isConnected = false;
    }

    /**
     * Check if connected
     */
    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

// Export singleton instance
export default new ChatClient();

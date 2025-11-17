import ChatClient, { type ChatMessage, type Conversation } from '../services/ChatClient.js';
import { translate } from '../languageService.js';

/**
 * ChatPage - Main chat interface with conversation list and message window
 */
export class ChatPage {
    private container: HTMLElement;
    private currentUserId: number | null = null;
    private currentConversationUserId: number | null = null;
    private conversations: Conversation[] = [];
    private messages: ChatMessage[] = [];
    private messageUpdateInterval: number | null = null;

    // UI Elements
    private conversationList!: HTMLElement;
    private messageWindow!: HTMLElement;
    private messageInput!: HTMLInputElement;
    private sendButton!: HTMLButtonElement;
    private chatHeader!: HTMLElement;
    private searchInput!: HTMLInputElement;
    private searchResults!: HTMLElement;
    private typingIndicator!: HTMLElement;
    private emptyState!: HTMLElement;

    constructor(currentUserId: number) {
        this.currentUserId = currentUserId;
        this.container = document.createElement('div');
        this.container.className = 'chat-page-wrapper';
        
        this.buildChatInterface();
        this.setupEventListeners();
        this.loadConversations();
    }

    private buildChatInterface(): void {
        // Sidebar with conversations
        const sidebar = document.createElement('div');
        sidebar.className = 'chat-sidebar';

        // Sidebar Header
        const sidebarHeader = document.createElement('div');
        sidebarHeader.className = 'chat-sidebar-header';
        sidebarHeader.innerHTML = `
            <h2 class="chat-sidebar-title">${translate('Chats', 'Chats', 'Discussions')}</h2>
        `;

        // Search Users
        const searchContainer = document.createElement('div');
        searchContainer.className = 'chat-search-container';
        
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = translate('Search users...', 'Benutzer suchen...', 'Rechercher des utilisateurs...');
        this.searchInput.className = 'chat-search-input';
        
        this.searchResults = document.createElement('div');
        this.searchResults.className = 'chat-search-results';
        
        searchContainer.appendChild(this.searchInput);
        searchContainer.appendChild(this.searchResults);

        // Conversation List
        this.conversationList = document.createElement('div');
        this.conversationList.className = 'chat-conversation-list';

        sidebar.appendChild(sidebarHeader);
        sidebar.appendChild(searchContainer);
        sidebar.appendChild(this.conversationList);

        // Main Chat Area
        const mainArea = document.createElement('div');
        mainArea.className = 'chat-main-area';

        // Chat Header
        this.chatHeader = document.createElement('div');
        this.chatHeader.className = 'chat-main-header';
        this.chatHeader.innerHTML = `
            <div class="chat-user-info view-profile-btn" style="display: none;">
                <div class="chat-avatar">
                    ?
                </div>
                <div class="chat-user-details">
                    <h3 class="chat-username"></h3>
                    <p class="chat-online-status"></p>
                </div>
            </div>
            <div class="chat-actions">
                <button class="invite-game-btn autumn-button-small" style="display: none;">
                    <img src="/assets/leaf.png" alt="" style="width: 20px; height: 20px; display: inline-block; vertical-align: middle;" />
                    ${translate('Invite to Play', 'Zum Spielen einladen', 'Inviter à jouer')}
                </button>
                <button class="delete-conversation-btn autumn-button-small" style="display: none;">
                    ${translate('Delete', 'Löschen', 'Supprimer')}
                </button>
                <button class="block-user-btn autumn-button-small" style="display: none;">
                    ${translate('Block', 'Blockieren', 'Bloquer')}
                </button>
            </div>
        `;

        // Empty State
        this.emptyState = document.createElement('div');
        this.emptyState.className = 'chat-empty-state';
        this.emptyState.innerHTML = `
            <div class="chat-empty-content">
                <img src="/assets/leaf.png" alt="" class="chat-empty-icon" style="width: 120px; height: 120px; opacity: 0.6;" />
                <p class="chat-empty-text">${translate('Select a conversation to start chatting', 'Wählen Sie eine Konversation zum Chatten', 'Sélectionnez une conversation pour commencer')}</p>
            </div>
        `;

        // Message Window
        this.messageWindow = document.createElement('div');
        this.messageWindow.className = 'chat-message-window';
        this.messageWindow.style.display = 'none';

        // Typing Indicator
        this.typingIndicator = document.createElement('div');
        this.typingIndicator.className = 'chat-typing-indicator';
        this.typingIndicator.style.display = 'none';
        this.typingIndicator.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>${translate('Typing...', 'Tippt...', 'En train d\'écrire...')}</span>
        `;

        // Message Input Area
        const inputArea = document.createElement('div');
        inputArea.className = 'chat-input-area';
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'chat-input-container';
        
        this.messageInput = document.createElement('input');
        this.messageInput.type = 'text';
        this.messageInput.placeholder = translate('Type a message...', 'Nachricht eingeben...', 'Tapez un message...');
        this.messageInput.className = 'chat-message-input';
        this.messageInput.disabled = true;
        
        this.sendButton = document.createElement('button');
        this.sendButton.className = 'chat-send-button autumn-button-light';
        this.sendButton.textContent = translate('Send', 'Senden', 'Envoyer');
        this.sendButton.disabled = true;
        
        inputContainer.appendChild(this.messageInput);
        inputContainer.appendChild(this.sendButton);
        inputArea.appendChild(inputContainer);

        mainArea.appendChild(this.chatHeader);
        mainArea.appendChild(this.emptyState);
        mainArea.appendChild(this.messageWindow);
        mainArea.appendChild(this.typingIndicator);
        mainArea.appendChild(inputArea);

        this.container.appendChild(sidebar);
        this.container.appendChild(mainArea);
    }

    private setupEventListeners(): void {
        // Search users
        let searchTimeout: number;
        this.searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = this.searchInput.value.trim();
            
            if (query.length < 2) {
                this.searchResults.style.display = 'none';
                return;
            }

            searchTimeout = window.setTimeout(async () => {
                await this.searchUsers(query);
            }, 300);
        });

        // Send message
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Typing indicator
        let typingTimeout: number;
        this.messageInput.addEventListener('input', () => {
            if (this.currentConversationUserId) {
                ChatClient.sendTyping(this.currentConversationUserId, true);
                
                clearTimeout(typingTimeout);
                typingTimeout = window.setTimeout(() => {
                    if (this.currentConversationUserId) {
                        ChatClient.sendTyping(this.currentConversationUserId, false);
                    }
                }, 1000);
            }
        });

        // Listen for new messages
        ChatClient.onMessage((message) => {
            this.handleNewMessage(message);
        });

        // Listen for typing indicators
        ChatClient.onTyping((userId, isTyping) => {
            if (userId === this.currentConversationUserId) {
                if (isTyping) {
                    this.typingIndicator.style.display = 'flex';
                } else {
                    this.typingIndicator.style.display = 'none';
                }
            }
        });

        // Listen for online status changes
        ChatClient.onOnlineStatus((userId, isOnline) => {
            this.updateUserOnlineStatus(userId, isOnline);
        });

        // View profile button
        this.chatHeader.querySelector('.view-profile-btn')?.addEventListener('click', () => {
            if (this.currentConversationUserId) {
                this.viewUserProfile(this.currentConversationUserId);
            }
        });

        // Invite to game button
        this.chatHeader.querySelector('.invite-game-btn')?.addEventListener('click', () => {
            this.sendGameInvite();
        });

        // Delete conversation button
        this.chatHeader.querySelector('.delete-conversation-btn')?.addEventListener('click', async () => {
            if (this.currentConversationUserId) {
                const confirmed = confirm(translate(
                    'Are you sure you want to delete this conversation?',
                    'Möchten Sie diese Konversation wirklich löschen?',
                    'Voulez-vous vraiment supprimer cette conversation?'
                ));
                
                if (confirmed) {
                    await this.deleteConversation(this.currentConversationUserId);
                }
            }
        });

        // Block user button
        this.chatHeader.querySelector('.block-user-btn')?.addEventListener('click', async () => {
            if (this.currentConversationUserId) {
                const confirmed = confirm(translate(
                    'Are you sure you want to block this user?',
                    'Möchten Sie diesen Benutzer wirklich blockieren?',
                    'Voulez-vous vraiment bloquer cet utilisateur?'
                ));
                
                if (confirmed) {
                    const success = await ChatClient.blockUser(this.currentConversationUserId);
                    if (success) {
                        alert(translate('User blocked', 'Benutzer blockiert', 'Utilisateur bloqué'));
                        this.loadConversations();
                        this.closeConversation();
                    }
                }
            }
        });
    }

    private async loadConversations(): Promise<void> {
        try {
            this.conversations = await ChatClient.getConversations();
            this.renderConversations();
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }

    private renderConversations(): void {
        this.conversationList.innerHTML = '';

        if (this.conversations.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'p-4 text-center text-gray-500';
            empty.textContent = translate('No conversations yet', 'Noch keine Gespräche', 'Pas encore de conversations');
            this.conversationList.appendChild(empty);
            return;
        }

        this.conversations.forEach(conv => {
            const item = this.createConversationItem(conv);
            this.conversationList.appendChild(item);
        });
    }

    private createConversationItem(conv: Conversation): HTMLElement {
        const item = document.createElement('div');
        item.className = 'conversation-item p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer flex items-center';
        item.dataset.userId = conv.user_id.toString();

        const onlineIndicator = conv.is_online 
            ? '<div class="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></div>'
            : '';

        item.innerHTML = `
            <div class="relative mr-3">
                <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                    ${conv.username.charAt(0).toUpperCase()}
                </div>
                ${onlineIndicator}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-baseline">
                    <h4 class="font-semibold text-gray-800 truncate">${conv.username}</h4>
                    <span class="text-xs text-gray-500">${this.formatTime(conv.last_message_time)}</span>
                </div>
                <p class="text-sm text-gray-600 truncate">${conv.last_message || ''}</p>
            </div>
            ${conv.unread_count > 0 ? `<div class="ml-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">${conv.unread_count}</div>` : ''}
        `;

        item.addEventListener('click', () => this.openConversation(conv.user_id, conv.username));

        return item;
    }

    private async openConversation(userId: number, username: string): Promise<void> {
        this.currentConversationUserId = userId;
        
        // Update header
        (this.chatHeader.querySelector('.chat-user-info') as HTMLElement).style.display = 'flex';
        this.chatHeader.querySelector('.chat-username')!.textContent = username;
        this.chatHeader.querySelector('.chat-avatar')!.textContent = username.charAt(0).toUpperCase();
        this.chatHeader.querySelector('.chat-online-status')!.textContent = translate('Click to view profile', 'Profil anzeigen', 'Voir le profil');
        (this.chatHeader.querySelector('.invite-game-btn') as HTMLElement).style.display = 'flex';
        (this.chatHeader.querySelector('.delete-conversation-btn') as HTMLElement).style.display = 'block';
        (this.chatHeader.querySelector('.block-user-btn') as HTMLElement).style.display = 'block';
        
        // Show message window, hide empty state
        this.emptyState.style.display = 'none';
        this.messageWindow.style.display = 'flex';
        
        // Enable input
        this.messageInput.disabled = false;
        this.sendButton.disabled = false;
        this.messageInput.focus();

        // Load messages
        await this.loadMessages(userId);

        // Mark as read
        ChatClient.markAsRead(userId);

        // Highlight active conversation
        this.conversationList.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        this.conversationList.querySelector(`[data-user-id="${userId}"]`)?.classList.add('active');
    }

    private closeConversation(): void {
        this.currentConversationUserId = null;
        this.messageWindow.style.display = 'none';
        this.emptyState.style.display = 'flex';
        this.messageInput.disabled = true;
        this.sendButton.disabled = true;
        
        // Hide header user info
        (this.chatHeader.querySelector('.chat-user-info') as HTMLElement).style.display = 'none';
        this.chatHeader.querySelector('.chat-username')!.textContent = '';
        this.chatHeader.querySelector('.chat-online-status')!.textContent = '';
        this.chatHeader.querySelector('.chat-avatar')!.textContent = '?';
        (this.chatHeader.querySelector('.invite-game-btn') as HTMLElement).style.display = 'none';
        (this.chatHeader.querySelector('.delete-conversation-btn') as HTMLElement).style.display = 'none';
        (this.chatHeader.querySelector('.block-user-btn') as HTMLElement).style.display = 'none';
    }

    private async loadMessages(userId: number, offset: number = 0): Promise<void> {
        try {
            const newMessages = await ChatClient.getMessages(userId, 50, offset);
            
            if (offset === 0) {
                this.messages = newMessages;
            } else {
                // Prepend older messages
                this.messages = [...newMessages, ...this.messages];
            }
            
            this.renderMessages();

            // Add scroll listener for lazy loading
            if (offset === 0) {
                this.messageWindow.addEventListener('scroll', () => {
                    if (this.messageWindow.scrollTop === 0 && this.messages.length >= 50) {
                        this.loadMessages(userId, this.messages.length);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    private renderMessages(): void {
        this.messageWindow.innerHTML = '';

        this.messages.forEach(msg => {
            const messageEl = this.createMessageElement(msg);
            this.messageWindow.appendChild(messageEl);
        });

        // Scroll to bottom
        this.messageWindow.scrollTop = this.messageWindow.scrollHeight;
    }

    private createMessageElement(msg: ChatMessage): HTMLElement {
        const isSent = msg.sender_id === this.currentUserId;
        
        const messageEl = document.createElement('div');
        messageEl.className = `flex ${isSent ? 'justify-end' : 'justify-start'}`;

        const bubble = document.createElement('div');
        
        // Special styling for system messages
        if (msg.message_type === 'system') {
            bubble.className = 'max-w-xs md:max-w-md px-4 py-2 rounded-lg bg-yellow-50 text-gray-800 border border-yellow-300 mx-auto';
            bubble.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-xl">ℹ️</span>
                    <p class="text-sm font-medium">${this.escapeHtml(msg.message)}</p>
                </div>
                <span class="text-xs text-gray-500 mt-1 block text-center">
                    ${this.formatTime(msg.created_at || '')}
                </span>
            `;
            messageEl.className = 'flex justify-center';
        }
        // Special styling for game invites
        else if (msg.message_type === 'game_invite') {
            bubble.className = 'max-w-xs md:max-w-md px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-purple-600';
            
            const inviteData = this.parseGameInvite(msg.message);
            bubble.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <img src="/assets/leaf.png" alt="" style="width: 32px; height: 32px; filter: brightness(0) invert(1);" />
                    <p class="font-bold">Game Invitation</p>
                </div>
                <p class="text-sm mb-3">${inviteData.message}</p>
                ${!isSent ? `
                    <div class="flex gap-2">
                        <button class="accept-invite-btn flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold" data-invite-id="${msg.id}">
                            ${translate('Accept', 'Akzeptieren', 'Accepter')}
                        </button>
                        <button class="decline-invite-btn flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold" data-invite-id="${msg.id}">
                            ${translate('Decline', 'Ablehnen', 'Refuser')}
                        </button>
                    </div>
                ` : '<p class="text-xs text-purple-100 italic">Invitation sent</p>'}
                <span class="text-xs text-purple-100 mt-2 block">
                    ${this.formatTime(msg.created_at || '')}
                </span>
            `;
            
            // Add event listeners for invite buttons
            if (!isSent) {
                bubble.querySelector('.accept-invite-btn')?.addEventListener('click', () => {
                    this.handleGameInviteAccept(msg.sender_id);
                });
                bubble.querySelector('.decline-invite-btn')?.addEventListener('click', () => {
                    this.handleGameInviteDecline(msg.sender_id);
                });
            }
        } else {
            bubble.className = `max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                isSent 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-800 border border-gray-200'
            }`;

            bubble.innerHTML = `
                <p class="break-words">${this.escapeHtml(msg.message)}</p>
                <span class="text-xs ${isSent ? 'text-blue-100' : 'text-gray-500'} mt-1 block">
                    ${this.formatTime(msg.created_at || '')}
                </span>
            `;
        }

        messageEl.appendChild(bubble);
        return messageEl;
    }

    private async sendMessage(): Promise<void> {
        const text = this.messageInput.value.trim();
        
        if (!text || !this.currentConversationUserId) return;

        const success = ChatClient.sendMessage(this.currentConversationUserId, text);
        if (success) {
            this.messageInput.value = '';
        } else {
            alert(translate(
                'Failed to send message. Please check your message and try again.',
                'Nachricht konnte nicht gesendet werden. Bitte überprüfen Sie Ihre Nachricht und versuchen Sie es erneut.',
                'Échec de l\'envoi du message. Veuillez vérifier votre message et réessayer.'
            ));
        }
    }

    private handleNewMessage(message: ChatMessage): void {
        // Add to messages if in current conversation
        if (message.sender_id === this.currentConversationUserId || 
            message.receiver_id === this.currentConversationUserId ||
            message.sender_id === this.currentUserId) {
            
            this.messages.push(message);
            const messageEl = this.createMessageElement(message);
            this.messageWindow.appendChild(messageEl);
            this.messageWindow.scrollTop = this.messageWindow.scrollHeight;
        }

        // Reload conversations to update last message
        this.loadConversations();
    }

    private async searchUsers(query: string): Promise<void> {
        try {
            const response = await fetch(`/api/chat/search?q=${encodeURIComponent(query)}`, {
                credentials: 'include'
            });
            
            if (!response.ok) return;
            
            const data = await response.json();
            this.renderSearchResults(data.users || []);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    }

    private renderSearchResults(users: any[]): void {
        this.searchResults.innerHTML = '';

        if (users.length === 0) {
            this.searchResults.innerHTML = '<div style="padding: 1rem; color: #78716c; font-size: 0.9rem; font-family: Georgia, serif;">No users found</div>';
            this.searchResults.style.display = 'block';
            return;
        }

        users.forEach(user => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            item.style.borderLeft = 'none';
            item.style.borderBottom = '1px solid rgba(217, 119, 6, 0.2)';
            item.innerHTML = `
                <div class="chat-avatar" style="width: 40px; height: 40px; font-size: 1rem;">
                    ${user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style="font-family: Georgia, serif; font-weight: 600; color: #92400e;">${user.username}</div>
                    ${user.is_online ? '<span style="font-size: 0.8rem; color: #22c55e;">● Online</span>' : '<span style="font-size: 0.8rem; color: #9ca3af;">Offline</span>'}
                </div>
            `;

            item.addEventListener('click', () => {
                this.openConversation(user.id, user.username);
                this.searchResults.style.display = 'none';
                this.searchInput.value = '';
            });

            this.searchResults.appendChild(item);
        });

        this.searchResults.style.display = 'block';
    }

    private updateUserOnlineStatus(userId: number, isOnline: boolean): void {
        const convItem = this.conversationList.querySelector(`[data-user-id="${userId}"]`);
        if (convItem) {
            const indicator = convItem.querySelector('.w-3.h-3');
            if (isOnline) {
                if (!indicator) {
                    const newIndicator = document.createElement('div');
                    newIndicator.className = 'w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white';
                    convItem.querySelector('.relative')?.appendChild(newIndicator);
                }
            } else {
                indicator?.remove();
            }
        }
    }

    private formatTime(timestamp: string): string {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        if (diff < 60000) return translate('Just now', 'Gerade eben', 'À l\'instant');
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString();
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private parseGameInvite(message: string): { message: string; gameMode?: string } {
        try {
            const data = JSON.parse(message);
            return data;
        } catch {
            return { message };
        }
    }

    private handleGameInviteAccept(senderId: number): void {
        // Navigate to game page
        window.location.href = '/game?mode=pvp&invite=' + senderId;
    }

    private handleGameInviteDecline(senderId: number): void {
        // Send decline message
        ChatClient.sendMessage(senderId, translate(
            'Declined game invitation',
            'Spieleinladung abgelehnt',
            'Invitation de jeu refusée'
        ), 'text');
    }

    private viewUserProfile(userId: number): void {
        // Get username for this userId
        const conv = this.conversations.find(c => c.user_id === userId);
        if (conv) {
            window.location.href = `/profile/${conv.username}`;
        }
    }

    private async deleteConversation(userId: number): Promise<void> {
        try {
            const response = await fetch(`/api/chat/conversation/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                this.closeConversation();
                this.loadConversations();
            } else {
                alert(translate('Failed to delete conversation', 'Konversation konnte nicht gelöscht werden', 'Échec de la suppression de la conversation'));
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert(translate('Error deleting conversation', 'Fehler beim Löschen der Konversation', 'Erreur lors de la suppression de la conversation'));
        }
    }

    private sendGameInvite(): void {
        if (!this.currentConversationUserId) return;

        const inviteMessage = JSON.stringify({
            message: translate(
                'wants to play Pong with you!',
                'möchte Pong mit dir spielen!',
                'veut jouer au Pong avec vous!'
            ),
            gameMode: '2d'
        });

        ChatClient.sendMessage(this.currentConversationUserId, inviteMessage, 'game_invite');
    }

    render(): HTMLElement {
        return this.container;
    }

    destroy(): void {
        if (this.messageUpdateInterval) {
            clearInterval(this.messageUpdateInterval);
        }
    }
}

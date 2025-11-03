import databaseConnection from '../config/database';
import { EventEmitter } from 'events';

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

export interface BlockedUser {
    id?: number;
    blocker_id: number;
    blocked_id: number;
    created_at?: string;
}

/**
 * ChatService - Handles all chat-related database operations and business logic
 * Original implementation for ft_transcendence live chat module
 */
export class ChatService extends EventEmitter {
    constructor() {
        super();
        this.setupDatabase();
    }

    /**
     * Initialize database tables for chat functionality
     */
    private setupDatabase(): void {
        const createMessagesTable = `
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                message_type TEXT NOT NULL CHECK(message_type IN ('text', 'system', 'game_invite')) DEFAULT 'text',
                is_read BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `;

        const createBlockedUsersTable = `
            CREATE TABLE IF NOT EXISTS blocked_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                blocker_id INTEGER NOT NULL,
                blocked_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(blocker_id, blocked_id)
            );
        `;

        const createOnlineStatusTable = `
            CREATE TABLE IF NOT EXISTS user_online_status (
                user_id INTEGER PRIMARY KEY,
                is_online BOOLEAN DEFAULT 0,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `;

        databaseConnection.exec(createMessagesTable, (err) => {
            if (err) {
                console.error('Error creating chat_messages table:', err.message);
            } else {
                console.log('Chat messages table checked/created.');
            }
        });

        databaseConnection.exec(createBlockedUsersTable, (err) => {
            if (err) {
                console.error('Error creating blocked_users table:', err.message);
            } else {
                console.log('Blocked users table checked/created.');
            }
        });

        databaseConnection.exec(createOnlineStatusTable, (err) => {
            if (err) {
                console.error('Error creating user_online_status table:', err.message);
            } else {
                console.log('User online status table checked/created.');
            }
        });
    }

    /**
     * Validate and sanitize message content
     */
    private validateMessage(message: string): { valid: boolean; error?: string; sanitized?: string } {
        // Check message length
        if (!message || message.trim().length === 0) {
            return { valid: false, error: 'Message cannot be empty' };
        }

        if (message.length > 1000) {
            return { valid: false, error: 'Message is too long (max 1000 characters)' };
        }

        // Basic XSS prevention - remove HTML tags
        const sanitized = message.replace(/<[^>]*>/g, '');

        // Check for spam patterns (excessive repetition)
        const words = sanitized.split(/\s+/);
        const uniqueWords = new Set(words);
        if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
            return { valid: false, error: 'Message appears to be spam' };
        }

        return { valid: true, sanitized };
    }

    /**
     * Send a message from one user to another
     */
    async sendMessage(senderId: number, receiverId: number, message: string, messageType: 'text' | 'system' | 'game_invite' = 'text'): Promise<ChatMessage | null> {
        return new Promise((resolve, reject) => {
            // Validate message
            const validation = this.validateMessage(message);
            if (!validation.valid) {
                reject(new Error(validation.error));
                return;
            }

            const sanitizedMessage = validation.sanitized!;

            // Check if sender is blocked by receiver
            this.isUserBlocked(receiverId, senderId).then(isBlocked => {
                if (isBlocked) {
                    reject(new Error('Cannot send message to this user'));
                    return;
                }

                const query = `
                    INSERT INTO chat_messages (sender_id, receiver_id, message, message_type)
                    VALUES (?, ?, ?, ?)
                `;

                databaseConnection.run(query, [senderId, receiverId, sanitizedMessage, messageType], function(err) {
                    if (err) {
                        console.error('Error sending message:', err.message);
                        reject(err);
                    } else {
                        const newMessage: ChatMessage = {
                            id: this.lastID,
                            sender_id: senderId,
                            receiver_id: receiverId,
                            message: message,
                            message_type: messageType,
                            is_read: false
                        };
                        resolve(newMessage);
                    }
                });
            });
        });
    }

    /**
     * Get conversation history between two users with pagination
     */
    async getConversation(userId1: number, userId2: number, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM chat_messages
                WHERE (sender_id = ? AND receiver_id = ?)
                   OR (sender_id = ? AND receiver_id = ?)
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;

            databaseConnection.all(query, [userId1, userId2, userId2, userId1, limit, offset], (err, rows: any[]) => {
                if (err) {
                    console.error('Error fetching conversation:', err.message);
                    reject(err);
                } else {
                    resolve(rows as ChatMessage[]);
                }
            });
        });
    }

    /**
     * Get all conversations for a user
     */
    async getUserConversations(userId: number): Promise<Conversation[]> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT DISTINCT
                    u.id as user_id,
                    u.username,
                    (
                        SELECT message FROM chat_messages
                        WHERE (sender_id = u.id AND receiver_id = ?)
                           OR (sender_id = ? AND receiver_id = u.id)
                        ORDER BY created_at DESC
                        LIMIT 1
                    ) as last_message,
                    (
                        SELECT created_at FROM chat_messages
                        WHERE (sender_id = u.id AND receiver_id = ?)
                           OR (sender_id = ? AND receiver_id = u.id)
                        ORDER BY created_at DESC
                        LIMIT 1
                    ) as last_message_time,
                    (
                        SELECT COUNT(*) FROM chat_messages
                        WHERE sender_id = u.id 
                          AND receiver_id = ? 
                          AND is_read = 0
                    ) as unread_count,
                    COALESCE(uos.is_online, 0) as is_online
                FROM users u
                LEFT JOIN user_online_status uos ON u.id = uos.user_id
                WHERE u.id IN (
                    SELECT DISTINCT sender_id FROM chat_messages WHERE receiver_id = ?
                    UNION
                    SELECT DISTINCT receiver_id FROM chat_messages WHERE sender_id = ?
                )
                AND u.id NOT IN (
                    SELECT blocked_id FROM blocked_users WHERE blocker_id = ?
                )
                ORDER BY last_message_time DESC
            `;

            databaseConnection.all(query, [userId, userId, userId, userId, userId, userId, userId, userId], (err, rows: any[]) => {
                if (err) {
                    console.error('Error fetching conversations:', err.message);
                    reject(err);
                } else {
                    resolve(rows as Conversation[]);
                }
            });
        });
    }

    /**
     * Mark messages as read
     */
    async markMessagesAsRead(receiverId: number, senderId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE chat_messages
                SET is_read = 1
                WHERE receiver_id = ? AND sender_id = ? AND is_read = 0
            `;

            databaseConnection.run(query, [receiverId, senderId], (err) => {
                if (err) {
                    console.error('Error marking messages as read:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Block a user
     */
    async blockUser(blockerId: number, blockedId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO blocked_users (blocker_id, blocked_id)
                VALUES (?, ?)
            `;

            databaseConnection.run(query, [blockerId, blockedId], (err) => {
                if (err) {
                    console.error('Error blocking user:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Unblock a user
     */
    async unblockUser(blockerId: number, blockedId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `
                DELETE FROM blocked_users
                WHERE blocker_id = ? AND blocked_id = ?
            `;

            databaseConnection.run(query, [blockerId, blockedId], (err) => {
                if (err) {
                    console.error('Error unblocking user:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Check if a user is blocked
     */
    async isUserBlocked(blockerId: number, blockedId: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COUNT(*) as count FROM blocked_users
                WHERE blocker_id = ? AND blocked_id = ?
            `;

            databaseConnection.get(query, [blockerId, blockedId], (err, row: any) => {
                if (err) {
                    console.error('Error checking if user is blocked:', err.message);
                    reject(err);
                } else {
                    resolve(row.count > 0);
                }
            });
        });
    }

    /**
     * Get list of blocked users
     */
    async getBlockedUsers(userId: number): Promise<number[]> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT blocked_id FROM blocked_users
                WHERE blocker_id = ?
            `;

            databaseConnection.all(query, [userId], (err, rows: any[]) => {
                if (err) {
                    console.error('Error fetching blocked users:', err.message);
                    reject(err);
                } else {
                    resolve(rows.map(row => row.blocked_id));
                }
            });
        });
    }

    /**
     * Update user online status
     */
    async updateOnlineStatus(userId: number, isOnline: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO user_online_status (user_id, is_online, last_seen)
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id) DO UPDATE SET
                    is_online = ?,
                    last_seen = CURRENT_TIMESTAMP
            `;

            databaseConnection.run(query, [userId, isOnline ? 1 : 0, isOnline ? 1 : 0], (err) => {
                if (err) {
                    console.error('Error updating online status:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Get user online status
     */
    async getUserOnlineStatus(userId: number): Promise<{ is_online: boolean; last_seen: string } | null> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT is_online, last_seen FROM user_online_status
                WHERE user_id = ?
            `;

            databaseConnection.get(query, [userId], (err, row: any) => {
                if (err) {
                    console.error('Error fetching online status:', err.message);
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }

    /**
     * Get total unread message count for a user
     */
    async getUnreadCount(userId: number): Promise<number> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COUNT(*) as count FROM chat_messages
                WHERE receiver_id = ? AND is_read = 0
            `;

            databaseConnection.get(query, [userId], (err, row: any) => {
                if (err) {
                    console.error('Error fetching unread count:', err.message);
                    reject(err);
                } else {
                    resolve(row?.count || 0);
                }
            });
        });
    }

    /**
     * Delete a conversation (all messages between two users)
     */
    async deleteConversation(userId1: number, userId2: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `
                DELETE FROM chat_messages
                WHERE (sender_id = ? AND receiver_id = ?)
                   OR (sender_id = ? AND receiver_id = ?)
            `;

            databaseConnection.run(query, [userId1, userId2, userId2, userId1], (err) => {
                if (err) {
                    console.error('Error deleting conversation:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Send a system message (for tournament notifications, etc.)
     */
    async sendSystemMessage(userId: number, message: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO chat_messages (sender_id, receiver_id, message, message_type)
                VALUES (0, ?, ?, 'system')
            `;

            databaseConnection.run(query, [userId, message], (err) => {
                if (err) {
                    console.error('Error sending system message:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Send tournament notification to all participants
     */
    async sendTournamentNotification(userIds: number[], message: string): Promise<void> {
        const promises = userIds.map(userId => this.sendSystemMessage(userId, message));
        await Promise.all(promises);
    }

    /**
     * Search users by username for new conversations
     */
    async searchUsers(searchTerm: string, currentUserId: number, limit: number = 10): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT u.id, u.username, u.avatar_path,
                       COALESCE(uos.is_online, 0) as is_online,
                       uos.last_seen
                FROM users u
                LEFT JOIN user_online_status uos ON u.id = uos.user_id
                WHERE u.username LIKE ?
                  AND u.id != ?
                  AND u.id NOT IN (
                      SELECT blocked_id FROM blocked_users WHERE blocker_id = ?
                  )
                ORDER BY u.username
                LIMIT ?
            `;

            databaseConnection.all(query, [`%${searchTerm}%`, currentUserId, currentUserId, limit], (err, rows: any[]) => {
                if (err) {
                    console.error('Error searching users:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

export default new ChatService();

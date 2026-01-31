import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  email?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this based on your frontend URL
    credentials: true,
  },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private socketToUser: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway initialized');
    this.logger.log(`📡 Namespace: /chat`);
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.log(`⚡ Client attempting to connect: ${client.id}`);

      // Extract token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1] ||
        client.handshake.query?.token;

      if (!token) {
        this.logger.warn(`❌ Client ${client.id} connected without token`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.secret'),
      });

      if (!payload) {
        this.logger.warn(`❌ Invalid token for client ${client.id}`);
        client.emit('error', { message: 'Invalid authentication token' });
        client.disconnect();
        return;
      }

      // Attach user info to socket
      client.userId = payload.sub;
      client.userRole = payload.role;
      client.email = payload.email;

      // Store connected user
      const existingSocketId = this.connectedUsers.get(payload.sub);
      if (existingSocketId) {
        // Disconnect old connection
        const existingSocket = this.server.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          existingSocket.disconnect();
        }
      }

      this.connectedUsers.set(payload.sub, client.id);
      this.socketToUser.set(client.id, payload.sub);

      // Join user to their personal room
      client.join(`user:${payload.sub}`);

      this.logger.log(`✅ Client connected: ${client.id} | User: ${payload.sub} | Role: ${payload.role}`);

      // Emit connection success
      client.emit('connected', {
        message: 'Successfully connected to chat server',
        userId: payload.sub,
        socketId: client.id,
        timestamp: new Date().toISOString(),
      });

      // Notify about online status
      this.broadcastUserStatus(payload.sub, true);
    } catch (error) {
      this.logger.error(`❌ Connection error for client ${client.id}:`, error.message);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.socketToUser.delete(client.id);
      
      this.logger.log(`👋 Client disconnected: ${client.id} | User: ${client.userId}`);
      
      // Notify about offline status
      this.broadcastUserStatus(client.userId, false);
    } else {
      this.logger.log(`👋 Client disconnected: ${client.id}`);
    }
  }

  /**
   * Join a conversation room
   */
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const { conversationId } = data;
      
      // Verify user has access to this conversation
      const conversation = await this.chatService.getConversation(client.userId as string, conversationId);
      
      if (!conversation) {
        client.emit('error', { message: 'Conversation not found or access denied' });
        return;
      }

      client.join(`conversation:${conversationId}`);
      this.logger.log(`👥 User ${client.userId} joined conversation ${conversationId}`);

      client.emit('joined_conversation', {
        conversationId,
        message: 'Successfully joined conversation',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error joining conversation:', error.message);
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  /**
   * Leave a conversation room
   */
  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const { conversationId } = data;
    client.leave(`conversation:${conversationId}`);
    
    this.logger.log(`👥 User ${client.userId} left conversation ${conversationId}`);

    client.emit('left_conversation', {
      conversationId,
      message: 'Successfully left conversation',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send a message
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; message: string; messageType?: string },
  ) {
    try {
      const { conversationId, message, messageType } = data;

      this.logger.log(`💬 User ${client.userId} sending message to conversation ${conversationId}`);

      // Save message to database
      const savedMessage: any = await this.chatService.sendMessage(client.userId as string, conversationId, {
        message,
        messageType,
      });

      // Emit to all users in the conversation room (including sender)
      this.server.to(`conversation:${conversationId}`).emit('new_message', {
        conversationId,
        message: savedMessage,
        timestamp: new Date().toISOString(),
      });

      // Acknowledge to sender
      client.emit('message_sent', {
        conversationId,
        messageId: savedMessage.id,
        status: 'delivered',
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`✅ Message sent successfully in conversation ${conversationId}`);
    } catch (error) {
      this.logger.error('Error sending message:', error.message);
      client.emit('message_error', {
        error: 'Failed to send message',
        details: error.message,
      });
    }
  }

  /**
   * Typing indicator
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const { conversationId, isTyping } = data;

    // Broadcast to others in the conversation (excluding sender)
    client.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId: client.userId,
      isTyping,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Mark message as read
   */
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; conversationId: string },
  ) {
    try {
      await this.chatService.markAsRead(client.userId as string, data.messageId);

      // Notify sender that message was read
      this.server.to(`conversation:${data.conversationId}`).emit('message_read', {
        messageId: data.messageId,
        conversationId: data.conversationId,
        userId: client.userId,
        timestamp: new Date().toISOString(),
      });

      // Acknowledge
      client.emit('marked_read', {
        messageId: data.messageId,
        status: 'success',
      });
    } catch (error) {
      this.logger.error('Error marking message as read:', error.message);
      client.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  /**
   * Get online status
   */
  @SubscribeMessage('check_online')
  handleCheckOnline(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string },
  ) {
    const isOnline = this.connectedUsers.has(data.userId);
    
    client.emit('online_status', {
      userId: data.userId,
      isOnline,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get all online users
   */
  @SubscribeMessage('get_online_users')
  handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    const onlineUsers = Array.from(this.connectedUsers.keys());
    
    client.emit('online_users_list', {
      users: onlineUsers,
      count: onlineUsers.length,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast user status change
   */
  private broadcastUserStatus(userId: string, isOnline: boolean) {
    this.server.emit('user_status_changed', {
      userId,
      isOnline,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Public method: Send notification to specific user
   */
  sendNotificationToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    
    if (socketId) {
      this.server.to(socketId).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(`📢 Notification sent to user ${userId} | Event: ${event}`);
      return true;
    } else {
      this.logger.warn(`⚠️ User ${userId} is not connected`);
      return false;
    }
  }

  /**
   * Public method: Broadcast to conversation
   */
  broadcastToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conversation:${conversationId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`📢 Broadcast to conversation ${conversationId} | Event: ${event}`);
  }

  /**
   * Public method: Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Public method: Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Public method: Get all connected user IDs
   */
  getConnectedUserIds(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Public method: Disconnect user
   */
  disconnectUser(userId: string): boolean {
    const socketId = this.connectedUsers.get(userId);
    
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
        this.logger.log(`🔌 Forcefully disconnected user ${userId}`);
        return true;
      }
    }
    
    return false;
  }
}
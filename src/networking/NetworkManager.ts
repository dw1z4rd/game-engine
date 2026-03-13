import { Logger } from '../core/Logger';
// Note: WebSocket import depends on environment
// For Node.js server: import * as WebSocket from 'ws'
// For browser: use native WebSocket
const WebSocketNode = typeof window !== 'undefined' ? window.WebSocket : (require('ws') as any).default;

/**
 * Network message interface
 */
export interface NetworkMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  sender?: string;
}

/**
 * Network event types
 */
export type NetworkEventType = 'connect' | 'disconnect' | 'message' | 'error' | 'close' | 'reconnect';

/**
 * Network event data
 */
export interface NetworkEvent {
  type: NetworkEventType;
  data: any;
  timestamp: number;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  url?: string;
  port?: number;
  secure?: boolean;
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  messageQueueSize?: number;
}

/**
 * WebSocket client wrapper for networking
 */
export class NetworkClient {
  public readonly id: string;
  public readonly url: string;
  public connected = false;
  public connecting = false;

  private socket: any = null;
  private messageQueue: NetworkMessage[] = [];
  private eventHandlers = new Map<NetworkEventType, ((event: NetworkEvent) => void)[]>();
  private reconnectAttempts = 0;

  constructor(id: string, url: string, private config: Required<NetworkConfig>) {
    this.id = id;
    this.url = url;
  }

  /**
   * Connect to server
   */
  async connect(): Promise<void> {
    if (this.connected || this.connecting) {
      return;
    }

    this.connecting = true;
    
    try {
      this.socket = new WebSocketNode(this.url);
      
      this.socket.onopen = () => {
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;
        this.emit('connect', { clientId: this.id });
        this.flushMessageQueue();
      };

      this.socket.onmessage = (event) => {
        try {
          const message: NetworkMessage = JSON.parse(event.data.toString());
          this.emit('message', message);
        } catch (error) {
          console.error('Failed to parse network message:', error);
        }
      };

      this.socket.onclose = () => {
        this.connected = false;
        this.connecting = false;
        this.emit('disconnect', { clientId: this.id });
        
        if (this.config.reconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
          setTimeout(() => this.reconnect(), this.config.reconnectDelay);
        }
      };

      this.socket.onerror = (error) => {
        this.emit('error', error);
      };

    } catch (error) {
      this.connecting = false;
      throw error;
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connected = false;
    this.connecting = false;
  }

  /**
   * Send a message to server
   */
  send(type: string, data: any): void {
    const message: NetworkMessage = {
      id: this.generateMessageId(),
      type,
      data,
      timestamp: Date.now(),
      sender: this.id,
    };

    if (this.connected && this.socket) {
      this.socket.send(JSON.stringify(message));
    } else {
      this.queueMessage(message);
    }
  }

  /**
   * Add event listener
   */
  on(type: NetworkEventType, handler: (event: NetworkEvent) => void): void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, []);
    }
    this.eventHandlers.get(type)!.push(handler);
  }

  /**
   * Remove event listener
   */
  off(type: NetworkEventType, handler: (event: NetworkEvent) => void): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(type: NetworkEventType, data: any): void {
    const event: NetworkEvent = {
      type,
      data,
      timestamp: Date.now(),
    };

    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  private queueMessage(message: NetworkMessage): void {
    this.messageQueue.push(message);
    
    // Limit queue size
    if (this.messageQueue.length > this.config.messageQueueSize) {
      this.messageQueue.shift();
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.connected && this.socket) {
      const message = this.messageQueue.shift()!;
      this.socket.send(JSON.stringify(message));
    }
  }

  private async reconnect(): Promise<void> {
    this.reconnectAttempts++;
    this.emit('reconnect', { attempt: this.reconnectAttempts });
    await this.connect();
  }

  private generateMessageId(): string {
    return `${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Network manager for handling multiple connections and protocols
 */
export class NetworkManager {
  private readonly logger: Logger;
  private readonly config: Required<NetworkConfig>;
  
  private clients = new Map<string, NetworkClient>();
  private server: any = null; // WebSocket server (optional)
  private heartbeatInterval: number | null = null;
  private isInitialized = false;

  constructor(logger: Logger, config: NetworkConfig = {}) {
    this.logger = logger;
    this.config = {
      url: 'ws://localhost:8080',
      port: 8080,
      secure: false,
      reconnect: true,
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      messageQueueSize: 100,
      ...config,
    };
  }

  /**
   * Initialize network manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Network manager already initialized');
      return;
    }

    try {
      // Start heartbeat interval
      if (this.config.heartbeatInterval > 0) {
        this.startHeartbeat();
      }

      this.isInitialized = true;
      this.logger.info('Network manager initialized');

    } catch (error) {
      this.logger.error('Failed to initialize network manager:', error);
      throw error;
    }
  }

  /**
   * Create a client connection
   */
  createClient(id: string, url?: string): NetworkClient {
    if (this.clients.has(id)) {
      this.logger.warn(`Client with id ${id} already exists`);
      return this.clients.get(id)!;
    }

    const clientUrl = url || this.config.url;
    const client = new NetworkClient(id, clientUrl, this.config);
    
    // Set up default event handlers
    client.on('connect', (event) => {
      this.logger.info(`Client ${id} connected`);
    });

    client.on('disconnect', (event) => {
      this.logger.info(`Client ${id} disconnected`);
    });

    client.on('error', (event) => {
      this.logger.error(`Client ${id} error:`, event.data);
    });

    this.clients.set(id, client);
    this.logger.debug(`Client created: ${id} -> ${clientUrl}`);
    
    return client;
  }

  /**
   * Get a client by ID
   */
  getClient(id: string): NetworkClient | undefined {
    return this.clients.get(id);
  }

  /**
   * Remove a client
   */
  removeClient(id: string): void {
    const client = this.clients.get(id);
    if (client) {
      client.disconnect();
      this.clients.delete(id);
      this.logger.debug(`Client removed: ${id}`);
    }
  }

  /**
   * Connect all clients
   */
  async connectAll(): Promise<void> {
    const promises = Array.from(this.clients.values()).map(client => client.connect());
    await Promise.all(promises);
    this.logger.info('All clients connected');
  }

  /**
   * Disconnect all clients
   */
  disconnectAll(): void {
    for (const client of this.clients.values()) {
      client.disconnect();
    }
    this.logger.info('All clients disconnected');
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(type: string, data: any): void {
    for (const client of this.clients.values()) {
      if (client.connected) {
        client.send(type, data);
      }
    }
    this.logger.debug(`Broadcast message: ${type}`);
  }

  /**
   * Create a simple server (optional, for peer-to-peer or server-client scenarios)
   */
  createServer(port?: number): any {
    if (this.server) {
      this.logger.warn('Server already exists');
      return this.server;
    }

    const serverPort = port || this.config.port;
    
    try {
      // Note: This would need server-side Node.js environment
      // For browser-only scenarios, this would be handled differently
      this.logger.info(`Server created on port ${serverPort}`);
      return null; // Placeholder - would need WebSocket server implementation
      
    } catch (error) {
      this.logger.error('Failed to create server:', error);
      throw error;
    }
  }

  /**
   * WebRTC peer connection setup (for peer-to-peer)
   */
  async createPeerConnection(config: RTCConfiguration = {}): Promise<RTCPeerConnection> {
    try {
      const peerConnection = new RTCPeerConnection(config);
      this.logger.debug('WebRTC peer connection created');
      return peerConnection;
    } catch (error) {
      this.logger.error('Failed to create WebRTC peer connection:', error);
      throw error;
    }
  }

  /**
   * Get network statistics
   */
  getNetworkStats(): any {
    const clients = Array.from(this.clients.values());
    
    return {
      totalClients: clients.length,
      connectedClients: clients.filter(c => c.connected).length,
      connectingClients: clients.filter(c => c.connecting).length,
      serverActive: !!this.server,
      heartbeatInterval: this.config.heartbeatInterval,
    };
  }

  /**
   * Update network manager (call each frame)
   */
  update(): void {
    // Handle any network-related updates
    // This can be used for connection monitoring, etc.
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  private sendHeartbeat(): void {
    this.broadcast('heartbeat', {
      timestamp: Date.now(),
      clientId: 'engine',
    });
  }

  /**
   * Dispose of network manager
   */
  dispose(): void {
    // Disconnect all clients
    this.disconnectAll();
    this.clients.clear();

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Close server
    if (this.server) {
      // Server cleanup would go here
      this.server = null;
    }

    this.isInitialized = false;
    this.logger.debug('Network manager disposed');
  }
}

/**
 * Network message types (standardized)
 */
export const NetworkMessageTypes = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  HEARTBEAT: 'heartbeat',
  
  // Game state
  ENTITY_UPDATE: 'entity_update',
  ENTITY_CREATE: 'entity_create',
  ENTITY_DESTROY: 'entity_destroy',
  
  // Player
  PLAYER_JOIN: 'player_join',
  PLAYER_LEAVE: 'player_leave',
  PLAYER_INPUT: 'player_input',
  PLAYER_STATE: 'player_state',
  
  // Chat
  CHAT_MESSAGE: 'chat_message',
  
  // Custom
  CUSTOM: 'custom',
} as const;
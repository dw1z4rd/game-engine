// Note: WebSocket import depends on environment
// For Node.js server: import * as WebSocket from 'ws'
// For browser: use native WebSocket
const WebSocketNode = typeof window !== 'undefined' ? window.WebSocket : require('ws').default;
/**
 * WebSocket client wrapper for networking
 */
export class NetworkClient {
    constructor(id, url, config) {
        this.config = config;
        this.connected = false;
        this.connecting = false;
        this.socket = null;
        this.messageQueue = [];
        this.eventHandlers = new Map();
        this.reconnectAttempts = 0;
        this.id = id;
        this.url = url;
    }
    /**
     * Connect to server
     */
    async connect() {
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
                    const message = JSON.parse(event.data.toString());
                    this.emit('message', message);
                }
                catch (error) {
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
        }
        catch (error) {
            this.connecting = false;
            throw error;
        }
    }
    /**
     * Disconnect from server
     */
    disconnect() {
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
    send(type, data) {
        const message = {
            id: this.generateMessageId(),
            type,
            data,
            timestamp: Date.now(),
            sender: this.id,
        };
        if (this.connected && this.socket) {
            this.socket.send(JSON.stringify(message));
        }
        else {
            this.queueMessage(message);
        }
    }
    /**
     * Add event listener
     */
    on(type, handler) {
        if (!this.eventHandlers.has(type)) {
            this.eventHandlers.set(type, []);
        }
        this.eventHandlers.get(type).push(handler);
    }
    /**
     * Remove event listener
     */
    off(type, handler) {
        const handlers = this.eventHandlers.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }
    emit(type, data) {
        const event = {
            type,
            data,
            timestamp: Date.now(),
        };
        const handlers = this.eventHandlers.get(type);
        if (handlers) {
            handlers.forEach(handler => handler(event));
        }
    }
    queueMessage(message) {
        this.messageQueue.push(message);
        // Limit queue size
        if (this.messageQueue.length > this.config.messageQueueSize) {
            this.messageQueue.shift();
        }
    }
    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.connected && this.socket) {
            const message = this.messageQueue.shift();
            this.socket.send(JSON.stringify(message));
        }
    }
    async reconnect() {
        this.reconnectAttempts++;
        this.emit('reconnect', { attempt: this.reconnectAttempts });
        await this.connect();
    }
    generateMessageId() {
        return `${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
/**
 * Network manager for handling multiple connections and protocols
 */
export class NetworkManager {
    constructor(logger, config = {}) {
        this.clients = new Map();
        this.server = null; // WebSocket server (optional)
        this.heartbeatInterval = null;
        this.isInitialized = false;
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
    async initialize() {
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
        }
        catch (error) {
            this.logger.error('Failed to initialize network manager:', error);
            throw error;
        }
    }
    /**
     * Create a client connection
     */
    createClient(id, url) {
        if (this.clients.has(id)) {
            this.logger.warn(`Client with id ${id} already exists`);
            return this.clients.get(id);
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
    getClient(id) {
        return this.clients.get(id);
    }
    /**
     * Remove a client
     */
    removeClient(id) {
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
    async connectAll() {
        const promises = Array.from(this.clients.values()).map(client => client.connect());
        await Promise.all(promises);
        this.logger.info('All clients connected');
    }
    /**
     * Disconnect all clients
     */
    disconnectAll() {
        for (const client of this.clients.values()) {
            client.disconnect();
        }
        this.logger.info('All clients disconnected');
    }
    /**
     * Broadcast message to all connected clients
     */
    broadcast(type, data) {
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
    createServer(port) {
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
        }
        catch (error) {
            this.logger.error('Failed to create server:', error);
            throw error;
        }
    }
    /**
     * WebRTC peer connection setup (for peer-to-peer)
     */
    async createPeerConnection(config = {}) {
        try {
            const peerConnection = new RTCPeerConnection(config);
            this.logger.debug('WebRTC peer connection created');
            return peerConnection;
        }
        catch (error) {
            this.logger.error('Failed to create WebRTC peer connection:', error);
            throw error;
        }
    }
    /**
     * Get network statistics
     */
    getNetworkStats() {
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
    update() {
        // Handle any network-related updates
        // This can be used for connection monitoring, etc.
    }
    startHeartbeat() {
        this.heartbeatInterval = window.setInterval(() => {
            this.sendHeartbeat();
        }, this.config.heartbeatInterval);
    }
    sendHeartbeat() {
        this.broadcast('heartbeat', {
            timestamp: Date.now(),
            clientId: 'engine',
        });
    }
    /**
     * Dispose of network manager
     */
    dispose() {
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
};
//# sourceMappingURL=NetworkManager.js.map
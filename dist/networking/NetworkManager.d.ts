import { Logger } from '../core/Logger';
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
export declare class NetworkClient {
    private config;
    readonly id: string;
    readonly url: string;
    connected: boolean;
    connecting: boolean;
    private socket;
    private messageQueue;
    private eventHandlers;
    private reconnectAttempts;
    constructor(id: string, url: string, config: Required<NetworkConfig>);
    /**
     * Connect to server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from server
     */
    disconnect(): void;
    /**
     * Send a message to server
     */
    send(type: string, data: any): void;
    /**
     * Add event listener
     */
    on(type: NetworkEventType, handler: (event: NetworkEvent) => void): void;
    /**
     * Remove event listener
     */
    off(type: NetworkEventType, handler: (event: NetworkEvent) => void): void;
    private emit;
    private queueMessage;
    private flushMessageQueue;
    private reconnect;
    private generateMessageId;
}
/**
 * Network manager for handling multiple connections and protocols
 */
export declare class NetworkManager {
    private readonly logger;
    private readonly config;
    private clients;
    private server;
    private heartbeatInterval;
    private isInitialized;
    constructor(logger: Logger, config?: NetworkConfig);
    /**
     * Initialize network manager
     */
    initialize(): Promise<void>;
    /**
     * Create a client connection
     */
    createClient(id: string, url?: string): NetworkClient;
    /**
     * Get a client by ID
     */
    getClient(id: string): NetworkClient | undefined;
    /**
     * Remove a client
     */
    removeClient(id: string): void;
    /**
     * Connect all clients
     */
    connectAll(): Promise<void>;
    /**
     * Disconnect all clients
     */
    disconnectAll(): void;
    /**
     * Broadcast message to all connected clients
     */
    broadcast(type: string, data: any): void;
    /**
     * Create a simple server (optional, for peer-to-peer or server-client scenarios)
     */
    createServer(port?: number): any;
    /**
     * WebRTC peer connection setup (for peer-to-peer)
     */
    createPeerConnection(config?: RTCConfiguration): Promise<RTCPeerConnection>;
    /**
     * Get network statistics
     */
    getNetworkStats(): any;
    /**
     * Update network manager (call each frame)
     */
    update(): void;
    private startHeartbeat;
    private sendHeartbeat;
    /**
     * Dispose of network manager
     */
    dispose(): void;
}
/**
 * Network message types (standardized)
 */
export declare const NetworkMessageTypes: {
    readonly CONNECT: "connect";
    readonly DISCONNECT: "disconnect";
    readonly HEARTBEAT: "heartbeat";
    readonly ENTITY_UPDATE: "entity_update";
    readonly ENTITY_CREATE: "entity_create";
    readonly ENTITY_DESTROY: "entity_destroy";
    readonly PLAYER_JOIN: "player_join";
    readonly PLAYER_LEAVE: "player_leave";
    readonly PLAYER_INPUT: "player_input";
    readonly PLAYER_STATE: "player_state";
    readonly CHAT_MESSAGE: "chat_message";
    readonly CUSTOM: "custom";
};
//# sourceMappingURL=NetworkManager.d.ts.map
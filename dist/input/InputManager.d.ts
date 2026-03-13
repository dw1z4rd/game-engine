import * as THREE from 'three';
import { Logger } from '../core/Logger';
/**
 * Input event data
 */
export interface InputEvent {
    type: string;
    timestamp: number;
    data?: any;
}
/**
 * Keyboard state
 */
export interface KeyboardState {
    [key: string]: boolean;
}
/**
 * Mouse state
 */
export interface MouseState {
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
    leftButton: boolean;
    rightButton: boolean;
    middleButton: boolean;
    wheelDelta: number;
}
/**
 * Gamepad state
 */
export interface GamepadState {
    connected: boolean;
    index: number;
    axes: number[];
    buttons: boolean[];
}
/**
 * Touch state
 */
export interface TouchState {
    touches: TouchPoint[];
    active: boolean;
}
export interface TouchPoint {
    id: number;
    x: number;
    y: number;
    force: number;
}
/**
 * Input action configuration
 */
export interface InputAction {
    name: string;
    type: 'keyboard' | 'mouse' | 'gamepad' | 'touch';
    inputs: string[];
    callback?: (event: InputEvent) => void;
}
/**
 * Comprehensive input management system
 */
export declare class InputManager {
    private readonly domElement;
    private readonly logger;
    private keyboard;
    private mouse;
    private gamepads;
    private touch;
    private lastMouseX;
    private lastMouseY;
    private actions;
    private eventListeners;
    private isInitialized;
    constructor(domElement: HTMLElement, logger: Logger);
    /**
     * Get keyboard state
     */
    get keyboardState(): Readonly<KeyboardState>;
    /**
     * Get mouse state
     */
    get mouseState(): Readonly<MouseState>;
    /**
     * Get gamepad states
     */
    get gamepadStates(): ReadonlyArray<GamepadState>;
    /**
     * Get touch state
     */
    get touchState(): Readonly<TouchState>;
    /**
     * Initialize input system
     */
    initialize(): void;
    /**
     * Update input state (call once per frame)
     */
    update(): void;
    /**
     * Check if a key is currently pressed
     */
    isKeyPressed(key: string): boolean;
    /**
     * Check if a mouse button is pressed
     */
    isMouseButtonPressed(button: 'left' | 'right' | 'middle'): boolean;
    /**
     * Get mouse position relative to viewport
     */
    getMousePosition(): THREE.Vector2;
    /**
     * Get mouse position relative to canvas
     */
    getMouseCanvasPosition(): THREE.Vector2;
    /**
     * Get normalized mouse coordinates (-1 to 1)
     */
    getMouseNormalized(): THREE.Vector2;
    /**
     * Check if a gamepad is connected
     */
    isGamepadConnected(index?: number): boolean;
    /**
     * Get gamepad axis value
     */
    getGamepadAxis(gamepadIndex: number, axisIndex: number): number;
    /**
     * Check if gamepad button is pressed
     */
    isGamepadButtonPressed(gamepadIndex: number, buttonIndex: number): boolean;
    /**
     * Get active touch points
     */
    getActiveTouches(): TouchPoint[];
    /**
     * Register an input action
     */
    registerAction(action: InputAction): void;
    /**
     * Unregister an input action
     */
    unregisterAction(actionName: string): void;
    /**
     * Set cursor lock state
     */
    setCursorLock(locked: boolean): void;
    /**
     * Check if cursor is locked
     */
    isCursorLocked(): boolean;
    private setupKeyboardEvents;
    private setupMouseEvents;
    private setupGamepadEvents;
    private setupTouchEvents;
    private updateGamepads;
    private updateTouchPoints;
    private triggerAction;
    /**
     * Dispose of input resources
     */
    dispose(): void;
}
//# sourceMappingURL=InputManager.d.ts.map
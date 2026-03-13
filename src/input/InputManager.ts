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
export class InputManager {
  private readonly domElement: HTMLElement;
  private readonly logger: Logger;
  
  private keyboard: KeyboardState = {};
  private mouse: MouseState = {
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    leftButton: false,
    rightButton: false,
    middleButton: false,
    wheelDelta: 0,
  };
  private gamepads: GamepadState[] = [];
  private touch: TouchState = {
    touches: [],
    active: false,
  };

  private lastMouseX = 0;
  private lastMouseY = 0;
  private actions = new Map<string, InputAction>();
  private eventListeners: (() => void)[] = [];
  private isInitialized = false;

  constructor(domElement: HTMLElement, logger: Logger) {
    this.domElement = domElement;
    this.logger = logger;
  }

  /**
   * Get keyboard state
   */
  get keyboardState(): Readonly<KeyboardState> {
    return this.keyboard;
  }

  /**
   * Get mouse state
   */
  get mouseState(): Readonly<MouseState> {
    return this.mouse;
  }

  /**
   * Get gamepad states
   */
  get gamepadStates(): ReadonlyArray<GamepadState> {
    return this.gamepads;
  }

  /**
   * Get touch state
   */
  get touchState(): Readonly<TouchState> {
    return this.touch;
  }

  /**
   * Initialize input system
   */
  initialize(): void {
    if (this.isInitialized) {
      this.logger.warn('Input manager already initialized');
      return;
    }

    this.setupKeyboardEvents();
    this.setupMouseEvents();
    this.setupGamepadEvents();
    this.setupTouchEvents();

    this.isInitialized = true;
    this.logger.debug('Input manager initialized');
  }

  /**
   * Update input state (call once per frame)
   */
  update(): void {
    // Reset mouse delta
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    this.mouse.wheelDelta = 0;

    // Update gamepads
    this.updateGamepads();
  }

  /**
   * Check if a key is currently pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keyboard[key.toLowerCase()] || false;
  }

  /**
   * Check if a mouse button is pressed
   */
  isMouseButtonPressed(button: 'left' | 'right' | 'middle'): boolean {
    switch (button) {
      case 'left': return this.mouse.leftButton;
      case 'right': return this.mouse.rightButton;
      case 'middle': return this.mouse.middleButton;
      default: return false;
    }
  }

  /**
   * Get mouse position relative to viewport
   */
  getMousePosition(): THREE.Vector2 {
    return new THREE.Vector2(this.mouse.x, this.mouse.y);
  }

  /**
   * Get mouse position relative to canvas
   */
  getMouseCanvasPosition(): THREE.Vector2 {
    const rect = this.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      this.mouse.x - rect.left,
      this.mouse.y - rect.top
    );
  }

  /**
   * Get normalized mouse coordinates (-1 to 1)
   */
  getMouseNormalized(): THREE.Vector2 {
    const rect = this.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((this.mouse.x - rect.left) / rect.width) * 2 - 1,
      -((this.mouse.y - rect.top) / rect.height) * 2 + 1
    );
  }

  /**
   * Check if a gamepad is connected
   */
  isGamepadConnected(index = 0): boolean {
    return index < this.gamepads.length && this.gamepads[index].connected;
  }

  /**
   * Get gamepad axis value
   */
  getGamepadAxis(gamepadIndex: number, axisIndex: number): number {
    if (!this.isGamepadConnected(gamepadIndex)) return 0;
    return this.gamepads[gamepadIndex].axes[axisIndex] || 0;
  }

  /**
   * Check if gamepad button is pressed
   */
  isGamepadButtonPressed(gamepadIndex: number, buttonIndex: number): boolean {
    if (!this.isGamepadConnected(gamepadIndex)) return false;
    return this.gamepads[gamepadIndex].buttons[buttonIndex] || false;
  }

  /**
   * Get active touch points
   */
  getActiveTouches(): TouchPoint[] {
    return this.touch.touches.filter(touch => touch.force > 0);
  }

  /**
   * Register an input action
   */
  registerAction(action: InputAction): void {
    this.actions.set(action.name, action);
    this.logger.debug(`Input action registered: ${action.name}`);
  }

  /**
   * Unregister an input action
   */
  unregisterAction(actionName: string): void {
    if (this.actions.delete(actionName)) {
      this.logger.debug(`Input action unregistered: ${actionName}`);
    }
  }

  /**
   * Set cursor lock state
   */
  setCursorLock(locked: boolean): void {
    if (locked) {
      this.domElement.requestPointerLock();
    } else {
      document.exitPointerLock();
    }
  }

  /**
   * Check if cursor is locked
   */
  isCursorLocked(): boolean {
    return document.pointerLockElement === this.domElement;
  }

  private setupKeyboardEvents(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.code.toLowerCase();
      this.keyboard[key] = true;
      this.triggerAction('keyboard', key, event);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.code.toLowerCase();
      this.keyboard[key] = false;
      this.triggerAction('keyboard', key, event);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    this.eventListeners.push(() => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    });
  }

  private setupMouseEvents(): void {
    const handleMouseMove = (event: MouseEvent) => {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
      this.mouse.deltaX = event.clientX - this.lastMouseX;
      this.mouse.deltaY = event.clientY - this.lastMouseY;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    };

    const handleMouseDown = (event: MouseEvent) => {
      switch (event.button) {
        case 0: this.mouse.leftButton = true; break;
        case 1: this.mouse.middleButton = true; break;
        case 2: this.mouse.rightButton = true; break;
      }
      this.triggerAction('mouse', `button${event.button}`, event);
    };

    const handleMouseUp = (event: MouseEvent) => {
      switch (event.button) {
        case 0: this.mouse.leftButton = false; break;
        case 1: this.mouse.middleButton = false; break;
        case 2: this.mouse.rightButton = false; break;
      }
      this.triggerAction('mouse', `button${event.button}`, event);
    };

    const handleWheel = (event: WheelEvent) => {
      this.mouse.wheelDelta = event.deltaY;
      this.triggerAction('mouse', 'wheel', event);
    };

    this.domElement.addEventListener('mousemove', handleMouseMove);
    this.domElement.addEventListener('mousedown', handleMouseDown);
    this.domElement.addEventListener('mouseup', handleMouseUp);
    this.domElement.addEventListener('wheel', handleWheel);

    this.eventListeners.push(() => {
      this.domElement.removeEventListener('mousemove', handleMouseMove);
      this.domElement.removeEventListener('mousedown', handleMouseDown);
      this.domElement.removeEventListener('mouseup', handleMouseUp);
      this.domElement.removeEventListener('wheel', handleWheel);
    });
  }

  private setupGamepadEvents(): void {
    const handleGamepadConnected = (event: GamepadEvent) => {
      this.logger.debug(`Gamepad connected: ${event.gamepad.index}`);
    };

    const handleGamepadDisconnected = (event: GamepadEvent) => {
      this.logger.debug(`Gamepad disconnected: ${event.gamepad.index}`);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    this.eventListeners.push(() => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    });
  }

  private setupTouchEvents(): void {
    const handleTouchStart = (event: TouchEvent) => {
      this.touch.active = true;
      this.updateTouchPoints(event);
      this.triggerAction('touch', 'start', event);
    };

    const handleTouchMove = (event: TouchEvent) => {
      this.updateTouchPoints(event);
      this.triggerAction('touch', 'move', event);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      this.updateTouchPoints(event);
      if (this.touch.touches.length === 0) {
        this.touch.active = false;
      }
      this.triggerAction('touch', 'end', event);
    };

    this.domElement.addEventListener('touchstart', handleTouchStart);
    this.domElement.addEventListener('touchmove', handleTouchMove);
    this.domElement.addEventListener('touchend', handleTouchEnd);

    this.eventListeners.push(() => {
      this.domElement.removeEventListener('touchstart', handleTouchStart);
      this.domElement.removeEventListener('touchmove', handleTouchMove);
      this.domElement.removeEventListener('touchend', handleTouchEnd);
    });
  }

  private updateGamepads(): void {
    const gamepads = navigator.getGamepads();
    
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      
      if (!gamepad) {
        if (i < this.gamepads.length) {
          this.gamepads[i].connected = false;
        }
        continue;
      }

      if (i >= this.gamepads.length) {
        this.gamepads.push({
          connected: false,
          index: i,
          axes: [],
          buttons: [],
        });
      }

      const state = this.gamepads[i];
      state.connected = true;
      state.index = i;
      state.axes = Array.from(gamepad.axes);
      state.buttons = Array.from(gamepad.buttons).map(button => button.pressed);
    }
  }

  private updateTouchPoints(event: TouchEvent): void {
    this.touch.touches = Array.from(event.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      force: touch.force || 0,
    }));
  }

  private triggerAction(type: string, input: string, event: Event): void {
    for (const action of this.actions.values()) {
      if (action.type === type && action.inputs.includes(input)) {
        const inputEvent: InputEvent = {
          type: action.name,
          timestamp: performance.now(),
          data: event,
        };
        action.callback?.(inputEvent);
      }
    }
  }

  /**
   * Dispose of input resources
   */
  dispose(): void {
    // Remove all event listeners
    for (const removeListener of this.eventListeners) {
      removeListener();
    }
    this.eventListeners.length = 0;

    // Clear states
    this.keyboard = {};
    this.gamepads.length = 0;
    this.touch.touches.length = 0;
    this.touch.active = false;

    // Clear actions
    this.actions.clear();

    this.isInitialized = false;
    this.logger.debug('Input manager disposed');
  }
}
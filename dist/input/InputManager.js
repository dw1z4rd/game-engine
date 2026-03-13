import * as THREE from 'three';
/**
 * Comprehensive input management system
 */
export class InputManager {
    constructor(domElement, logger) {
        this.keyboard = {};
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            leftButton: false,
            rightButton: false,
            middleButton: false,
            wheelDelta: 0,
        };
        this.gamepads = [];
        this.touch = {
            touches: [],
            active: false,
        };
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.actions = new Map();
        this.eventListeners = [];
        this.isInitialized = false;
        this.domElement = domElement;
        this.logger = logger;
    }
    /**
     * Get keyboard state
     */
    get keyboardState() {
        return this.keyboard;
    }
    /**
     * Get mouse state
     */
    get mouseState() {
        return this.mouse;
    }
    /**
     * Get gamepad states
     */
    get gamepadStates() {
        return this.gamepads;
    }
    /**
     * Get touch state
     */
    get touchState() {
        return this.touch;
    }
    /**
     * Initialize input system
     */
    initialize() {
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
    update() {
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
    isKeyPressed(key) {
        return this.keyboard[key.toLowerCase()] || false;
    }
    /**
     * Check if a mouse button is pressed
     */
    isMouseButtonPressed(button) {
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
    getMousePosition() {
        return new THREE.Vector2(this.mouse.x, this.mouse.y);
    }
    /**
     * Get mouse position relative to canvas
     */
    getMouseCanvasPosition() {
        const rect = this.domElement.getBoundingClientRect();
        return new THREE.Vector2(this.mouse.x - rect.left, this.mouse.y - rect.top);
    }
    /**
     * Get normalized mouse coordinates (-1 to 1)
     */
    getMouseNormalized() {
        const rect = this.domElement.getBoundingClientRect();
        return new THREE.Vector2(((this.mouse.x - rect.left) / rect.width) * 2 - 1, -((this.mouse.y - rect.top) / rect.height) * 2 + 1);
    }
    /**
     * Check if a gamepad is connected
     */
    isGamepadConnected(index = 0) {
        return index < this.gamepads.length && this.gamepads[index].connected;
    }
    /**
     * Get gamepad axis value
     */
    getGamepadAxis(gamepadIndex, axisIndex) {
        if (!this.isGamepadConnected(gamepadIndex))
            return 0;
        return this.gamepads[gamepadIndex].axes[axisIndex] || 0;
    }
    /**
     * Check if gamepad button is pressed
     */
    isGamepadButtonPressed(gamepadIndex, buttonIndex) {
        if (!this.isGamepadConnected(gamepadIndex))
            return false;
        return this.gamepads[gamepadIndex].buttons[buttonIndex] || false;
    }
    /**
     * Get active touch points
     */
    getActiveTouches() {
        return this.touch.touches.filter(touch => touch.force > 0);
    }
    /**
     * Register an input action
     */
    registerAction(action) {
        this.actions.set(action.name, action);
        this.logger.debug(`Input action registered: ${action.name}`);
    }
    /**
     * Unregister an input action
     */
    unregisterAction(actionName) {
        if (this.actions.delete(actionName)) {
            this.logger.debug(`Input action unregistered: ${actionName}`);
        }
    }
    /**
     * Set cursor lock state
     */
    setCursorLock(locked) {
        if (locked) {
            this.domElement.requestPointerLock();
        }
        else {
            document.exitPointerLock();
        }
    }
    /**
     * Check if cursor is locked
     */
    isCursorLocked() {
        return document.pointerLockElement === this.domElement;
    }
    setupKeyboardEvents() {
        const handleKeyDown = (event) => {
            const key = event.code.toLowerCase();
            this.keyboard[key] = true;
            this.triggerAction('keyboard', key, event);
        };
        const handleKeyUp = (event) => {
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
    setupMouseEvents() {
        const handleMouseMove = (event) => {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
            this.mouse.deltaX = event.clientX - this.lastMouseX;
            this.mouse.deltaY = event.clientY - this.lastMouseY;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        };
        const handleMouseDown = (event) => {
            switch (event.button) {
                case 0:
                    this.mouse.leftButton = true;
                    break;
                case 1:
                    this.mouse.middleButton = true;
                    break;
                case 2:
                    this.mouse.rightButton = true;
                    break;
            }
            this.triggerAction('mouse', `button${event.button}`, event);
        };
        const handleMouseUp = (event) => {
            switch (event.button) {
                case 0:
                    this.mouse.leftButton = false;
                    break;
                case 1:
                    this.mouse.middleButton = false;
                    break;
                case 2:
                    this.mouse.rightButton = false;
                    break;
            }
            this.triggerAction('mouse', `button${event.button}`, event);
        };
        const handleWheel = (event) => {
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
    setupGamepadEvents() {
        const handleGamepadConnected = (event) => {
            this.logger.debug(`Gamepad connected: ${event.gamepad.index}`);
        };
        const handleGamepadDisconnected = (event) => {
            this.logger.debug(`Gamepad disconnected: ${event.gamepad.index}`);
        };
        window.addEventListener('gamepadconnected', handleGamepadConnected);
        window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
        this.eventListeners.push(() => {
            window.removeEventListener('gamepadconnected', handleGamepadConnected);
            window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
        });
    }
    setupTouchEvents() {
        const handleTouchStart = (event) => {
            this.touch.active = true;
            this.updateTouchPoints(event);
            this.triggerAction('touch', 'start', event);
        };
        const handleTouchMove = (event) => {
            this.updateTouchPoints(event);
            this.triggerAction('touch', 'move', event);
        };
        const handleTouchEnd = (event) => {
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
    updateGamepads() {
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
    updateTouchPoints(event) {
        this.touch.touches = Array.from(event.touches).map(touch => ({
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY,
            force: touch.force || 0,
        }));
    }
    triggerAction(type, input, event) {
        for (const action of this.actions.values()) {
            if (action.type === type && action.inputs.includes(input)) {
                const inputEvent = {
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
    dispose() {
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
//# sourceMappingURL=InputManager.js.map
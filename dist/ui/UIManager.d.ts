import { Logger } from '../core/Logger';
/**
 * UI element types
 */
export declare enum UIElementType {
    TEXT = "text",
    BUTTON = "button",
    IMAGE = "image",
    PANEL = "panel",
    PROGRESS_BAR = "progress_bar",
    INPUT_FIELD = "input_field",
    CHECKBOX = "checkbox",
    SLIDER = "slider"
}
/**
 * UI element configuration
 */
export interface UIElementConfig {
    id: string;
    type: UIElementType;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    visible?: boolean;
    interactive?: boolean;
    style?: Partial<CSSStyleDeclaration> | Record<string, string>;
    onClick?: () => void;
    onHover?: () => void;
    onUpdate?: (deltaTime: number) => void;
}
/**
 * UI element class
 */
export declare class UIElement {
    readonly id: string;
    readonly type: UIElementType;
    element: HTMLElement;
    visible: boolean;
    interactive: boolean;
    constructor(config: UIElementConfig);
    private createElement;
    private setupEvents;
    /**
     * Update element position
     */
    setPosition(x: number, y: number): void;
    /**
     * Update element size
     */
    setSize(width: number, height: number): void;
    /**
     * Update text content
     */
    setText(text: string): void;
    /**
     * Update progress bar value (0-1)
     */
    setProgress(value: number): void;
    /**
     * Show element
     */
    show(): void;
    /**
     * Hide element
     */
    hide(): void;
    /**
     * Remove element
     */
    remove(): void;
}
/**
 * UI Manager for HUD and interface elements
 */
export declare class UIManager {
    private readonly logger;
    private readonly container;
    private elements;
    private screens;
    private activeScreen;
    constructor(logger: Logger);
    /**
     * Create a UI element
     */
    createElement(config: UIElementConfig): UIElement;
    /**
     * Get a UI element by ID
     */
    getElement(id: string): UIElement | undefined;
    /**
     * Remove a UI element
     */
    removeElement(id: string): void;
    /**
     * Create a screen (collection of UI elements)
     */
    createScreen(name: string, elements: UIElement[]): void;
    /**
     * Show a screen
     */
    showScreen(name: string): void;
    /**
     * Hide current screen
     */
    hideScreen(): void;
    /**
     * Create HUD elements
     */
    createHUD(): void;
    /**
     * Update HUD elements
     */
    updateHUD(fps: number, health?: number): void;
    /**
     * Show notification
     */
    showNotification(message: string, duration?: number): void;
    /**
     * Create menu
     */
    createMenu(title: string, options: Array<{
        text: string;
        action: () => void;
    }>): void;
    /**
     * Update all UI elements
     */
    update(deltaTime: number): void;
    /**
     * Handle window resize
     */
    handleResize(): void;
    /**
     * Clear all UI elements
     */
    clear(): void;
    /**
     * Dispose of UI manager
     */
    dispose(): void;
}
//# sourceMappingURL=UIManager.d.ts.map